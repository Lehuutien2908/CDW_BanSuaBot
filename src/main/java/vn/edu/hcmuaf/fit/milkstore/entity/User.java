package vn.edu.hcmuaf.fit.milkstore.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @JsonIgnore // Không bao giờ hiện mật khẩu ra API
    private String password;

    private String fullName;
    private String phone;
    private String address;
    private String avatar;

    private boolean enabled = true; // Tài khoản có đang hoạt động không

    // Phần dành cho Social Login
    private String provider;   // "LOCAL" hoặc "GOOGLE"
    private String providerId; // ID từ phía Google trả về

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "users_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();
}
