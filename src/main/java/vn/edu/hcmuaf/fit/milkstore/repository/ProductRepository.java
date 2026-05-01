package vn.edu.hcmuaf.fit.milkstore.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.hcmuaf.fit.milkstore.entity.Product;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findBySlug(String slug);

    // Tìm tất cả sản phẩm thuộc về một Danh mục
    List<Product> findByCategoryId(Long categoryId);

    // Tính năng thanh tìm kiếm: Khách gõ chữ "vinamilk" là ra hết sữa có chữ vinamilk
    List<Product> findByNameContainingIgnoreCase(String name);
}