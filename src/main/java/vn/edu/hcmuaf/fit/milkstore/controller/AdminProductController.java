package vn.edu.hcmuaf.fit.milkstore.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.hcmuaf.fit.milkstore.dto.AdminProductDetailResponse;
import vn.edu.hcmuaf.fit.milkstore.dto.AdminProductResponse;
import vn.edu.hcmuaf.fit.milkstore.dto.ProductRequest;
import vn.edu.hcmuaf.fit.milkstore.service.AdminProductService;
import vn.edu.hcmuaf.fit.milkstore.service.FileStorageService;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

// API quản lý sản phẩm (CRUD) dành cho Admin. Đã bị chặn ở SecurityConfig,
// chỉ tài khoản có ROLE_ADMIN mới gọi được các endpoint /api/admin/**
@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final AdminProductService adminProductService;
    private final FileStorageService fileStorageService;

    // GET /api/admin/products - danh sách toàn bộ sản phẩm (kèm biến thể) cho bảng quản lý
    @GetMapping
    public ResponseEntity<List<AdminProductResponse>> getAllProducts() {
        return ResponseEntity.ok(adminProductService.getAllProducts());
    }

    // GET /api/admin/products/{id} - chi tiết sản phẩm, đổ vào form sửa
    @GetMapping("/{id}")
    public ResponseEntity<?> getProductDetail(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(adminProductService.getProductDetail(id));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // POST /api/admin/products - tạo sản phẩm mới
    @PostMapping
    public ResponseEntity<?> createProduct(@RequestBody ProductRequest request) {
        try {
            AdminProductDetailResponse created = adminProductService.createProduct(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (NoSuchElementException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // PUT /api/admin/products/{id} - cập nhật sản phẩm
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody ProductRequest request) {
        try {
            AdminProductDetailResponse updated = adminProductService.updateProduct(id, request);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        }
    }

    // DELETE /api/admin/products/{id} - xoá sản phẩm
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        try {
            adminProductService.deleteProduct(id);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", e.getMessage()));
        }
    }

    // POST /api/admin/products/upload-image - upload 1 ảnh, trả về URL để gắn vào biến thể
    @PostMapping("/upload-image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            String url = fileStorageService.storeProductImage(file);
            return ResponseEntity.ok(Map.of("url", url));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
