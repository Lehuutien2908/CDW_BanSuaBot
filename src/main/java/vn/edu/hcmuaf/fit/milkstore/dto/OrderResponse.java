package vn.edu.hcmuaf.fit.milkstore.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderResponse {
    private Long orderId;
    private String orderCode;
    private LocalDateTime orderDate;
    private Double totalPrice;
    private String status;
    private String paymentMethod;
    private String receiverName;
    private String receiverPhone;
    private String shippingAddress;
    private String vnpayUrl; // Chỉ có khi paymentMethod = VNPAY
}
