package vn.edu.hcmuaf.fit.milkstore.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.hcmuaf.fit.milkstore.dto.AddToCartRequest;
import vn.edu.hcmuaf.fit.milkstore.dto.CartResponse;
import vn.edu.hcmuaf.fit.milkstore.dto.UpdateCartRequest;
import vn.edu.hcmuaf.fit.milkstore.service.CartService;

import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    /**
     * POST /api/cart - Thêm sản phẩm vào giỏ hàng
     */
    @PostMapping
    public ResponseEntity<?> addToCart(@RequestBody AddToCartRequest request) {
        try {
            CartResponse response = cartService.addToCart(request);
            return ResponseEntity.ok(response);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Có lỗi xảy ra khi thêm vào giỏ hàng");
        }
    }

    /**
     * GET /api/cart - Lấy giỏ hàng của user hiện tại
     */
    @GetMapping
    public ResponseEntity<?> getMyCart() {
        try {
            CartResponse response = cartService.getMyCart();
            return ResponseEntity.ok(response);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Có lỗi xảy ra khi lấy giỏ hàng");
        }
    }

    /**
     * PUT /api/cart/{id} - Cập nhật số lượng sản phẩm
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateQuantity(@PathVariable Long id, 
                                           @RequestBody UpdateCartRequest request) {
        try {
            CartResponse response = cartService.updateQuantity(id, request.getQuantity());
            return ResponseEntity.ok(response);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Có lỗi xảy ra khi cập nhật giỏ hàng");
        }
    }

    /**
     * DELETE /api/cart/{id} - Xóa sản phẩm khỏi giỏ hàng
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> removeItem(@PathVariable Long id) {
        try {
            CartResponse response = cartService.removeItem(id);
            return ResponseEntity.ok(response);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Có lỗi xảy ra khi xóa sản phẩm");
        }
    }

    /**
     * DELETE /api/cart - Xóa toàn bộ giỏ hàng
     */
    @DeleteMapping
    public ResponseEntity<?> clearCart() {
        try {
            CartResponse response = cartService.clearCart();
            return ResponseEntity.ok(response);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Có lỗi xảy ra khi xóa giỏ hàng");
        }
    }
}
