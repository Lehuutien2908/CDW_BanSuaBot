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
    @Query(value = "SELECT p.* FROM products p " +
            "JOIN product_variants pv ON p.id = pv.product_id " +
            "JOIN order_details od ON pv.id = od.variant_id " +
            "GROUP BY p.id " +
            "ORDER BY SUM(od.quantity) DESC " +
            "LIMIT 4", nativeQuery = true)
    List<Product> findTopHotDeals();

    @Query(value = "SELECT p.* FROM products p " +
            "ORDER BY p.id DESC " +
            "LIMIT 4", nativeQuery = true)
    List<Product> findTopNewProducts();

    List<Product> findTop5ByNameContainingIgnoreCase(String name);

    List<Product> findByNameContainingIgnoreCase(String name);

    @Query(value = "SELECT p FROM Product p LEFT JOIN p.variants v WHERE " +
            "(:name IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
            "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
            "(:brandId IS NULL OR p.brand.id = :brandId) AND " +
            "(:minPrice IS NULL OR v.price >= :minPrice) AND " +
            "(:maxPrice IS NULL OR v.price <= :maxPrice) " +
            "GROUP BY p " +
            "ORDER BY p.id DESC",
            countQuery = "SELECT COUNT(DISTINCT p) FROM Product p LEFT JOIN p.variants v WHERE " +
                    "(:name IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
                    "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
                    "(:brandId IS NULL OR p.brand.id = :brandId) AND " +
                    "(:minPrice IS NULL OR v.price >= :minPrice) AND " +
                    "(:maxPrice IS NULL OR v.price <= :maxPrice)")
    Page<Product> filterProductsNewest(@Param("name") String name, @Param("categoryId") Long categoryId, @Param("brandId") Long brandId, @Param("minPrice") Double minPrice, @Param("maxPrice") Double maxPrice, Pageable pageable);

    // Lọc và Sắp xếp GIÁ TỪ THẤP ĐẾN CAO
    @Query(value = "SELECT p FROM Product p LEFT JOIN p.variants v WHERE " +
            "(:name IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
            "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
            "(:brandId IS NULL OR p.brand.id = :brandId) AND " +
            "(:minPrice IS NULL OR v.price >= :minPrice) AND " +
            "(:maxPrice IS NULL OR v.price <= :maxPrice) " +
            "GROUP BY p " +
            "ORDER BY MIN(v.price) ASC",
            countQuery = "SELECT COUNT(DISTINCT p) FROM Product p LEFT JOIN p.variants v WHERE " +
                    "(:name IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
                    "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
                    "(:brandId IS NULL OR p.brand.id = :brandId) AND " +
                    "(:minPrice IS NULL OR v.price >= :minPrice) AND " +
                    "(:maxPrice IS NULL OR v.price <= :maxPrice)")
    Page<Product> filterProductsPriceAsc(@Param("name") String name, @Param("categoryId") Long categoryId, @Param("brandId") Long brandId, @Param("minPrice") Double minPrice, @Param("maxPrice") Double maxPrice, Pageable pageable);

    // Lọc và Sắp xếp GIÁ TỪ CAO XUỐNG THẤP
    @Query(value = "SELECT p FROM Product p LEFT JOIN p.variants v WHERE " +
            "(:name IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
            "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
            "(:brandId IS NULL OR p.brand.id = :brandId) AND " +
            "(:minPrice IS NULL OR v.price >= :minPrice) AND " +
            "(:maxPrice IS NULL OR v.price <= :maxPrice) " +
            "GROUP BY p " +
            "ORDER BY MIN(v.price) DESC",
            countQuery = "SELECT COUNT(DISTINCT p) FROM Product p LEFT JOIN p.variants v WHERE " +
                    "(:name IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
                    "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
                    "(:brandId IS NULL OR p.brand.id = :brandId) AND " +
                    "(:minPrice IS NULL OR v.price >= :minPrice) AND " +
                    "(:maxPrice IS NULL OR v.price <= :maxPrice)")
    Page<Product> filterProductsPriceDesc(@Param("name") String name, @Param("categoryId") Long categoryId, @Param("brandId") Long brandId, @Param("minPrice") Double minPrice, @Param("maxPrice") Double maxPrice, Pageable pageable);

}