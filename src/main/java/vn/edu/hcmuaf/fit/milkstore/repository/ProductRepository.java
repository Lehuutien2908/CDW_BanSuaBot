package vn.edu.hcmuaf.fit.milkstore.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.edu.hcmuaf.fit.milkstore.entity.Product;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // Kiểm tra slug đã tồn tại chưa (dùng khi tạo sản phẩm mới ở Admin)
    boolean existsBySlug(String slug);

    // Lấy sản phẩm mới nhất (theo ID giảm dần)
    List<Product> findTop8ByOrderByIdDesc();

    // Tìm kiếm nhanh theo tên
    List<Product> findTop10ByNameContainingIgnoreCase(String name);

    // Lấy 8 sản phẩm bán chạy nhất dựa trên tổng số lượng đã bán trong order_details
    @Query(value = "SELECT p.* FROM products p " +
            "JOIN product_variants pv ON pv.product_id = p.id " +
            "JOIN order_details od ON od.variant_id = pv.id " +
            "GROUP BY p.id " +
            "ORDER BY SUM(od.quantity) DESC " +
            "LIMIT 8",
            nativeQuery = true)
    List<Product> findTop8BestSellingProducts();

    // Lấy danh sách ID sản phẩm phù hợp với các bộ lọc (tên, danh mục, thương hiệu, khoảng giá) có phân trang + sắp xếp
    @Query(value = "SELECT p.id FROM products p " +
            "LEFT JOIN product_variants pv ON pv.product_id = p.id " +
            "WHERE (:name IS NULL OR p.name LIKE CONCAT('%', :name, '%')) " +
            "AND (:categoryId IS NULL OR p.category_id = :categoryId) " +
            "AND (:brandId IS NULL OR p.brand_id = :brandId) " +
            "GROUP BY p.id " +
            "HAVING (:priceRange IS NULL " +
            "   OR (:priceRange = 'under_300' AND MIN(pv.price) < 300000) " +
            "   OR (:priceRange = '300_600' AND MIN(pv.price) BETWEEN 300000 AND 600000) " +
            "   OR (:priceRange = 'over_600' AND MIN(pv.price) > 600000)) " +
            "ORDER BY " +
            "   CASE WHEN :sort = 'price_asc' THEN MIN(pv.price) ELSE NULL END ASC, " +
            "   CASE WHEN :sort = 'price_desc' THEN MIN(pv.price) ELSE NULL END DESC, " +
            "   p.id DESC",
            countQuery = "SELECT COUNT(*) FROM (" +
                    "SELECT p.id FROM products p " +
                    "LEFT JOIN product_variants pv ON pv.product_id = p.id " +
                    "WHERE (:name IS NULL OR p.name LIKE CONCAT('%', :name, '%')) " +
                    "AND (:categoryId IS NULL OR p.category_id = :categoryId) " +
                    "AND (:brandId IS NULL OR p.brand_id = :brandId) " +
                    "GROUP BY p.id " +
                    "HAVING (:priceRange IS NULL " +
                    "   OR (:priceRange = 'under_300' AND MIN(pv.price) < 300000) " +
                    "   OR (:priceRange = '300_600' AND MIN(pv.price) BETWEEN 300000 AND 600000) " +
                    "   OR (:priceRange = 'over_600' AND MIN(pv.price) > 600000))" +
                    ") sub",
            nativeQuery = true)
    Page<Long> findFilteredProductIds(@Param("name") String name,
                                      @Param("categoryId") Long categoryId,
                                      @Param("brandId") Long brandId,
                                      @Param("priceRange") String priceRange,
                                      @Param("sort") String sort,
                                      Pageable pageable);
}