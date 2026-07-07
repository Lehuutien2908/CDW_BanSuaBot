package vn.edu.hcmuaf.fit.milkstore.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hcmuaf.fit.milkstore.dto.CreateOrderRequest;
import vn.edu.hcmuaf.fit.milkstore.dto.OrderHistoryResponse;
import vn.edu.hcmuaf.fit.milkstore.dto.OrderItemResponse;
import vn.edu.hcmuaf.fit.milkstore.dto.OrderResponse;
import vn.edu.hcmuaf.fit.milkstore.entity.*;
import vn.edu.hcmuaf.fit.milkstore.repository.*;
import vn.edu.hcmuaf.fit.milkstore.security.UserPrincipal;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final CartItemRepository cartItemRepository;
    private final PaymentRepository paymentRepository;
    private final ProductVariantRepository productVariantRepository;
    private final VNPayService vnPayService;

    /**
     * Lấy User từ SecurityContext
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new SecurityException("Vui lòng đăng nhập");
        }
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return principal.getUser();
    }

    /**
     * Lấy lịch sử mua hàng của user hiện tại
     */
    public List<OrderHistoryResponse> getOrderHistory() {
        User user = getCurrentUser();

        List<Order> orders = orderRepository.findByUserIdOrderByOrderDateDesc(user.getId());

        return orders.stream()
                .map(this::mapToOrderHistoryResponse)
                .collect(Collectors.toList());
    }

    /**
     * Tạo đơn hàng mới từ giỏ hàng
     */
    @Transactional
    public OrderResponse checkout(CreateOrderRequest request) {
        User user = getCurrentUser();

        // 1. Validate giỏ hàng
        List<CartItem> cartItems = cartItemRepository.findByUser(user);
        if (cartItems.isEmpty()) {
            throw new IllegalStateException("Giỏ hàng trống");
        }

        // 2. Validate và tính tổng tiền
        double totalPrice = 0.0;
        for (CartItem item : cartItems) {
            ProductVariant variant = item.getProductVariant();
            
            // Kiểm tra stock
            if (variant.getStock() < item.getQuantity()) {
                throw new IllegalStateException(
                    "Sản phẩm " + variant.getProduct().getName() + 
                    " không đủ hàng. Còn " + variant.getStock() + " sản phẩm"
                );
            }
            
            totalPrice += variant.getPrice() * item.getQuantity();
        }

        // 3. Tạo Order
        Order order = new Order();
        order.setUser(user);
        order.setOrderDate(LocalDateTime.now());
        order.setTotalPrice(totalPrice);
        order.setStatus("PENDING"); // Chờ xác nhận
        order.setReceiverName(request.getReceiverName());
        order.setReceiverPhone(request.getReceiverPhone());
        order.setShippingAddress(request.getShippingAddress());
        
        order = orderRepository.save(order);

        // 4. Tạo OrderDetails và trừ stock
        for (CartItem item : cartItems) {
            ProductVariant variant = item.getProductVariant();
            
            OrderDetail detail = new OrderDetail();
            detail.setOrder(order);
            detail.setProductVariant(variant);
            detail.setQuantity(item.getQuantity());
            detail.setUnitPrice(variant.getPrice()); // Lưu giá tại thời điểm mua
            
            orderDetailRepository.save(detail);
            
            // Trừ stock
            variant.setStock(variant.getStock() - item.getQuantity());
            productVariantRepository.save(variant);
        }

        // 5. Tạo Payment record
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setAmount(totalPrice);
        payment.setPaymentDate(LocalDateTime.now());
        
        if ("COD".equals(request.getPaymentMethod())) {
            payment.setPaymentStatus("PENDING"); // Chờ thanh toán khi nhận hàng
        } else if ("VNPAY".equals(request.getPaymentMethod())) {
            payment.setPaymentStatus("PENDING"); // Chờ thanh toán online
        }
        
        paymentRepository.save(payment);

        // 6. Xóa giỏ hàng
        cartItemRepository.deleteAllByUser(user);

        // 7. Tạo response
        String orderCode = "DH" + order.getId() + 
                          order.getOrderDate().format(DateTimeFormatter.ofPattern("ddMMyy"));

        OrderResponse response = new OrderResponse();
        response.setOrderId(order.getId());
        response.setOrderCode(orderCode);
        response.setOrderDate(order.getOrderDate());
        response.setTotalPrice(order.getTotalPrice());
        response.setStatus(order.getStatus());
        response.setPaymentMethod(request.getPaymentMethod());
        response.setReceiverName(order.getReceiverName());
        response.setReceiverPhone(order.getReceiverPhone());
        response.setShippingAddress(order.getShippingAddress());
        
        // 8. Nếu là VNPay, sinh URL thanh toán
        if ("VNPAY".equals(request.getPaymentMethod())) {
            String orderInfo = "Thanh toan don hang " + orderCode;
            String vnpayUrl = vnPayService.buildPaymentUrl(order.getId(), totalPrice, orderInfo);
            response.setVnpayUrl(vnpayUrl);
        }

        return response;
    }

    /**
     * Map Order entity sang OrderHistoryResponse DTO
     */
    private OrderHistoryResponse mapToOrderHistoryResponse(Order order) {
        List<OrderDetail> orderDetails = orderDetailRepository.findByOrderId(order.getId());

        List<OrderItemResponse> items = orderDetails.stream()
                .map(this::mapToOrderItemResponse)
                .collect(Collectors.toList());

        // Generate order code: DH{id}{ddMMyy}
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

        // Lấy ảnh đại diện
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
