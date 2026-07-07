package vn.edu.hcmuaf.fit.milkstore.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.hcmuaf.fit.milkstore.entity.Order;
import vn.edu.hcmuaf.fit.milkstore.entity.Payment;
import vn.edu.hcmuaf.fit.milkstore.repository.OrderRepository;
import vn.edu.hcmuaf.fit.milkstore.repository.PaymentRepository;
import vn.edu.hcmuaf.fit.milkstore.service.VNPayService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final VNPayService vnPayService;
    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    /**
     * GET /api/payments/vnpay-return - VNPay callback sau khi thanh toán
     * VNPay sẽ redirect về URL này với các query parameters
     */
    @GetMapping("/vnpay-return")
    public ResponseEntity<?> vnpayReturn(@RequestParam Map<String, String> params) {
        try {
            // 1. Lấy các tham số quan trọng
            String vnpSecureHash = params.get("vnp_SecureHash");
            String vnpResponseCode = params.get("vnp_ResponseCode");
            String vnpTxnRef = params.get("vnp_TxnRef"); // Order ID
            String vnpTransactionNo = params.get("vnp_TransactionNo"); // Mã giao dịch VNPay

            // 2. Verify signature
            if (!vnPayService.verifySignature(params, vnpSecureHash)) {
                return ResponseEntity.badRequest().body("Chữ ký không hợp lệ");
            }

            // 3. Tìm Order và Payment
            Long orderId = Long.parseLong(vnpTxnRef);
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

            Payment payment = paymentRepository.findByOrderId(orderId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin thanh toán"));

            // 4. Cập nhật trạng thái thanh toán
            if ("00".equals(vnpResponseCode)) {
                // Thanh toán thành công
                payment.setPaymentStatus("SUCCESS");
                payment.setTransactionId(vnpTransactionNo);
                order.setStatus("PROCESSING"); // Chuyển sang trạng thái đang xử lý
            } else {
                // Thanh toán thất bại
                payment.setPaymentStatus("FAILED");
                order.setStatus("CANCELLED"); // Hủy đơn hàng
            }

            paymentRepository.save(payment);
            orderRepository.save(order);

            // 5. Trả về kết quả
            Map<String, Object> response = new HashMap<>();
            response.put("success", "00".equals(vnpResponseCode));
            response.put("orderId", orderId);
            response.put("message", "00".equals(vnpResponseCode) 
                ? "Thanh toán thành công" 
                : "Thanh toán thất bại");
            response.put("responseCode", vnpResponseCode);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Có lỗi xảy ra: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * GET /api/payments/order/{orderId} - Lấy thông tin thanh toán của đơn hàng
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getPaymentByOrderId(@PathVariable Long orderId) {
        try {
            Payment payment = paymentRepository.findByOrderId(orderId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin thanh toán"));

            Map<String, Object> response = new HashMap<>();
            response.put("paymentMethod", payment.getPaymentMethod());
            response.put("paymentStatus", payment.getPaymentStatus());
            response.put("amount", payment.getAmount());
            response.put("transactionId", payment.getTransactionId());
            response.put("paymentDate", payment.getPaymentDate());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Có lỗi xảy ra: " + e.getMessage());
        }
    }
}
