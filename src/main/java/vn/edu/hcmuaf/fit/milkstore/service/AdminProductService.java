package vn.edu.hcmuaf.fit.milkstore.service;

import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import vn.edu.hcmuaf.fit.milkstore.dto.AdminProductDetailResponse;
import vn.edu.hcmuaf.fit.milkstore.dto.AdminProductResponse;
import vn.edu.hcmuaf.fit.milkstore.dto.ProductRequest;
import vn.edu.hcmuaf.fit.milkstore.entity.Brand;
import vn.edu.hcmuaf.fit.milkstore.entity.Category;
import vn.edu.hcmuaf.fit.milkstore.entity.ImageProducts;
import vn.edu.hcmuaf.fit.milkstore.entity.Product;
import vn.edu.hcmuaf.fit.milkstore.entity.ProductVariant;
import vn.edu.hcmuaf.fit.milkstore.repository.BrandRepository;
import vn.edu.hcmuaf.fit.milkstore.repository.CategoryRepository;
import vn.edu.hcmuaf.fit.milkstore.repository.ProductRepository;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;

    private static final Pattern NON_LATIN = Pattern.compile("[^a-zA-Z0-9\\s-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]+");

    // ---------- Danh sách sản phẩm ----------
    public List<AdminProductResponse> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::toListResponse)
                .collect(Collectors.toList());
    }

    // ---------- Chi tiết 1 sản phẩm (đổ vào form sửa) ----------
    public AdminProductDetailResponse getProductDetail(Long id) {
        Product product = findProductOrThrow(id);
        return toDetailResponse(product);
    }

    // ---------- Tạo sản phẩm mới ----------
    @Transactional
    public AdminProductDetailResponse createProduct(ProductRequest request) {
        validateRequest(request);

        Product product = new Product();
        product.setName(request.getName().trim());
        product.setSlug(generateUniqueSlug(request.getName()));
        product.setCategory(resolveCategory(request.getCategoryId()));
        product.setBrand(resolveBrand(request.getBrandId()));

        List<ProductVariant> variants = new ArrayList<>();
        for (ProductRequest.VariantRequest vr : request.getVariants()) {
            ProductVariant variant = new ProductVariant();
            variant.setProduct(product);
            applyVariantFields(variant, vr);
            variant.setImages(buildImages(variant, vr.getImages()));
            variants.add(variant);
        }
        product.setVariants(variants);

        Product saved = productRepository.save(product);
        return toDetailResponse(saved);
    }

    // ---------- Cập nhật sản phẩm ----------
    @Transactional
    public AdminProductDetailResponse updateProduct(Long id, ProductRequest request) {
        validateRequest(request);

        Product product = findProductOrThrow(id);
        product.setName(request.getName().trim());
        product.setCategory(resolveCategory(request.getCategoryId()));
        product.setBrand(resolveBrand(request.getBrandId()));

        List<ProductVariant> existingVariants = product.getVariants();
        if (existingVariants == null) {
            existingVariants = new ArrayList<>();
            product.setVariants(existingVariants);
        }
        Map<Long, ProductVariant> existingById = existingVariants.stream()
                .filter(v -> v.getId() != null)
                .collect(Collectors.toMap(ProductVariant::getId, v -> v));

        List<ProductVariant> reconciled = new ArrayList<>();
        for (ProductRequest.VariantRequest vr : request.getVariants()) {
            ProductVariant variant = (vr.getId() != null) ? existingById.get(vr.getId()) : null;
            if (variant == null) {
                variant = new ProductVariant();
                variant.setProduct(product);
            }
            applyVariantFields(variant, vr);
            reconcileImages(variant, vr.getImages());
            reconciled.add(variant);
        }

        // Xoá các biến thể không còn trong danh sách gửi lên (orphanRemoval sẽ xoá luôn khỏi DB)
        existingVariants.clear();
        existingVariants.addAll(reconciled);

        Product saved = productRepository.save(product);
        return toDetailResponse(saved);
    }

    // ---------- Xoá sản phẩm ----------
    @Transactional
    public void deleteProduct(Long id) {
        Product product = findProductOrThrow(id);
        try {
            productRepository.delete(product);
            productRepository.flush();
        } catch (DataIntegrityViolationException e) {
            // Biến thể của sản phẩm này đã nằm trong ít nhất 1 đơn hàng (FK RESTRICT) -> không cho xoá
            throw new IllegalStateException(
                    "Không thể xoá sản phẩm này vì đã có đơn hàng liên quan. Hãy sửa hoặc ngừng bán sản phẩm thay vì xoá.");
        }
    }

    // ================= Helper =================

    private Product findProductOrThrow(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy sản phẩm với id: " + id));
    }

    private Category resolveCategory(Long categoryId) {
        if (categoryId == null) return null;
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy danh mục với id: " + categoryId));
    }

    private Brand resolveBrand(Long brandId) {
        if (brandId == null) return null;
        return brandRepository.findById(brandId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy thương hiệu với id: " + brandId));
    }

    private void validateRequest(ProductRequest request) {
        if (request == null || !StringUtils.hasText(request.getName())) {
            throw new IllegalArgumentException("Tên sản phẩm không được để trống");
        }
        if (request.getVariants() == null || request.getVariants().isEmpty()) {
            throw new IllegalArgumentException("Sản phẩm cần có ít nhất 1 biến thể (khối lượng/giá/tồn kho)");
        }
        for (ProductRequest.VariantRequest vr : request.getVariants()) {
            if (!StringUtils.hasText(vr.getWeight())) {
                throw new IllegalArgumentException("Vui lòng nhập khối lượng cho tất cả biến thể");
            }
            if (vr.getPrice() == null || vr.getPrice() < 0) {
                throw new IllegalArgumentException("Giá biến thể không hợp lệ");
            }
            if (vr.getStock() == null || vr.getStock() < 0) {
                throw new IllegalArgumentException("Số lượng tồn kho không hợp lệ");
            }
        }
    }

    private void applyVariantFields(ProductVariant variant, ProductRequest.VariantRequest vr) {
        variant.setWeight(vr.getWeight().trim());
        variant.setPrice(vr.getPrice());
        variant.setStock(vr.getStock());
    }

    private Set<ImageProducts> buildImages(ProductVariant variant, List<ProductRequest.ImageRequest> imageRequests) {
        Set<ImageProducts> images = new HashSet<>();
        if (imageRequests == null) return images;
        for (ProductRequest.ImageRequest ir : imageRequests) {
            ImageProducts img = new ImageProducts();
            img.setProductVariant(variant);
            img.setImageUrl(ir.getImageUrl());
            img.setIsPrimary(Boolean.TRUE.equals(ir.getIsPrimary()));
            images.add(img);
        }
        ensureHasPrimary(images);
        return images;
    }

    private void reconcileImages(ProductVariant variant, List<ProductRequest.ImageRequest> imageRequests) {
        Set<ImageProducts> existingImages = variant.getImages();
        if (existingImages == null) {
            existingImages = new HashSet<>();
            variant.setImages(existingImages);
        }
        Map<Long, ImageProducts> existingById = existingImages.stream()
                .filter(img -> img.getId() != null)
                .collect(Collectors.toMap(ImageProducts::getId, img -> img));

        Set<ImageProducts> reconciled = new HashSet<>();
        if (imageRequests != null) {
            for (ProductRequest.ImageRequest ir : imageRequests) {
                ImageProducts img = (ir.getId() != null) ? existingById.get(ir.getId()) : null;
                if (img == null) {
                    img = new ImageProducts();
                    img.setProductVariant(variant);
                }
                img.setImageUrl(ir.getImageUrl());
                img.setIsPrimary(Boolean.TRUE.equals(ir.getIsPrimary()));
                reconciled.add(img);
            }
        }
        ensureHasPrimary(reconciled);

        existingImages.clear();
        existingImages.addAll(reconciled);
    }

    // Nếu chưa có ảnh nào được đánh dấu là ảnh chính, tự động chọn ảnh đầu tiên làm ảnh chính
    private void ensureHasPrimary(Set<ImageProducts> images) {
        if (images.isEmpty()) return;
        boolean hasPrimary = images.stream().anyMatch(ImageProducts::isPrimary);
        if (!hasPrimary) {
            images.iterator().next().setIsPrimary(true);
        }
    }

    // Tạo slug duy nhất từ tên sản phẩm (vd: "Sữa tươi ABC" -> "sua-tuoi-abc", trùng thì thêm số)
    private String generateUniqueSlug(String name) {
        String base = toSlug(name);
        String slug = base;
        int suffix = 1;
        while (productRepository.existsBySlug(slug)) {
            slug = base + "-" + (++suffix);
        }
        return slug;
    }

    private String toSlug(String input) {
        String noAccent = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("[\\p{InCombiningDiacriticalMarks}]", "");
        noAccent = noAccent.replace('đ', 'd').replace('Đ', 'D');
        String slug = NON_LATIN.matcher(noAccent).replaceAll("");
        slug = WHITESPACE.matcher(slug.trim()).replaceAll("-");
        slug = slug.toLowerCase();
        return slug.isEmpty() ? "san-pham" : slug;
    }

    private AdminProductResponse toListResponse(Product p) {
        List<ProductVariant> variants = p.getVariants();
        Double minPrice = null, maxPrice = null;
        int totalStock = 0;
        int variantCount = 0;
        if (variants != null) {
            variantCount = variants.size();
            for (ProductVariant v : variants) {
                if (v.getPrice() != null) {
                    minPrice = (minPrice == null) ? v.getPrice() : Math.min(minPrice, v.getPrice());
                    maxPrice = (maxPrice == null) ? v.getPrice() : Math.max(maxPrice, v.getPrice());
                }
                if (v.getStock() != null) {
                    totalStock += v.getStock();
                }
            }
        }

        return new AdminProductResponse(
                p.getId(),
                p.getName(),
                p.getSlug(),
                p.getCategory() != null ? p.getCategory().getId() : null,
                p.getCategory() != null ? p.getCategory().getName() : null,
                p.getBrand() != null ? p.getBrand().getId() : null,
                p.getBrand() != null ? p.getBrand().getName() : null,
                p.getImage_url(),
                minPrice,
                maxPrice,
                totalStock,
                variantCount
        );
    }

    private AdminProductDetailResponse toDetailResponse(Product p) {
        List<AdminProductDetailResponse.VariantItem> variantItems = new ArrayList<>();
        if (p.getVariants() != null) {
            for (ProductVariant v : p.getVariants()) {
                List<AdminProductDetailResponse.ImageItem> imageItems = new ArrayList<>();
                if (v.getImages() != null) {
                    for (ImageProducts img : v.getImages()) {
                        imageItems.add(new AdminProductDetailResponse.ImageItem(
                                img.getId(), img.getImageUrl(), img.isPrimary()));
                    }
                }
                variantItems.add(new AdminProductDetailResponse.VariantItem(
                        v.getId(), v.getWeight(), v.getPrice(), v.getStock(), imageItems));
            }
        }

        return new AdminProductDetailResponse(
                p.getId(),
                p.getName(),
                p.getSlug(),
                p.getCategory() != null ? p.getCategory().getId() : null,
                p.getCategory() != null ? p.getCategory().getName() : null,
                p.getBrand() != null ? p.getBrand().getId() : null,
                p.getBrand() != null ? p.getBrand().getName() : null,
                variantItems
        );
    }
}
