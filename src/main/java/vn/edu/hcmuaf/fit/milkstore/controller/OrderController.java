package vn.edu.hcmuaf.fit.milkstore.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.hcmuaf.fit.milkstore.dto.CreateOrderRequest;
import vn.edu.hcmuaf.fit.milkstore.dto.OrderHistoryResponse;
import vn.edu.hcmuaf.fit.milkstore.dto.OrderResponse;
import vn.edu.hcmuaf.fit.milkstore.service.OrderService;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /**
     * GET /api/orders/history - Lấy lịch sử mua hàng của user hiện tại
     */
    @GetMapping("/history")
    public ResponseEntity<?> getOrderHistory() {
        try {
            List<OrderHistoryResponse> response = orderService.getOrderHistory();
            return ResponseEntity.ok(response);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Có lỗi xảy ra khi lấy lịch sử mua hàng");
        }
    }

    /**
     * POST /api/orders/checkout - Tạo đơn hàng mới từ giỏ hàng
     */
    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@RequestBody CreateOrderRequest request) {
        try {
            OrderResponse response = orderService.checkout(request);
            return ResponseEntity.ok(response);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Có lỗi xảy ra khi tạo đơn hàng: " + e.getMessage());
        }
    }
}
