package vn.edu.hcmuaf.fit.milkstore.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;

    // Hình thức thanh toán: "COD" (Tiền mặt), "VNPAY", "MOMO"...
    private String paymentMethod;

    // Trạng thái: "PENDING" (Đang chờ), "SUCCESS" (Thành công), "FAILED" (Thất bại)
    private String paymentStatus;

    // Tổng tiền khách đã trả
    private Double amount;

    // Mã giao dịch do VNPay/MoMo trả về để sau này đối soát
    private String transactionId;

    // Thời gian khách bấm thanh toán
    private LocalDateTime paymentDate;
}