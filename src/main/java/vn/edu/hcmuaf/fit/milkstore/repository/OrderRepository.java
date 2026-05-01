package vn.edu.hcmuaf.fit.milkstore.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.hcmuaf.fit.milkstore.entity.Order;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    // Lấy lịch sử mua hàng của một khách hàng
    List<Order> findByUserId(Long userId);
}