package vn.edu.hcmuaf.fit.milkstore.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "order_details")
@Data
public class OrderDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;

    @ManyToOne
    @JoinColumn(name = "variant_id")
    private ProductVariant productVariant;

    private Integer quantity;

    // Giá sản phẩm có thể thay đổi trong tương lai. Biến này dùng để lưu lại đơn giá lúc mua
    private Double unitPrice;
}
