package com.example.backend.service;

import com.example.backend.entity.Order;
import com.example.backend.entity.Payment;
import com.example.backend.enums.PaymentStatus;
import com.example.backend.enums.OrderStatus;
import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.PaymentRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class VnpayService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;

    // Tiêm cấu hình từ application.yml
    @Value("${spring.vnpay.url}")
    private String vnp_PayUrl;

    @Value("${spring.vnpay.returnUrl}")
    private String vnp_ReturnUrl;

    @Value("${spring.vnpay.tmnCode}")
    private String vnp_TmnCode;

    @Value("${spring.vnpay.hashSecret}")
    private String vnp_HashSecret;

    @Value("${spring.vnpay.version}")
    private String vnp_Version;

    @Value("${spring.vnpay.command}")
    private String vnp_Command;

    @Value("${spring.vnpay.currCode}")
    private String vnp_CurrCode;

    /**
     * TẠO URL THANH TOÁN (Gửi sang VNPay)
     */
    public String createPaymentUrl(Order order, HttpServletRequest request) {
        long amount = order.getFinalAmount().multiply(new java.math.BigDecimal(100)).longValue();

        String vnp_TxnRef = order.getCode();
        String vnp_IpAddr = getIpAddress(request);

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", vnp_CurrCode);
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang: " + vnp_TxnRef);
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnp_ReturnUrl);
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        // Định dạng thời gian (Asia/Ho_Chi_Minh)
        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        // Hết hạn sau 15 phút
        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        // Sắp xếp tham số và Build Hash Data
        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        for (Iterator<String> itr = fieldNames.iterator(); itr.hasNext();) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                // Build Hash
                hashData.append(fieldName).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                // Build Query
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII)).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }

        String vnp_SecureHash = hmacSHA512(vnp_HashSecret, hashData.toString());
        String paymentUrl =vnp_PayUrl + "?" + query.toString() + "&vnp_SecureHash=" + vnp_SecureHash;

        log.info("VNPAY Payment URL created for order {}: {}", vnp_TxnRef, paymentUrl);
        return paymentUrl;
    }

    /**
     * XỬ LÝ KẾT QUẢ TRẢ VỀ (Callback từ VNPay)
     */
    @Transactional
    public void processCallback(Map<String, String> params) {
        String vnp_ResponseCode = params.get("vnp_ResponseCode");
        String orderCode = params.get("vnp_TxnRef");

        // 1. Kiểm tra đơn hàng
        Order order = orderRepository.findByCode(orderCode)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderCode));

        // 2. Tìm dòng thanh toán PENDING của order này
        Payment payment = order.getPayments().stream()
                .filter(p -> p.getStatus() == PaymentStatus.PENDING)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No pending payment found for order: " + orderCode));

        // 3. Cập nhật trạng thái dựa trên mã phản hồi VNPay
        if ("00".equals(vnp_ResponseCode)) {
            log.info("Payment success for order: {}", orderCode);
            payment.setStatus(PaymentStatus.COMPLETED);
            payment.setCreatedAt(LocalDateTime.now());
            order.setOrderStatus(OrderStatus.COMPLETED); // Đơn hàng đã thanh toán
        } else {
            log.warn("Payment failed for order: {}, code: {}", orderCode, vnp_ResponseCode);
            payment.setStatus(PaymentStatus.FAILED);
            // Lưu ý: Không hoàn kho ở đây, để khách có thể nhấn "Thử lại" hoặc Admin xử lý sau.
        }

        paymentRepository.save(payment);
        orderRepository.save(order);
    }

    // ================= HELPER METHODS =================

    private String hmacSHA512(final String key, final String data) {
        try {
            final Mac hmac512 = Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes();
            final SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            hmac512.init(secretKey);
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] result = hmac512.doFinal(dataBytes);
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception ex) {
            log.error("HmacSHA512 Error: ", ex);
            return "";
        }
    }

    private String getIpAddress(HttpServletRequest request) {
        String ipAddress = request.getHeader("X-FORWARDED-FOR");
        if (ipAddress == null) {
            ipAddress = request.getRemoteAddr();
        }
        // Nếu là localhost IPv6, đổi thành IPv4 chuẩn
        if ("0:0:0:0:0:0:0:1".equals(ipAddress)) {
            ipAddress = "127.0.0.1";
        }
        return ipAddress;
    }
}

