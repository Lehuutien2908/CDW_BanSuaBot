package vn.edu.hcmuaf.fit.milkstore.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductDetailResponse {
    private Long id;
    private String name;
    private String slug;
    private String brandName;
    private String categoryName;
    private String mainImage;
    private List<VariantResponse> variants;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class VariantResponse {
        private Long id;
        private String weight;
        private Double price;
        private Integer stock;
        private String primaryImage;
        private List<String> images;
    }
}
