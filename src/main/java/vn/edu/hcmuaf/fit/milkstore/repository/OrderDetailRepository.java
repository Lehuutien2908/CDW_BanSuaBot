package vn.edu.hcmuaf.fit.milkstore.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.hcmuaf.fit.milkstore.entity.OrderDetail;

import java.util.List;

@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {
    // Lấy tất cả chi tiết của một đơn hàng cụ thể
    List<OrderDetail> findByOrderId(Long orderId);
}