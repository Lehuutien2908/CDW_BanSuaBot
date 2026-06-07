package vn.edu.hcmuaf.fit.milkstore.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.hcmuaf.fit.milkstore.dto.ProductDetailDTO;
import vn.edu.hcmuaf.fit.milkstore.entity.Product;
import vn.edu.hcmuaf.fit.milkstore.service.ProductService;

import java.util.List;

@RestController
@RequestMapping("api/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;

    @GetMapping
    public List<Product> getAllProducts(){
        return productService.getAllProducts();
    }

//    @PostMapping
//    public Product createProduct(@RequestBody Product product){
//        return productService.createProduct(product);
//    }

    @GetMapping("/hot-deals")
    public List<Product> getHotDeals() {
        return productService.getHotDeals();
    }

    @GetMapping("/new-products")
    public List<Product> getNewProducts() {
        return productService.getNewProducts();
    }

    // API này dùng cho ô gợi ý (giới hạn 5 cái)
    @GetMapping("/search")
    public ResponseEntity<List<Product>> searchProductsByName(@RequestParam("name") String name) {
        List<Product> results = productService.searchProducts(name);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/search-all")
    public ResponseEntity<List<Product>> searchAllProductsByName(@RequestParam("name") String name) {
        List<Product> results = productService.searchAllProducts(name);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/filter")
    public ResponseEntity<Page<Product>> filterProducts(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long brandId,
            @RequestParam(required = false) String price,
            @RequestParam(defaultValue = "newest") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        Page<Product> result = productService.filterProducts(name, categoryId, brandId, price, sort, page, size);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDetailDTO> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductDetail(id));
    }
}
