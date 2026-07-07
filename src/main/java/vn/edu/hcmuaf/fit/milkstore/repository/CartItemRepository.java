package vn.edu.hcmuaf.fit.milkstore.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import vn.edu.hcmuaf.fit.milkstore.entity.CartItem;
import vn.edu.hcmuaf.fit.milkstore.entity.ProductVariant;
import vn.edu.hcmuaf.fit.milkstore.entity.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    
    // Lấy toàn bộ giỏ hàng của user
    List<CartItem> findByUser(User user);
    
    // Tìm item cụ thể trong giỏ hàng của user
    Optional<CartItem> findByUserAndProductVariant(User user, ProductVariant productVariant);
    
    // Xóa item cụ thể trong giỏ hàng của user (an toàn - chỉ xóa item của user đó)
    void deleteByIdAndUser(Long id, User user);
    
    // Xóa toàn bộ giỏ hàng của user
    void deleteAllByUser(User user);
    
    // Đếm số lượng item trong giỏ hàng của user
    long countByUser(User user);
}
