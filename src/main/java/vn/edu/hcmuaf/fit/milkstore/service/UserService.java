package vn.edu.hcmuaf.fit.milkstore.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.hcmuaf.fit.milkstore.dto.UpdateProfileRequest;
import vn.edu.hcmuaf.fit.milkstore.dto.UserProfileResponse;
import vn.edu.hcmuaf.fit.milkstore.entity.User;
import vn.edu.hcmuaf.fit.milkstore.repository.UserRepository;
import vn.edu.hcmuaf.fit.milkstore.security.UserPrincipal;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

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
     * Lấy thông tin profile của user hiện tại
     */
    public UserProfileResponse getProfile() {
        User user = getCurrentUser();
        return new UserProfileResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getAddress(),
                user.getAvatar()
        );
    }

    /**
     * Cập nhật thông tin profile
     */
    @Transactional
    public UserProfileResponse updateProfile(UpdateProfileRequest request) {
        User user = getCurrentUser();

        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName().trim());
        }

        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }

        if (request.getAddress() != null) {
            user.setAddress(request.getAddress().trim());
        }

        userRepository.save(user);

        return new UserProfileResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getAddress(),
                user.getAvatar()
        );
    }

    /**
     * Upload avatar mới
     */
    @Transactional
    public UserProfileResponse uploadAvatar(MultipartFile file) {
        User user = getCurrentUser();

        // Xóa avatar cũ (nếu có)
        if (user.getAvatar() != null) {
            fileStorageService.deleteAvatar(user.getAvatar());
        }

        // Upload avatar mới
        String avatarPath = fileStorageService.storeAvatar(file);
        user.setAvatar(avatarPath);
        userRepository.save(user);

        return new UserProfileResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getAddress(),
                user.getAvatar()
        );
    }
}
