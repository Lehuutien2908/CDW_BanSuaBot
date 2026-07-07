package vn.edu.hcmuaf.fit.milkstore.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.hcmuaf.fit.milkstore.dto.ProductDetailResponse;
import vn.edu.hcmuaf.fit.milkstore.entity.Product;
import vn.edu.hcmuaf.fit.milkstore.service.ProductService;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("api/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;

    // GET /api/products/new-products — Sản phẩm mới ra mắt
    @GetMapping("/new-products")
    public ResponseEntity<List<Product>> getNewProducts() {
        return ResponseEntity.ok(productService.getNewProducts());
    }

    // GET /api/products/hot-deals — Sản phẩm bán chạy nhất
    @GetMapping("/hot-deals")
    public ResponseEntity<List<Product>> getHotDeals() {
        return ResponseEntity.ok(productService.getHotDeals());
    }

    // GET /api/products/search — Tìm kiếm nhanh theo tên
    @GetMapping("/search")
    public ResponseEntity<List<Product>> searchProducts(@RequestParam(required = false) String name) {
        return ResponseEntity.ok(productService.searchProducts(name));
    }

    // GET /api/products/filter — Danh sách sản phẩm cho trang "Sản phẩm"
    // Hỗ trợ: name (tìm kiếm), categoryId, brandId, price (under_300 | 300_600 | over_600),
    // sort (newest | price_asc | price_desc), page, size
    @GetMapping("/filter")
    public ResponseEntity<Page<Product>> filterProducts(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long brandId,
            @RequestParam(required = false) String price,
            @RequestParam(defaultValue = "newest") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        Pageable pageable = PageRequest.of(Math.max(page, 0), size <= 0 ? 12 : size);
        Page<Product> result = productService.filterProducts(name, categoryId, brandId, price, sort, pageable);
        return ResponseEntity.ok(result);
    }

    // GET /api/products/{id} — Chi tiết 1 sản phẩm
    @GetMapping("/{id}")
    public ResponseEntity<ProductDetailResponse> getProductDetail(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(productService.getProductDetail(id));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
