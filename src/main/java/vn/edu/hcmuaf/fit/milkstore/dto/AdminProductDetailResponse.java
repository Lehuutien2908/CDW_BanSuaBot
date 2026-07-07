package vn.edu.hcmuaf.fit.milkstore.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

// Dữ liệu đầy đủ của 1 sản phẩm, dùng để đổ vào form sửa ở trang Admin
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminProductDetailResponse {
    private Long id;
    private String name;
    private String slug;
    private Long categoryId;
    private String categoryName;
    private Long brandId;
    private String brandName;
    private List<VariantItem> variants;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class VariantItem {
        private Long id;
        private String weight;
        private Double price;
        private Integer stock;
        private List<ImageItem> images;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ImageItem {
        private Long id;
        private String imageUrl;
        private Boolean isPrimary;
    }
}
