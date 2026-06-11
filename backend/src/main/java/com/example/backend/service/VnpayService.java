package com.example.backend.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.entity.Order;
import com.example.backend.entity.Payment;
import com.example.backend.enums.OrderStatus;
import com.example.backend.enums.PaymentStatus;
import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.PaymentRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
@RequiredArgsConstructor
public class VnpayService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;

    @Value("${spring.vnpay.url}")
    private String vnpPayUrl;

    @Value("${spring.vnpay.returnUrl}")
    private String vnpReturnUrl;

    @Value("${spring.vnpay.apiUrl:https://sandbox.vnpayment.vn/merchant_webapi/api/transaction}")
    private String vnpApiUrl;

    @Value("${spring.vnpay.tmnCode}")
    private String vnpTmnCode;

    @Value("${spring.vnpay.hashSecret}")
    private String vnpHashSecret;

    @Value("${spring.vnpay.version}")
    private String vnpVersion;

    @Value("${spring.vnpay.command}")
    private String vnpCommand;

    @Value("${spring.vnpay.currCode}")
    private String vnpCurrCode;

    public String createPayment(Order order, HttpServletRequest request) {
        long amount =
                order.getFinalAmount().multiply(new java.math.BigDecimal(100)).longValue();

        String vnpTxnRef = order.getCode();
        String vnpIpAddr = getIpAddress(request);

        Map<String, String> vnpParams = new HashMap<>();
        vnpParams.put("vnp_Version", vnpVersion);
        vnpParams.put("vnp_Command", vnpCommand);
        vnpParams.put("vnp_TmnCode", vnpTmnCode);
        vnpParams.put("vnp_Amount", String.valueOf(amount));
        vnpParams.put("vnp_CurrCode", vnpCurrCode);
        vnpParams.put("vnp_TxnRef", vnpTxnRef);
        vnpParams.put("vnp_OrderInfo", "Thanh toan don hang: " + vnpTxnRef);
        vnpParams.put("vnp_OrderType", "other");
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl", vnpReturnUrl);
        vnpParams.put("vnp_IpAddr", vnpIpAddr);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnpCreateDate = formatter.format(cld.getTime());
        vnpParams.put("vnp_CreateDate", vnpCreateDate);

        cld.add(Calendar.MINUTE, 15);
        String vnpExpireDate = formatter.format(cld.getTime());
        vnpParams.put("vnp_ExpireDate", vnpExpireDate);

        List<String> fieldNames = new ArrayList<>(vnpParams.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        for (Iterator<String> itr = fieldNames.iterator(); itr.hasNext(); ) {
            String fieldName = itr.next();
            String fieldValue = vnpParams.get(fieldName);
            if ((fieldValue != null) && (!fieldValue.isEmpty())) {

                hashData.append(fieldName).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));

                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII))
                        .append('=')
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }

        String vnpSecureHash = hmacSHA512(vnpHashSecret, hashData.toString());
        String paymentUrl = vnpPayUrl + "?" + query + "&vnp_SecureHash=" + vnpSecureHash;

        log.info("VNPAY Payment URL created for order {}: {}", vnpTxnRef, paymentUrl);
        return paymentUrl;
    }

    @Transactional
    public void processCallback(Map<String, String> params) {

        String vnpResponseCode = params.get("vnp_ResponseCode");
        String orderCode = params.get("vnp_TxnRef");
        String secureHash = params.get("vnp_SecureHash");

        //Verify chữ ký
        boolean isValid = verifySignature(params, secureHash);
        if (!isValid) {
            throw new RuntimeException("Invalid VNPAY signature");
        }

        Order order = orderRepository.findByCode(orderCode)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderCode));

        Payment payment = order.getPayments().stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No payment found"));

        if (payment.getStatus() == PaymentStatus.COMPLETED) {
            log.warn("Payment already processed: {}", orderCode);
            return;
        }

        if ("00".equals(vnpResponseCode)) {

            log.info("Payment SUCCESS: {}", orderCode);

            payment.setStatus(PaymentStatus.COMPLETED);
            payment.setTransactionCode(params.get("vnp_TransactionNo"));
            payment.setCreatedAt(LocalDateTime.now());

            order.setOrderStatus(OrderStatus.PENDING);

        } else {

            log.warn("Payment FAILED: {}, code: {}", orderCode, vnpResponseCode);

            payment.setStatus(PaymentStatus.FAILED);

            if (order.getOrderStatus() == OrderStatus.PENDING) {
                order.setOrderStatus(OrderStatus.CANCELLED);
            }
        }

        paymentRepository.save(payment);
        orderRepository.save(order);
    }

    /**
     * Hàm gọi API Hoàn tiền VNPAY
     * @param orderCode Mã đơn hàng (vnp_TxnRef)
     * @param amount Số tiền cần hoàn (VNĐ - chưa nhân 100)
     * @param transactionNo Mã giao dịch ghi nhận tại VNPAY (vnp_TransactionNo)
     * @param transactionDate Thời gian thanh toán thành công (vnp_PayDate format: yyyyMMddHHmmss)
     * @param createdBy Người thực hiện hoàn tiền (ví dụ: admin)
     * @return Map chứa kết quả trả về từ VNPAY
     */
    public Map<String, Object> refundPayment(String orderCode, long amount, String transactionNo,
                                             String transactionDate, String createdBy, String ipAddress) {

        String vnpRequestId = UUID.randomUUID().toString().replace("-", "");
        String vnpCommand = "refund";
        String vnpTransactionType = "02";
        long vnpAmount = amount * 100;
        String vnpOrderInfo = "Hoan tien don hang " + orderCode;

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnpCreateDate = formatter.format(cld.getTime());

        String hashData = vnpRequestId + "|" + vnpVersion + "|" + vnpCommand + "|" + vnpTmnCode + "|" +
                vnpTransactionType + "|" + orderCode + "|" + vnpAmount + "|" + transactionNo + "|" +
                transactionDate + "|" + createdBy + "|" + vnpCreateDate + "|" + ipAddress + "|" + vnpOrderInfo;

        String vnpSecureHash = hmacSHA512(vnpHashSecret, hashData);


        Map<String, Object> payload = new HashMap<>();
        payload.put("vnp_RequestId", vnpRequestId);
        payload.put("vnp_Version", vnpVersion);
        payload.put("vnp_Command", vnpCommand);
        payload.put("vnp_TmnCode", vnpTmnCode);
        payload.put("vnp_TransactionType", vnpTransactionType);
        payload.put("vnp_TxnRef", orderCode);
        payload.put("vnp_Amount", vnpAmount);
        payload.put("vnp_TransactionNo", transactionNo);
        payload.put("vnp_TransactionDate", transactionDate);
        payload.put("vnp_CreateBy", createdBy);
        payload.put("vnp_CreateDate", vnpCreateDate);
        payload.put("vnp_IpAddr", ipAddress);
        payload.put("vnp_OrderInfo", vnpOrderInfo);
        payload.put("vnp_SecureHash", vnpSecureHash);

        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> httpEntity = new HttpEntity<>(payload, headers);

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(vnpApiUrl, httpEntity, Map.class);

            log.info("VNPAY Refund Response for Order {}: {}", orderCode, response);
            return response;

        } catch (Exception e) {
            log.error("VNPAY Refund Request Failed: ", e);
            throw new RuntimeException("Lỗi kết nối đến VNPAY khi hoàn tiền: " + e.getMessage());
        }
    }

    /**
     * Hàm phụ: Kiểm tra và gọi hoàn tiền VNPAY
     */
    @Async
    public void processVnpayRefundAsync(Payment vnpayPayment, Order order, String cancelBy, String ipAddress) {
        try {
            long amount = order.getFinalAmount().longValue();
            String transactionNo = vnpayPayment.getTransactionCode();

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
            String transactionDate = vnpayPayment.getCreatedAt().format(formatter);

            Map<String, Object> refundResponse = this.refundPayment(
                    order.getCode(), amount, transactionNo, transactionDate, cancelBy, ipAddress
            );

            String responseCode = (String) refundResponse.get("vnp_ResponseCode");
            String message = (String) refundResponse.get("vnp_Message");

            if ("00".equals(responseCode)) {
                log.info("Đã gửi yêu cầu hoàn tiền VNPAY thành công cho đơn hàng: {}", order.getCode());
                vnpayPayment.setStatus(PaymentStatus.REFUNDED);

            } else {
                log.error("VNPAY từ chối hoàn tiền cho đơn {}. Lỗi: {}", order.getCode(), message);
//                vnpayPayment.setStatus(PaymentStatus.REFUND_FAILED);
//                vnpayPayment.setNote("Lỗi hoàn tiền VNPAY: " + message);
            }
        } catch (Exception e) {
            log.error("Có lỗi xảy ra khi gọi API hoàn tiền VNPAY cho đơn {}: {}", order.getCode(), e.getMessage());
//            vnpayPayment.setStatus(PaymentStatus.REFUND_FAILED);
//            vnpayPayment.setNote("Lỗi kết nối VNPAY: " + e.getMessage());
        }

        paymentRepository.save(vnpayPayment);
    }

    private boolean verifySignature(Map<String, String> params, String vnpSecureHash) {

        Map<String, String> filtered = new HashMap<>(params);

        filtered.remove("vnp_SecureHash");
        filtered.remove("vnp_SecureHashType");

        List<String> fieldNames = new ArrayList<>(filtered.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();

        for (String field : fieldNames) {
            String value = filtered.get(field);
            if (value != null && !value.isEmpty()) {

                hashData.append(field)
                        .append('=')
                        .append(URLEncoder.encode(value, StandardCharsets.US_ASCII));

                hashData.append('&');
            }
        }

        hashData.deleteCharAt(hashData.length() - 1);

        String generatedHash = hmacSHA512(vnpHashSecret, hashData.toString());

        return generatedHash.equalsIgnoreCase(vnpSecureHash);
    }

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

    public String getIpAddress(HttpServletRequest request) {
        String ipAddress = request.getHeader("X-FORWARDED-FOR");
        if (ipAddress == null) {
            ipAddress = request.getRemoteAddr();
        }
        if ("0:0:0:0:0:0:0:1".equals(ipAddress)) {
            ipAddress = "127.0.0.1";
        }
        return ipAddress;
    }
}
