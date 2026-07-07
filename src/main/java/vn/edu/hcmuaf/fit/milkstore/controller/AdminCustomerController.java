package vn.edu.hcmuaf.fit.milkstore.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.hcmuaf.fit.milkstore.dto.UserAdminResponse;
import vn.edu.hcmuaf.fit.milkstore.service.AdminCustomerService;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminCustomerController {

    private final AdminCustomerService adminCustomerService;

    /**
     * GET /api/admin/users
     * Lấy danh sách tất cả khách hàng
     */
    @GetMapping
    public ResponseEntity<List<UserAdminResponse>> getAllUsers() {
        List<UserAdminResponse> users = adminCustomerService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * GET /api/admin/users/{id}
     * Lấy thông tin chi tiết khách hàng
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserAdminResponse> getUserDetail(@PathVariable Long id) {
        UserAdminResponse user = adminCustomerService.getUserDetail(id);
        return ResponseEntity.ok(user);
    }

    /**
     * PUT /api/admin/users/{id}/toggle-status
     * Kích hoạt/Vô hiệu hóa tài khoản khách hàng
     */
    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<UserAdminResponse> toggleUserStatus(@PathVariable Long id) {
        UserAdminResponse user = adminCustomerService.toggleUserStatus(id);
        return ResponseEntity.ok(user);
    }
}
