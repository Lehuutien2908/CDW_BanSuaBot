package vn.edu.hcmuaf.fit.milkstore.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import vn.edu.hcmuaf.fit.milkstore.security.CustomUserDetailsService;
import vn.edu.hcmuaf.fit.milkstore.security.JwtAuthenticationFilter;

// Cấu hình Spring Security cho toàn bộ project.
// - Xác thực đăng nhập (login) dùng AuthenticationManager + CustomUserDetailsService + PasswordEncoder (BCrypt) chuẩn của Spring Security.
// - Xác thực các request tiếp theo (đã đăng nhập) dùng JWT (stateless), thông qua JwtAuthenticationFilter tự viết.
@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomUserDetailsService userDetailsService;

    // Dùng để mã hoá mật khẩu khi đăng ký/đổi mật khẩu, và để so khớp mật khẩu khi đăng nhập.
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // "Người" biết cách xác thực: tìm user qua CustomUserDetailsService, so khớp mật khẩu qua PasswordEncoder.
    @Bean
    public DaoAuthenticationProvider authenticationProvider(PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    // AuthenticationManager thật của Spring Security - AuthController sẽ gọi bean này để xác thực đăng nhập.
    @Bean
    public AuthenticationManager authenticationManager(DaoAuthenticationProvider authenticationProvider) {
        return new ProviderManager(authenticationProvider);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                // Dùng lại cấu hình CORS đã khai báo trong WebConfig (allowedOrigins localhost:3000, ...)
                .cors(cors -> {})
                // API dùng JWT (stateless) -> không cần Spring tạo HttpSession
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public: đăng nhập / đăng ký / quên mật khẩu / xác thực tài khoản
                        .requestMatchers("/api/auth/**").permitAll()
                        // Public: VNPay callback (VNPay redirect về từ bên ngoài, không có token)
                        .requestMatchers("/api/payments/vnpay-return").permitAll()
                        // Public: uploads (avatars và các file static)
                        .requestMatchers("/uploads/**").permitAll()
                        // Public: xem sản phẩm, danh mục, thương hiệu (chỉ GET, không cần đăng nhập)
                        .requestMatchers(HttpMethod.GET, "/api/products/**", "/api/categories/**", "/api/brands/**").permitAll()
                        // Cart API: yêu cầu đăng nhập (ROLE_USER hoặc ROLE_ADMIN)
                        .requestMatchers("/api/cart/**").authenticated()
                        // Admin API: chỉ tài khoản có ROLE_ADMIN mới được phép
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        // Các API còn lại (hồ sơ cá nhân, lịch sử đơn hàng, đặt hàng, ...) BẮT BUỘC phải có JWT hợp lệ
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .httpBasic(httpBasic -> httpBasic.disable())
                .formLogin(formLogin -> formLogin.disable());

        return http.build();
    }
}
