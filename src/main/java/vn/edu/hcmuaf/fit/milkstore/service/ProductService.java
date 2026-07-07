package vn.edu.hcmuaf.fit.milkstore.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import vn.edu.hcmuaf.fit.milkstore.dto.ProductDetailResponse;
import vn.edu.hcmuaf.fit.milkstore.entity.ImageProducts;
import vn.edu.hcmuaf.fit.milkstore.entity.Product;
import vn.edu.hcmuaf.fit.milkstore.entity.ProductVariant;
import vn.edu.hcmuaf.fit.milkstore.repository.ProductRepository;

import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    // Sản phẩm mới nhất: lấy 8 sản phẩm có ID cao nhất
    public List<Product> getNewProducts() {
        return productRepository.findTop8ByOrderByIdDesc();
    }

    // Tìm kiếm nhanh theo tên (dùng cho dropdown gợi ý ở ô tìm kiếm trên Header) - trả về tối đa 10 kết quả
    public List<Product> searchProducts(String name) {
        if (name == null || name.isBlank()) {
            return Collections.emptyList();
        }
        return productRepository.findTop10ByNameContainingIgnoreCase(name.trim());
    }

    // Sản phẩm bán chạy nhất: lấy 8 sản phẩm có tổng số lượng bán ra nhiều nhất.
    // Nếu chưa có đơn hàng nào (order_details trống) thì tạm thời trả về sản phẩm mới nhất
    // để trang Home không bị trống danh sách.
    public List<Product> getHotDeals() {
        List<Product> bestSelling = productRepository.findTop8BestSellingProducts();
        if (bestSelling.isEmpty()) {
            return productRepository.findTop8ByOrderByIdDesc();
        }
        return bestSelling;
    }

    // Lấy danh sách sản phẩm cho trang "Sản phẩm": lọc theo tên/danh mục/thương hiệu/khoảng giá,
    // sắp xếp theo mới nhất hoặc giá, có phân trang.
    public Page<Product> filterProducts(String name, Long categoryId, Long brandId,
                                        String priceRange, String sort, Pageable pageable) {
        String normalizedName = (name == null || name.isBlank()) ? null : name.trim();
        String normalizedPrice = (priceRange == null || priceRange.isBlank() || priceRange.equalsIgnoreCase("all"))
                ? null : priceRange;
        String normalizedSort = (sort == null || sort.isBlank()) ? "newest" : sort;

        Page<Long> idPage = productRepository.findFilteredProductIds(
                normalizedName, categoryId, brandId, normalizedPrice, normalizedSort, pageable);

        List<Long> ids = idPage.getContent();
        if (ids.isEmpty()) {
            return new PageImpl<>(Collections.emptyList(), pageable, idPage.getTotalElements());
        }

        // Giữ đúng thứ tự đã sắp xếp/phân trang từ câu truy vấn ID gốc
        Map<Long, Product> productMap = productRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(Product::getId, p -> p));
        List<Product> ordered = ids.stream()
                .map(productMap::get)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        return new PageImpl<>(ordered, pageable, idPage.getTotalElements());
    }

    // Lấy chi tiết 1 sản phẩm cùng danh sách biến thể (dùng cho trang chi tiết sản phẩm)
    public ProductDetailResponse getProductDetail(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy sản phẩm với id: " + id));

        List<ProductVariant> variants = product.getVariants();

        List<ProductDetailResponse.VariantResponse> variantResponses = variants == null
                ? Collections.emptyList()
                : variants.stream()
                  .map(v -> new ProductDetailResponse.VariantResponse(
                          v.getId(),
                          v.getWeight(),
                          v.getPrice(),
                          v.getStock(),
                          resolveVariantImage(v),
                          resolveVariantImages(v)
                  ))
                  .collect(Collectors.toList());

        String mainImage = product.getImage_url();

        return new ProductDetailResponse(
                product.getId(),
                product.getName(),
                product.getSlug(),
                product.getBrand() != null ? product.getBrand().getName() : null,
                product.getCategory() != null ? product.getCategory().getName() : null,
                mainImage,
                variantResponses
        );
    }

    // Ảnh đại diện của biến thể (ảnh chính is_primary, nếu không có thì lấy ảnh đầu tiên)
    private String resolveVariantImage(ProductVariant variant) {
        if (variant.getImages() == null || variant.getImages().isEmpty()) {
            return null;
        }
        return variant.getImages().stream()
                .filter(ImageProducts::isPrimary)
                .map(ImageProducts::getImageUrl)
                .findFirst()
                .orElse(variant.getImages().iterator().next().getImageUrl());
    }

    // Toàn bộ ảnh của biến thể, ảnh chính (is_primary) luôn đứng đầu danh sách.
    // Khi sau này thêm ảnh phụ (is_primary = false) cho biến thể, chúng sẽ tự động
    // xuất hiện thêm trong danh sách này mà không cần sửa code.
    private List<String> resolveVariantImages(ProductVariant variant) {
        if (variant.getImages() == null || variant.getImages().isEmpty()) {
            return Collections.emptyList();
        }
        return variant.getImages().stream()
                .sorted(Comparator.comparing(ImageProducts::isPrimary).reversed())
                .map(ImageProducts::getImageUrl)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }
}
