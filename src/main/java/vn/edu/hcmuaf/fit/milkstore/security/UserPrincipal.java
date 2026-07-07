package vn.edu.hcmuaf.fit.milkstore.security;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import vn.edu.hcmuaf.fit.milkstore.entity.User;

import java.util.Collection;
import java.util.stream.Collectors;

@Getter
public class UserPrincipal implements UserDetails {

    private final User user;

    public UserPrincipal(User user) {
        this.user = user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Role trong DB đã có sẵn tiền tố "ROLE_" (ROLE_ADMIN, ROLE_USER, ...)
        // nên map thẳng sang GrantedAuthority, dùng được với hasRole("ADMIN") ở @PreAuthorize.
        return user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.getName()))
                .collect(Collectors.toList());
    }

    @Override
    public String getPassword() {
        return user.getPassword(); // Mật khẩu đã được mã hoá BCrypt lưu trong DB
    }

    @Override
    public String getUsername() {
        return user.getEmail(); // Dùng email làm "username" đăng nhập
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return user.isEnabled(); // Chưa xác nhận email -> Spring Security tự chặn đăng nhập
    }
}
