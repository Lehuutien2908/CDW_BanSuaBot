package vn.edu.hcmuaf.fit.milkstore.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hcmuaf.fit.milkstore.dto.UserAdminResponse;
import vn.edu.hcmuaf.fit.milkstore.entity.Order;
import vn.edu.hcmuaf.fit.milkstore.entity.Role;
import vn.edu.hcmuaf.fit.milkstore.entity.User;
import vn.edu.hcmuaf.fit.milkstore.repository.OrderRepository;
import vn.edu.hcmuaf.fit.milkstore.repository.UserRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminCustomerService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    /**
     * Lấy danh sách tất cả khách hàng
     */
    public List<UserAdminResponse> getAllUsers() {
        List<User> users = userRepository.findAll();
        
        return users.stream()
                .map(this::mapToUserAdminResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy thông tin chi tiết khách hàng
     */
    public UserAdminResponse getUserDetail(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));
        
        return mapToUserAdminResponse(user);
    }

    /**
     * Kích hoạt/Vô hiệu hóa tài khoản
     */
    @Transactional
    public UserAdminResponse toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));
        
        // Toggle enabled status
        user.setEnabled(!user.isEnabled());
        userRepository.save(user);
        
        return mapToUserAdminResponse(user);
    }

    /**
     * Map User entity sang UserAdminResponse DTO
     */
    private UserAdminResponse mapToUserAdminResponse(User user) {
        List<String> roleNames = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList());
        
        List<Order> userOrders = orderRepository.findByUserId(user.getId());
        
        Integer totalOrders = userOrders.size();
        Double totalSpent = userOrders.stream()
                .filter(order -> !"CANCELLED".equalsIgnoreCase(order.getStatus()))
                .mapToDouble(order -> order.getTotalPrice() != null ? order.getTotalPrice() : 0.0)
                .sum();
        
        return new UserAdminResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getAddress(),
                user.isEnabled(),
                roleNames,
                totalOrders,
                totalSpent
        );
    }
}
