package vn.edu.hcmuaf.fit.milkstore.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "products")
@Data
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String slug;

    private Double price;
    private Integer stock;
    private String imageUrl;

    // Sản phẩm thuộc về một Danh mục
    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    // Sản phẩm thuộc về một Thương hiệu
    @ManyToOne
    @JoinColumn(name = "brand_id")
    private Brand brand;
}