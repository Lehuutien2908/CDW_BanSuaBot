package vn.edu.hcmuaf.fit.milkstore.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.edu.hcmuaf.fit.milkstore.entity.Order;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    // Lấy lịch sử mua hàng của một khách hàng, sắp xếp theo ngày mới nhất
    List<Order> findByUserIdOrderByOrderDateDesc(Long userId);
    
    // Lấy tất cả đơn hàng của một user (dùng cho Admin)
    List<Order> findByUserId(Long userId);

    // Dùng cho trang thống kê Admin: lấy tất cả đơn hàng có ngày đặt nằm trong 1 khoảng thời gian (VD: 1 tháng)
    @Query("SELECT o FROM Order o WHERE o.orderDate >= :start AND o.orderDate < :end")
    List<Order> findByOrderDateBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    
    // Lấy tất cả đơn hàng sắp xếp theo ngày mới nhất (dùng cho Admin)
    List<Order> findAllByOrderByOrderDateDesc();
    
    // Lọc đơn hàng theo trạng thái, sắp xếp theo ngày mới nhất (dùng cho Admin)
    List<Order> findByStatusOrderByOrderDateDesc(String status);
}