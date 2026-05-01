package vn.edu.hcmuaf.fit.milkstore.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.hcmuaf.fit.milkstore.entity.CartItem;

import java.util.List;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    // Lấy toàn bộ sản phẩm trong giỏ hàng của một ông khách (theo user_id)
    List<CartItem> findByUserId(Long userId);

    // Xóa toàn bộ giỏ hàng sau khi khách đã thanh toán xong
    void deleteByUserId(Long userId);
}