//package com.example.backend.service;
//
//import com.example.backend.entity.Order;
//import com.example.backend.entity.Payment;
//import com.example.backend.enums.PaymentStatus;
//import com.example.backend.enums.OrderStatus;
//import com.example.backend.repository.OrderRepository;
//import com.example.backend.repository.PaymentRepository;
//import jakarta.servlet.http.HttpServletRequest;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import javax.crypto.Mac;
//import javax.crypto.spec.SecretKeySpec;
//import java.net.URLEncoder;
//import java.nio.charset.StandardCharsets;
//import java.text.SimpleDateFormat;
//import java.time.LocalDateTime;
//import java.util.*;
//
//@Slf4j
//@Service
//@RequiredArgsConstructor
//public class VnpayService {
//
//    private final OrderRepository orderRepository;
//    private final PaymentRepository paymentRepository;
//
//    // Tiêm cấu hình từ application.yml
//    @Value("${spring.vnpay.url}")
//    private String vnp_PayUrl;
//
//    @Value("${spring.vnpay.returnUrl}")
//    private String vnp_ReturnUrl;
//
//    @Value("${spring.vnpay.tmnCode}")
//    private String vnp_TmnCode;
//
//    @Value("${spring.vnpay.hashSecret}")
//    private String vnp_HashSecret;
//
//    @Value("${spring.vnpay.version}")
//    private String vnp_Version;
//
//    @Value("${spring.vnpay.command}")
//    private String vnp_Command;
//
//    @Value("${spring.vnpay.currCode}")
//    private String vnp_CurrCode;
//
//    /**
//     * TẠO URL THANH TOÁN (Gửi sang VNPay)
//     */
//    public String createPaymentUrl(long amount, HttpServletRequest request) {
//        // VNPay quy định số tiền nhân 100 (để bỏ phần thập phân)
//
//        String vnp_TxnRef = "OR-123456"; // Dùng Order Code làm mã giao dịch
//        String vnp_IpAddr = getIpAddress(request);
//
//        Map<String, String> vnp_Params = new HashMap<>();
//        vnp_Params.put("vnp_Version", vnp_Version);
//        vnp_Params.put("vnp_Command", vnp_Command);
//        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
//        vnp_Params.put("vnp_Amount", String.valueOf(amount * 100));
//        vnp_Params.put("vnp_CurrCode", vnp_CurrCode);
//        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
//        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang: " + vnp_TxnRef);
//        vnp_Params.put("vnp_OrderType", "other");
//        vnp_Params.put("vnp_Locale", "vn");
////        vnp_Params.put("vnp_BankCode", "NCB");
//        vnp_Params.put("vnp_ReturnUrl", vnp_ReturnUrl);
//        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);
//
//        // Định dạng thời gian (Asia/Ho_Chi_Minh)
//        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
//        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
//        String vnp_CreateDate = formatter.format(cld.getTime());
//        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
//
//        // Hết hạn sau 15 phút
//        cld.add(Calendar.MINUTE, 15);
//        String vnp_ExpireDate = formatter.format(cld.getTime());
//        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);
//
//        // Sắp xếp tham số và Build Hash Data
//        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
//        Collections.sort(fieldNames);
//        StringBuilder hashData = new StringBuilder();
//        StringBuilder query = new StringBuilder();
//
//        for (Iterator<String> itr = fieldNames.iterator(); itr.hasNext();) {
//            String fieldName = itr.next();
//            String fieldValue = vnp_Params.get(fieldName);
//            if ((fieldValue != null) && (fieldValue.length() > 0)) {
//                // Build Hash
//                hashData.append(fieldName).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
//                // Build Query
//                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII)).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
//                if (itr.hasNext()) {
//                    query.append('&');
//                    hashData.append('&');
//                }
//            }
//        }
//
//        String vnp_SecureHash = hmacSHA512(vnp_HashSecret, hashData.toString());
//        String paymentUrl =vnp_PayUrl + "?" + query.toString() + "&vnp_SecureHash=" + vnp_SecureHash;
//
//        log.info("VNPAY Payment URL created for order {}: {}", vnp_TxnRef, paymentUrl);
//        return paymentUrl;
//    }
//
//    /**
//     * XỬ LÝ KẾT QUẢ TRẢ VỀ (Callback từ VNPay)
//     */
//    @Transactional
//    public void processCallback(Map<String, String> params) {
//        String vnp_ResponseCode = params.get("vnp_ResponseCode");
//        String orderCode = params.get("vnp_TxnRef");
//
//        // 1. Kiểm tra đơn hàng
//        Order order = orderRepository.findByCode(orderCode)
//                .orElseThrow(() -> new RuntimeException("Order not found: " + orderCode));
//
//        // 2. Tìm dòng thanh toán PENDING của order này
//        Payment payment = order.getPayments().stream()
//                .filter(p -> p.getStatus() == PaymentStatus.PENDING)
//                .findFirst()
//                .orElseThrow(() -> new RuntimeException("No pending payment found for order: " + orderCode));
//
//        // 3. Cập nhật trạng thái dựa trên mã phản hồi VNPay
//        if ("00".equals(vnp_ResponseCode)) {
//            log.info("Payment success for order: {}", orderCode);
//            payment.setStatus(PaymentStatus.COMPLETED);
//            payment.setCreatedAt(LocalDateTime.now());
//            order.setOrderStatus(OrderStatus.COMPLETED); // Đơn hàng đã thanh toán
//        } else {
//            log.warn("Payment failed for order: {}, code: {}", orderCode, vnp_ResponseCode);
//            payment.setStatus(PaymentStatus.FAILED);
//            // Lưu ý: Không hoàn kho ở đây, để khách có thể nhấn "Thử lại" hoặc Admin xử lý sau.
//        }
//
//        paymentRepository.save(payment);
//        orderRepository.save(order);
//    }
//
//    // ================= HELPER METHODS =================
//
//    private String hmacSHA512(final String key, final String data) {
//        try {
//            final Mac hmac512 = Mac.getInstance("HmacSHA512");
//            byte[] hmacKeyBytes = key.getBytes();
//            final SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
//            hmac512.init(secretKey);
//            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
//            byte[] result = hmac512.doFinal(dataBytes);
//            StringBuilder sb = new StringBuilder(2 * result.length);
//            for (byte b : result) {
//                sb.append(String.format("%02x", b & 0xff));
//            }
//            return sb.toString();
//        } catch (Exception ex) {
//            log.error("HmacSHA512 Error: ", ex);
//            return "";
//        }
//    }
//
//    private String getIpAddress(HttpServletRequest request) {
//        String ipAddress = request.getHeader("X-FORWARDED-FOR");
//        if (ipAddress == null) {
//            ipAddress = request.getRemoteAddr();
//        }
//        // Nếu là localhost IPv6, đổi thành IPv4 chuẩn
//        if ("0:0:0:0:0:0:0:1".equals(ipAddress)) {
//            ipAddress = "127.0.0.1";
//        }
//        return ipAddress;
//    }
//}