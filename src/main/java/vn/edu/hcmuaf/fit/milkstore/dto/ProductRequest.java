package vn.edu.hcmuaf.fit.milkstore.dto;

import lombok.Data;

import java.util.List;

// Dữ liệu gửi lên khi Admin tạo mới / cập nhật sản phẩm (kèm biến thể + ảnh)
@Data
public class ProductRequest {
    private String name;
    private Long categoryId;
    private Long brandId;
    private List<VariantRequest> variants;

    @Data
    public static class VariantRequest {
        // id = null -> biến thể mới; id khác null -> cập nhật biến thể đã có
        private Long id;
        private String weight;
        private Double price;
        private Integer stock;
        private List<ImageRequest> images;
    }

    @Data
    public static class ImageRequest {
        // id = null -> ảnh mới; id khác null -> ảnh đã có (giữ nguyên/cập nhật cờ is_primary)
        private Long id;
        private String imageUrl;
        private Boolean isPrimary;
    }
}
