package vn.edu.hcmuaf.fit.milkstore.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateOrderRequest {
    private String receiverName;
    private String receiverPhone;
    private String shippingAddress;
    private String paymentMethod; // "COD" hoặc "VNPAY"
    private String note; // Ghi chú đơn hàng (optional)
}
