package vn.edu.hcmuaf.fit.milkstore.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
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
}