package vn.edu.hcmuaf.fit.milkstore.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Comparator;
import java.util.List;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String slug;

    // Sản phẩm thuộc về một Danh mục
    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    // Sản phẩm thuộc về một Thương hiệu
    @ManyToOne
    @JoinColumn(name = "brand_id")
    private Brand brand;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    @JsonIgnore
    private List<ProductVariant> variants;

    @JsonProperty("image_url")
    public String getImage_url() {
        if (variants != null && !variants.isEmpty()) {
            // Tìm biến thể có giá thấp nhất
            ProductVariant cheapestVariant = variants.stream()
                    .min(Comparator.comparing(ProductVariant::getPrice))
                    .orElse(variants.get(0)); // Nếu có sự cố ngoài ý muốn, lấy mặc định cái đầu tiên

            // Lấy hình ảnh từ biến thể có giá thấp nhất vừa tìm được
            if (cheapestVariant.getImages() != null && !cheapestVariant.getImages().isEmpty()) {
                // Ưu tiên tìm ảnh thumbnail của biến thể này
                return cheapestVariant.getImages().stream()
                        .filter(ImageProducts::isPrimary)
                        .map(ImageProducts::getImageUrl)
                        .findFirst()
                        .orElse(cheapestVariant.getImages().iterator().next().getImageUrl());
            }
        }
        return null;
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