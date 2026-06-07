package vn.edu.hcmuaf.fit.milkstore.dto;
import lombok.Data;
import java.util.List;

@Data
public class ProductDetailDTO {
    private Long id;
    private String name;
    private String imageUrl;
    private String brandName;
    private String categoryName;
    private List<VariantDTO> variants;

    @Data
    public static class VariantDTO {
        private Long id;
        private Double price;
        private Integer stock;
        private String weight;
    }
}