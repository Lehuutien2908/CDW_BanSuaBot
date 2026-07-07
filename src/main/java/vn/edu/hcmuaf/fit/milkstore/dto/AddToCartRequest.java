package vn.edu.hcmuaf.fit.milkstore.dto;

import lombok.Data;

@Data
public class AddToCartRequest {
    private Long variantId;
    private Integer quantity;
}
