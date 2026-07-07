package vn.edu.hcmuaf.fit.milkstore.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "variant_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ImageProducts {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "image_url")
    private String imageUrl;

    // Cột thật trong DB tên là "is_primary" (bit(1), có thể NULL với dữ liệu cũ),
    // dùng Boolean (wrapper) để chấp nhận NULL, tránh lỗi khi Hibernate load dữ liệu.
    @Column(name = "is_primary")
    private Boolean isPrimary;

    @ManyToOne
    @JoinColumn(name = "variant_id")
    @JsonIgnore
    private ProductVariant productVariant;

    // Getter an toàn dùng cho Product.java / ProductService.java (ImageProducts::isPrimary):
    // NULL sẽ được coi là false (không phải ảnh đại diện), không ném lỗi.
    public boolean isPrimary() {
        return Boolean.TRUE.equals(isPrimary);
    }
}
