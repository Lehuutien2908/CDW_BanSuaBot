package vn.edu.hcmuaf.fit.milkstore.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hcmuaf.fit.milkstore.dto.AddToCartRequest;
import vn.edu.hcmuaf.fit.milkstore.dto.CartItemResponse;
import vn.edu.hcmuaf.fit.milkstore.dto.CartResponse;
import vn.edu.hcmuaf.fit.milkstore.entity.CartItem;
import vn.edu.hcmuaf.fit.milkstore.entity.ImageProducts;
import vn.edu.hcmuaf.fit.milkstore.entity.Product;
import vn.edu.hcmuaf.fit.milkstore.entity.ProductVariant;
import vn.edu.hcmuaf.fit.milkstore.entity.User;
import vn.edu.hcmuaf.fit.milkstore.repository.CartItemRepository;
import vn.edu.hcmuaf.fit.milkstore.repository.ProductVariantRepository;
import vn.edu.hcmuaf.fit.milkstore.security.UserPrincipal;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository productVariantRepository;

    /**
     * Lấy User từ SecurityContext
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new SecurityException("Vui lòng đăng nhập để sử dụng giỏ hàng");
        }
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return principal.getUser();
    }

    /**
     * Thêm sản phẩm vào giỏ hàng
     */
    @Transactional
    public CartResponse addToCart(AddToCartRequest request) {
        User user = getCurrentUser();

        // Validate quantity
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new IllegalArgumentException("Số lượng phải lớn hơn 0");
        }

        // Kiểm tra ProductVariant tồn tại
        ProductVariant variant = productVariantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new NoSuchElementException("Sản phẩm không tồn tại"));

        // Kiểm tra stock
        if (variant.getStock() < request.getQuantity()) {
            throw new IllegalArgumentException("Số lượng tồn kho không đủ. Còn lại: " + variant.getStock());
        }

        // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
        CartItem cartItem = cartItemRepository.findByUserAndProductVariant(user, variant)
                .orElse(null);

        if (cartItem != null) {
            // Đã có -> cộng thêm quantity
            int newQuantity = cartItem.getQuantity() + request.getQuantity();
            if (variant.getStock() < newQuantity) {
                throw new IllegalArgumentException("Số lượng tồn kho không đủ. Còn lại: " + variant.getStock());
            }
            cartItem.setQuantity(newQuantity);
        } else {
            // Chưa có -> tạo mới
            cartItem = new CartItem();
            cartItem.setUser(user);
            cartItem.setProductVariant(variant);
            cartItem.setQuantity(request.getQuantity());
        }

        cartItemRepository.save(cartItem);

        return getMyCart();
    }

    /**
     * Lấy giỏ hàng của user hiện tại
     */
    public CartResponse getMyCart() {
        User user = getCurrentUser();

        List<CartItem> cartItems = cartItemRepository.findByUser(user);

        List<CartItemResponse> items = cartItems.stream()
                .map(this::mapToCartItemResponse)
                .collect(Collectors.toList());

        int totalQuantity = items.stream()
                .mapToInt(CartItemResponse::getQuantity)
                .sum();

        double totalPrice = items.stream()
                .mapToDouble(CartItemResponse::getSubtotal)
                .sum();

        return new CartResponse(items, totalQuantity, totalPrice);
    }

    /**
     * Cập nhật số lượng sản phẩm trong giỏ hàng
     */
    @Transactional
    public CartResponse updateQuantity(Long cartItemId, Integer quantity) {
        User user = getCurrentUser();

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy sản phẩm trong giỏ hàng"));

        // Kiểm tra item có thuộc về user hiện tại không
        if (!cartItem.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Bạn không có quyền thực hiện thao tác này");
        }

        // Nếu quantity <= 0 -> xóa item
        if (quantity == null || quantity <= 0) {
            cartItemRepository.delete(cartItem);
            return getMyCart();
        }

        // Kiểm tra stock
        if (cartItem.getProductVariant().getStock() < quantity) {
            throw new IllegalArgumentException("Số lượng tồn kho không đủ. Còn lại: " 
                    + cartItem.getProductVariant().getStock());
        }

        cartItem.setQuantity(quantity);
        cartItemRepository.save(cartItem);

        return getMyCart();
    }

    /**
     * Xóa item khỏi giỏ hàng
     */
    @Transactional
    public CartResponse removeItem(Long cartItemId) {
        User user = getCurrentUser();

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy sản phẩm trong giỏ hàng"));

        // Kiểm tra item có thuộc về user hiện tại không
        if (!cartItem.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Bạn không có quyền thực hiện thao tác này");
        }

        cartItemRepository.delete(cartItem);

        return getMyCart();
    }

    /**
     * Xóa toàn bộ giỏ hàng
     */
    @Transactional
    public CartResponse clearCart() {
        User user = getCurrentUser();
        cartItemRepository.deleteAllByUser(user);
        return getMyCart();
    }

    /**
     * Map CartItem entity sang CartItemResponse DTO
     */
    private CartItemResponse mapToCartItemResponse(CartItem cartItem) {
        ProductVariant variant = cartItem.getProductVariant();
        Product product = variant.getProduct();

        // Lấy ảnh đại diện
        String image = variant.getImages() != null && !variant.getImages().isEmpty()
                ? variant.getImages().stream()
                        .filter(ImageProducts::isPrimary)
                        .map(ImageProducts::getImageUrl)
                        .findFirst()
                        .orElse(variant.getImages().iterator().next().getImageUrl())
                : null;

        double subtotal = variant.getPrice() * cartItem.getQuantity();

        return new CartItemResponse(
                cartItem.getId(),
                product.getId(),
                variant.getId(),
                product.getName(),
                image,
                variant.getWeight() + "g",
                variant.getPrice(),
                cartItem.getQuantity(),
                variant.getStock(),
                subtotal
        );
    }
}
