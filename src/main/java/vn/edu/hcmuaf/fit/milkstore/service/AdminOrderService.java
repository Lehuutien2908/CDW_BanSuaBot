package vn.edu.hcmuaf.fit.milkstore.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hcmuaf.fit.milkstore.dto.OrderAdminResponse;
import vn.edu.hcmuaf.fit.milkstore.dto.OrderHistoryResponse;
import vn.edu.hcmuaf.fit.milkstore.dto.OrderItemResponse;
import vn.edu.hcmuaf.fit.milkstore.entity.*;
import vn.edu.hcmuaf.fit.milkstore.repository.OrderDetailRepository;
import vn.edu.hcmuaf.fit.milkstore.repository.OrderRepository;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminOrderService {

    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;

    /**
     * Lấy danh sách tất cả đơn hàng (có thể lọc theo trạng thái)
     */
    public List<OrderAdminResponse> getAllOrders(String status) {
        List<Order> orders;
        
        if (status != null && !status.trim().isEmpty()) {
            orders = orderRepository.findByStatusOrderByOrderDateDesc(status);
        } else {
            orders = orderRepository.findAllByOrderByOrderDateDesc();
        }
        
        return orders.stream()
                .map(this::mapToOrderAdminResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy chi tiết đơn hàng
     */
    public OrderHistoryResponse getOrderDetail(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));
        
        return mapToOrderHistoryResponse(order);
    }

    /**
     * Cập nhật trạng thái đơn hàng
     */
    @Transactional
    public OrderAdminResponse updateOrderStatus(Long orderId, String newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));
        
        // Validate status
        if (!isValidStatus(newStatus)) {
            throw new IllegalArgumentException("Trạng thái không hợp lệ: " + newStatus);
        }
        
        order.setStatus(newStatus);
        orderRepository.save(order);
        
        return mapToOrderAdminResponse(order);
    }

    /**
     * Kiểm tra trạng thái hợp lệ
     */
    private boolean isValidStatus(String status) {
        return List.of("PENDING", "PROCESSING", "SHIPPING", "DELIVERED", "CANCELLED")
                .contains(status.toUpperCase());
    }

    /**
     * Map Order entity sang OrderAdminResponse DTO
     */
    private OrderAdminResponse mapToOrderAdminResponse(Order order) {
        List<OrderDetail> orderDetails = orderDetailRepository.findByOrderId(order.getId());
        
        Integer totalItems = orderDetails.stream()
                .mapToInt(OrderDetail::getQuantity)
                .sum();
        
        String orderCode = "DH" + order.getId() + 
                          order.getOrderDate().format(DateTimeFormatter.ofPattern("ddMMyy"));
        
        return new OrderAdminResponse(
                order.getId(),
                orderCode,
                order.getOrderDate(),
                order.getUser().getFullName(),
                order.getUser().getEmail(),
                order.getReceiverPhone(),
                order.getShippingAddress(),
                order.getTotalPrice(),
                order.getStatus(),
                totalItems
        );
    }

    /**
     * Map Order entity sang OrderHistoryResponse DTO (chi tiết đầy đủ)
     */
    private OrderHistoryResponse mapToOrderHistoryResponse(Order order) {
        List<OrderDetail> orderDetails = orderDetailRepository.findByOrderId(order.getId());
        
        List<OrderItemResponse> items = orderDetails.stream()
                .map(this::mapToOrderItemResponse)
                .collect(Collectors.toList());
        
        String orderCode = "DH" + order.getId() + 
                          order.getOrderDate().format(DateTimeFormatter.ofPattern("ddMMyy"));
        
        return new OrderHistoryResponse(
                order.getId(),
                orderCode,
                order.getOrderDate(),
                order.getTotalPrice(),
                order.getStatus(),
                order.getReceiverName(),
                order.getReceiverPhone(),
                order.getShippingAddress(),
                items
        );
    }

    /**
     * Map OrderDetail entity sang OrderItemResponse DTO
     */
    private OrderItemResponse mapToOrderItemResponse(OrderDetail detail) {
        ProductVariant variant = detail.getProductVariant();
        Product product = variant.getProduct();
        
        String imageUrl = null;
        if (variant.getImages() != null && !variant.getImages().isEmpty()) {
            imageUrl = variant.getImages().stream()
                    .filter(ImageProducts::isPrimary)
                    .map(ImageProducts::getImageUrl)
                    .findFirst()
                    .orElse(variant.getImages().iterator().next().getImageUrl());
        }
        
        return new OrderItemResponse(
                product.getName(),
                variant.getWeight(),
                detail.getQuantity(),
                detail.getUnitPrice(),
                imageUrl
        );
    }
}
