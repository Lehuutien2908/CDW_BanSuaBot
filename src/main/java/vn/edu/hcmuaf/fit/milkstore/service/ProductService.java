package vn.edu.hcmuaf.fit.milkstore.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import vn.edu.hcmuaf.fit.milkstore.dto.ProductDetailDTO;
import vn.edu.hcmuaf.fit.milkstore.entity.Product;
import vn.edu.hcmuaf.fit.milkstore.repository.ProductRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public List<Product> getHotDeals() {
        return productRepository.findTopHotDeals();
    }

    public List<Product> getNewProducts() {
        return productRepository.findTopNewProducts();
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public List<Product> searchProducts(String name) {
        if (name == null || name.trim().isEmpty()) {
            return List.of();
        }
        return productRepository.findTop5ByNameContainingIgnoreCase(name);
    }

    public List<Product> searchAllProducts(String name) {
        if (name == null || name.trim().isEmpty()) {
            return productRepository.findAll();
        }
        return productRepository.findByNameContainingIgnoreCase(name);
    }

    public Page<Product> filterProducts(String name, Long categoryId, Long brandId, String priceRange, String sort, int page, int size) {

        Double minPrice = null;
        Double maxPrice = null;

        // Xử lý khoảng giá
        if (priceRange != null && !priceRange.equals("all")) {
            switch (priceRange) {
                case "under_300":
                    maxPrice = 300000.0;
                    break;
                case "300_600":
                    minPrice = 300000.0;
                    maxPrice = 600000.0;
                    break;
                case "over_600":
                    minPrice = 600000.0;
                    break;
            }
        }

        Pageable pageable = PageRequest.of(page, size);

        if ("price_asc".equals(sort)) {
            return productRepository.filterProductsPriceAsc(name, categoryId, brandId, minPrice, maxPrice, pageable);
        } else if ("price_desc".equals(sort)) {
            return productRepository.filterProductsPriceDesc(name, categoryId, brandId, minPrice, maxPrice, pageable);
        } else {
            return productRepository.filterProductsNewest(name, categoryId, brandId, minPrice, maxPrice, pageable);
        }
    }

    public ProductDetailDTO getProductDetail(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

        ProductDetailDTO dto = new ProductDetailDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setImageUrl(product.getImageUrl());

        if (product.getBrand() != null) dto.setBrandName(product.getBrand().getName());
        if (product.getCategory() != null) dto.setCategoryName(product.getCategory().getName());

        if (product.getVariants() != null) {
            List<ProductDetailDTO.VariantDTO> variantDTOs = product.getVariants().stream().map(v -> {
                ProductDetailDTO.VariantDTO vDto = new ProductDetailDTO.VariantDTO();
                vDto.setId(v.getId());
                vDto.setPrice(v.getPrice());
                vDto.setStock(v.getStock());
                vDto.setWeight(v.getWeight());
                return vDto;
            }).collect(Collectors.toList());
            dto.setVariants(variantDTOs);
        }
        return dto;
    }
}