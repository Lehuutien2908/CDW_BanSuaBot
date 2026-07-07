package vn.edu.hcmuaf.fit.milkstore.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.edu.hcmuaf.fit.milkstore.config.VNPayConfig;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
@RequiredArgsConstructor
public class VNPayService {

    private final VNPayConfig vnPayConfig;

    /**
     * Tạo URL thanh toán VNPay
     */
    public String buildPaymentUrl(Long orderId, double amount, String orderInfo) {
        try {
            // 1. Tạo các tham số
            Map<String, String> vnpParams = new TreeMap<>();
            
            vnpParams.put("vnp_Version", "2.1.0");
            vnpParams.put("vnp_Command", "pay");
            vnpParams.put("vnp_TmnCode", vnPayConfig.getVnpTmnCode());
            vnpParams.put("vnp_Amount", String.valueOf((long)(amount * 100))); // VNPay yêu cầu amount * 100
            vnpParams.put("vnp_CurrCode", "VND");
            vnpParams.put("vnp_TxnRef", String.valueOf(orderId)); // Mã đơn hàng
            vnpParams.put("vnp_OrderInfo", orderInfo);
            vnpParams.put("vnp_OrderType", "other");
            vnpParams.put("vnp_Locale", "vn");
            vnpParams.put("vnp_ReturnUrl", vnPayConfig.getVnpReturnUrl());
            vnpParams.put("vnp_IpAddr", "127.0.0.1");

            // Thời gian tạo: yyyyMMddHHmmss
            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
            String vnpCreateDate = formatter.format(new Date());
            vnpParams.put("vnp_CreateDate", vnpCreateDate);

            // Thời gian hết hạn: 15 phút sau
            Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
            calendar.add(Calendar.MINUTE, 15);
            String vnpExpireDate = formatter.format(calendar.getTime());
            vnpParams.put("vnp_ExpireDate", vnpExpireDate);

            // 2. Build query string và hash
            StringBuilder hashData = new StringBuilder();
            StringBuilder query = new StringBuilder();

            for (Map.Entry<String, String> entry : vnpParams.entrySet()) {
                String fieldName = entry.getKey();
                String fieldValue = entry.getValue();
                
                if (fieldValue != null && !fieldValue.isEmpty()) {
                    // Build hashData
                    hashData.append(fieldName).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    // Build query
                    query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()))
                         .append('=')
                         .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));

                    hashData.append('&');
                    query.append('&');
                }
            }

            // Xóa ký tự '&' cuối cùng
            if (hashData.length() > 0) {
                hashData.setLength(hashData.length() - 1);
            }
            if (query.length() > 0) {
                query.setLength(query.length() - 1);
            }

            // 3. Tạo secure hash
            String vnpSecureHash = hmacSHA512(vnPayConfig.getVnpHashSecret(), hashData.toString());
            query.append("&vnp_SecureHash=").append(vnpSecureHash);

            // 4. Return full URL
            return vnPayConfig.getVnpPayUrl() + "?" + query.toString();

        } catch (UnsupportedEncodingException e) {
            throw new RuntimeException("Lỗi khi tạo URL thanh toán VNPay", e);
        }
    }

    /**
     * Xác thực chữ ký từ VNPay callback
     */
    public boolean verifySignature(Map<String, String> params, String secureHash) {
        // Loại bỏ các tham số không cần thiết
        params.remove("vnp_SecureHash");
        params.remove("vnp_SecureHashType");

        // Sắp xếp params theo key
        Map<String, String> sortedParams = new TreeMap<>(params);

        // Build hash data
        StringBuilder hashData = new StringBuilder();
        for (Map.Entry<String, String> entry : sortedParams.entrySet()) {
            String fieldValue = entry.getValue();
            if (fieldValue != null && !fieldValue.isEmpty()) {
                try {
                    hashData.append(entry.getKey())
                           .append('=')
                           .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    hashData.append('&');
                } catch (UnsupportedEncodingException e) {
                    throw new RuntimeException("Lỗi encoding", e);
                }
            }
        }

        // Xóa ký tự '&' cuối
        if (hashData.length() > 0) {
            hashData.setLength(hashData.length() - 1);
        }

        // Tính hash và so sánh
        String calculatedHash = hmacSHA512(vnPayConfig.getVnpHashSecret(), hashData.toString());
        return calculatedHash.equalsIgnoreCase(secureHash);
    }

    /**
     * HMAC SHA512 hashing
     */
    private String hmacSHA512(String key, String data) {
        try {
            Mac hmac512 = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac512.init(secretKey);
            byte[] hashBytes = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));

            // Convert to hex string
            StringBuilder result = new StringBuilder();
            for (byte b : hashBytes) {
                result.append(String.format("%02x", b));
            }
            return result.toString();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tạo HMAC SHA512", e);
        }
    }
}
