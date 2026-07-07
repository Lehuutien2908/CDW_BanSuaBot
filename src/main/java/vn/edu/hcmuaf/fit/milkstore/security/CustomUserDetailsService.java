package vn.edu.hcmuaf.fit.milkstore.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import vn.edu.hcmuaf.fit.milkstore.entity.User;
import vn.edu.hcmuaf.fit.milkstore.repository.UserRepository;

// Spring Security tự động gọi loadUserByUsername() mỗi khi cần xác thực đăng nhập
// (thông qua AuthenticationManager).
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng với email: " + email));
        return new UserPrincipal(user);
    }
}
