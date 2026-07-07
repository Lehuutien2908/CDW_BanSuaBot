package vn.edu.hcmuaf.fit.milkstore.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hcmuaf.fit.milkstore.dto.CreateOrderRequest;
import vn.edu.hcmuaf.fit.milkstore.dto.OrderResponse;
import vn.edu.hcmuaf.fit.milkstore.entity.*;
import vn.edu.hcmuaf.fit.milkstore.repository.CartItemRepository;
import vn.edu.hcmuaf.fit.milkstore.repository.OrderDetailRepository;
import vn.edu.hcmuaf.fit.milkstore.repository.OrderRepository;
import vn.edu.hcmuaf.fit.milkstore.security.UserPrincipal;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CheckoutService {

    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;

    /**
     * Lấy User từ SecurityContext
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new SecurityException("Vui lòng đăng nhập để đặt hàng");
        }
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return principal.getUser();
    }

    /**
     * Tạo đơn hàng từ giỏ hàng
     */
    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        User user = getCurrentUser();

        // Validate
        if (request.getReceiverName() == null || request.getReceiverName().trim().isEmpty()) {
            throw new IllegalArgumentException("Vui lòng nhập tên người nhận");
        }
        if (request.getReceiverPhone() == null || request.getReceiverPhone().trim().isEmpty()) {
            throw new IllegalArgumentException("Vui lòng nhập số điện thoại người nhận");
        }
        if (request.getShippingAddress() == null || request.getShippingAddress().trim().isEmpty()) {
            throw new IllegalArgumentException("Vui lòng nhập địa chỉ giao hàng");
        }
        if (request.getPaymentMethod() == null || 
            (!request.getPaymentMethod().equals("COD") && !request.getPaymentMethod().equals("VNPAY"))) {
            throw new IllegalArgumentException("Phương thức thanh toán không hợp lệ");
        }

        // Lấy giỏ hàng
        List<CartItem> cartItems = cartItemRepository.findByUser(user);
        if (cartItems.isEmpty()) {
            throw new IllegalArgumentException("Giỏ hàng trống, không thể đặt hàng");
        }

        // Tính tổng tiền và kiểm tra stock
        double totalPrice = 0;
        for (CartItem item : cartItems) {
            ProductVariant variant = item.getProductVariant();
            
            // Kiểm tra stock
            if (variant.getStock() < item.getQuantity()) {
                throw new IllegalArgumentException(
                    "Sản phẩm " + variant.getProduct().getName() + 
                    " không đủ số lượng. Còn lại: " + variant.getStock()
                );
            }
            
            totalPrice += variant.getPrice() * item.getQuantity();
        }

        // Tạo Order
        Order order = new Order();
        order.setUser(user);
        order.setOrderDate(LocalDateTime.now());
        order.setTotalPrice(totalPrice);
        order.setStatus("PENDING"); // Chờ xác nhận
        order.setReceiverName(request.getReceiverName().trim());
        order.setReceiverPhone(request.getReceiverPhone().trim());
        order.setShippingAddress(request.getShippingAddress().trim());
        
        orderRepository.save(order);

        // Tạo OrderDetails và trừ stock
        for (CartItem item : cartItems) {
            ProductVariant variant = item.getProductVariant();
            
            OrderDetail detail = new OrderDetail();
            detail.setOrder(order);
            detail.setProductVariant(variant);
            detail.setQuantity(item.getQuantity());
            detail.setUnitPrice(variant.getPrice());
            
            orderDetailRepository.save(detail);
            
            // Trừ stock
            variant.setStock(variant.getStock() - item.getQuantity());
        }

        // Xóa giỏ hàng
        cartItemRepository.deleteAll(cartItems);

        // Build response
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

        // Nếu là VNPAY, bạn sẽ tạo URL thanh toán ở đây
        // response.setVnpayUrl("https://sandbox.vnpayment.vn/...");
        response.setVnpayUrl(null); // Tạm thời null, bạn sẽ implement sau

        return response;
    }
}
