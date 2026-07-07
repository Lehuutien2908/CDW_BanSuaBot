package vn.edu.hcmuaf.fit.milkstore.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.hcmuaf.fit.milkstore.config.FileStorageProperties;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileStorageService {

    private final FileStorageProperties fileStorageProperties;

    /**
     * Khởi tạo thư mục upload nếu chưa tồn tại
     */
    private Path getUploadPath() {
        try {
            Path uploadPath = Paths.get(fileStorageProperties.getUploadDir()).toAbsolutePath().normalize();
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            return uploadPath;
        } catch (IOException e) {
            throw new RuntimeException("Không thể tạo thư mục upload", e);
        }
    }

    /**
     * Upload avatar và trả về đường dẫn file
     */
    public String storeAvatar(MultipartFile file) {
        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File không được để trống");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());

        // Check file extension
        String extension = "";
        int lastDotIndex = originalFilename.lastIndexOf('.');
        if (lastDotIndex > 0) {
            extension = originalFilename.substring(lastDotIndex).toLowerCase();
        }

        // Chỉ chấp nhận ảnh
        if (!extension.matches("\\.(jpg|jpeg|png|gif|webp)")) {
            throw new IllegalArgumentException("Chỉ chấp nhận file ảnh (jpg, jpeg, png, gif, webp)");
        }

        // Check file size (max 5MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("Kích thước file không được vượt quá 5MB");
        }

        try {
            // Tạo tên file unique
            String newFilename = UUID.randomUUID().toString() + extension;
            Path targetLocation = getUploadPath().resolve(newFilename);

            // Copy file vào thư mục upload
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Trả về đường dẫn relative để lưu vào DB
            return "/uploads/avatars/" + newFilename;
        } catch (IOException e) {
            throw new RuntimeException("Không thể lưu file", e);
        }
    }

    /**
     * Xóa avatar cũ (nếu có)
     */
    public void deleteAvatar(String avatarPath) {
        if (avatarPath == null || avatarPath.isEmpty()) {
            return;
        }

        try {
            // Chỉ xóa file nếu nó nằm trong thư mục uploads/avatars
            if (avatarPath.startsWith("/uploads/avatars/")) {
                String filename = avatarPath.substring("/uploads/avatars/".length());
                Path filePath = getUploadPath().resolve(filename);
                Files.deleteIfExists(filePath);
            }
        } catch (IOException e) {
            // Log error nhưng không throw exception (không quan trọng lắm)
            System.err.println("Không thể xóa avatar cũ: " + e.getMessage());
        }
    }

    /**
     * Upload ảnh sản phẩm (dùng ở trang Quản lý sản phẩm - Admin) và trả về đường dẫn file
     */
    public String storeProductImage(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File không được để trống");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());

        String extension = "";
        int lastDotIndex = originalFilename.lastIndexOf('.');
        if (lastDotIndex > 0) {
            extension = originalFilename.substring(lastDotIndex).toLowerCase();
        }

        if (!extension.matches("\\.(jpg|jpeg|png|gif|webp)")) {
            throw new IllegalArgumentException("Chỉ chấp nhận file ảnh (jpg, jpeg, png, gif, webp)");
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("Kích thước file không được vượt quá 5MB");
        }

        try {
            String newFilename = UUID.randomUUID().toString() + extension;
            Path targetLocation = getProductUploadPath().resolve(newFilename);

            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/products/" + newFilename;
        } catch (IOException e) {
            throw new RuntimeException("Không thể lưu file", e);
        }
    }

    /**
     * Xoá ảnh sản phẩm cũ (nếu có)
     */
    public void deleteProductImage(String imagePath) {
        if (imagePath == null || imagePath.isEmpty()) {
            return;
        }

        try {
            if (imagePath.startsWith("/uploads/products/")) {
                String filename = imagePath.substring("/uploads/products/".length());
                Path filePath = getProductUploadPath().resolve(filename);
                Files.deleteIfExists(filePath);
            }
        } catch (IOException e) {
            System.err.println("Không thể xóa ảnh sản phẩm cũ: " + e.getMessage());
        }
    }

    /**
     * Thư mục upload riêng cho ảnh sản phẩm: uploads/products
     */
    private Path getProductUploadPath() {
        try {
            Path uploadPath = Paths.get("uploads/products").toAbsolutePath().normalize();
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            return uploadPath;
        } catch (IOException e) {
            throw new RuntimeException("Không thể tạo thư mục upload", e);
        }
    }
}
