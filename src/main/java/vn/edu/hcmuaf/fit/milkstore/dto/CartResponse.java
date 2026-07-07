package vn.edu.hcmuaf.fit.milkstore.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class CartResponse {
    private List<CartItemResponse> items;
    private Integer totalQuantity;
    private Double totalPrice;
}
