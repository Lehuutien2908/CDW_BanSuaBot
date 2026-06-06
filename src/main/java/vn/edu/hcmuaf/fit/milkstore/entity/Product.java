package vn.edu.hcmuaf.fit.milkstore.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

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

    private String imageUrl;

    // Sản phẩm thuộc về một Danh mục
    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    // Sản phẩm thuộc về một Thương hiệu
    @ManyToOne
    @JoinColumn(name = "brand_id")
    private Brand brand;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JsonIgnore
    private List<ProductVariant> variants;

    @JsonProperty("image_url")
    public String getImage_url() {
        return imageUrl;
    }

    @JsonProperty("price")
    public Double getPrice() {
        if (variants != null && !variants.isEmpty()) {
            return variants.stream()
                    .mapToDouble(ProductVariant::getPrice)
                    .min()
                    .orElse(0.0);
        }
        return null;
    }
}