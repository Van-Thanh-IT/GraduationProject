package com.example.backend.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.*;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Value;
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

        Order order = orderRepository
                .findByCode(orderCode)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderCode));

        Payment payment = order.getPayments().stream()
                .filter(p -> p.getStatus() == PaymentStatus.PENDING)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No pending payment found for order: " + orderCode));

        if ("00".equals(vnpResponseCode)) {
            log.info("Payment success for order: {}", orderCode);
            payment.setStatus(PaymentStatus.COMPLETED);
            payment.setCreatedAt(LocalDateTime.now());
            order.setOrderStatus(OrderStatus.COMPLETED);
        } else {
            log.warn("Payment failed for order: {}, code: {}", orderCode, vnpResponseCode);
            payment.setStatus(PaymentStatus.FAILED);
        }

        paymentRepository.save(payment);
        orderRepository.save(order);
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
