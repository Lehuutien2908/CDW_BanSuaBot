package vn.edu.hcmuaf.fit.milkstore.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Data
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private LocalDateTime orderDate; // Ngày giờ đặt hàng
    private Double totalPrice;       // Tổng tiền của cả đơn
    private String status;           // Trạng thái: PENDING (Chờ duyệt), SHIPPING (Đang giao), COMPLETED (Hoàn thành)

    // Thông tin người nhận (Có thể khác với thông tin User nếu họ mua tặng người khác)
    private String shippingAddress;
    private String receiverName;
    private String receiverPhone;
}
