package vn.edu.hcmuaf.fit.milkstore.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.hcmuaf.fit.milkstore.dto.OrderAdminResponse;
import vn.edu.hcmuaf.fit.milkstore.dto.OrderHistoryResponse;
import vn.edu.hcmuaf.fit.milkstore.service.AdminOrderService;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final AdminOrderService adminOrderService;

    /**
     * GET /api/admin/orders
     * Lấy danh sách tất cả đơn hàng
     */
    @GetMapping
    public ResponseEntity<List<OrderAdminResponse>> getAllOrders(
            @RequestParam(required = false) String status) {
        List<OrderAdminResponse> orders = adminOrderService.getAllOrders(status);
        return ResponseEntity.ok(orders);
    }

    /**
     * GET /api/admin/orders/{id}
     * Lấy chi tiết đơn hàng
     */
    @GetMapping("/{id}")
    public ResponseEntity<OrderHistoryResponse> getOrderDetail(@PathVariable Long id) {
        OrderHistoryResponse order = adminOrderService.getOrderDetail(id);
        return ResponseEntity.ok(order);
    }

    /**
     * PUT /api/admin/orders/{id}/status
     * Cập nhật trạng thái đơn hàng
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<OrderAdminResponse> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        OrderAdminResponse order = adminOrderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(order);
    }
}
