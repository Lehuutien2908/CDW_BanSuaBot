package vn.edu.hcmuaf.fit.milkstore.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderAdminResponse {
    private Long id;
    private String orderCode;
    private LocalDateTime orderDate;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String shippingAddress;
    private Double totalPrice;
    private String status;
    private Integer totalItems;
}
