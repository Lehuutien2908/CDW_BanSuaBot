package vn.edu.hcmuaf.fit.milkstore.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// Dùng để hiển thị 1 dòng trong bảng "Quản lý sản phẩm" (Admin)
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminProductResponse {
    private Long id;
    private String name;
    private String slug;
    private Long categoryId;
    private String categoryName;
    private Long brandId;
    private String brandName;
    private String thumbnailUrl;
    private Double minPrice;
    private Double maxPrice;
    private Integer totalStock;
    private Integer variantCount;
}
