package vn.edu.hcmuaf.fit.milkstore.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderHistoryResponse {
    private Long id;
    private String orderCode; // Mã đơn hàng
    private LocalDateTime orderDate;
    private Double totalPrice;
    private String status;
    private String receiverName;
    private String receiverPhone;
    private String shippingAddress;
    private List<OrderItemResponse> items;
}
