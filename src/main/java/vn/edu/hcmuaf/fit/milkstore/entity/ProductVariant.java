package vn.edu.hcmuaf.fit.milkstore.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "product_variants")
@Data
public class ProductVariant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String weight;
    private Double price;
    private Integer stock;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;
}
