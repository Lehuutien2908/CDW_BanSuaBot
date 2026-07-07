package vn.edu.hcmuaf.fit.milkstore.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class CartItemResponse {
    private Long id;
    private Long productId;
    private Long variantId;
    private String productName;
    private String image;
    private String size;
    private Double price;
    private Integer quantity;
    private Integer stock;
    private Double subtotal;
}
