package vn.edu.hcmuaf.fit.milkstore.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import vn.edu.hcmuaf.fit.milkstore.dto.LoginRequest;
import vn.edu.hcmuaf.fit.milkstore.dto.LoginResponse;
import vn.edu.hcmuaf.fit.milkstore.dto.RegisterRequest;
import vn.edu.hcmuaf.fit.milkstore.entity.Role;
import vn.edu.hcmuaf.fit.milkstore.entity.User;
import vn.edu.hcmuaf.fit.milkstore.repository.RoleRepository;
import vn.edu.hcmuaf.fit.milkstore.repository.UserRepository;
import vn.edu.hcmuaf.fit.milkstore.security.JwtUtil;
import vn.edu.hcmuaf.fit.milkstore.security.UserPrincipal;
import vn.edu.hcmuaf.fit.milkstore.service.EmailService;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            // Giao việc xác thực (kiểm tra email tồn tại, so khớp mật khẩu đã mã hoá,
            // kiểm tra tài khoản có bị khoá/enabled=false hay không) cho Spring Security thật.
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
            );

            UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
            User user = principal.getUser();

            Set<String> roleNames = principal.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toSet());

            String token = jwtUtil.generateToken(user.getEmail(), roleNames);

            LoginResponse response = new LoginResponse();
            response.setMessage("Đăng nhập thành công!");
            response.setFullName(user.getFullName());
            response.setEmail(user.getEmail());
            response.setRoles(roleNames);
            response.setToken(token);

            return ResponseEntity.ok(response);

        } catch (DisabledException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Tài khoản chưa kích hoạt hoặc đã bị khóa");
        } catch (BadCredentialsException e) {
            // Cố ý dùng message chung cho cả 2 trường hợp "email không tồn tại" và "sai mật khẩu"
            // để không lộ cho kẻ tấn công biết email nào đã có người đăng ký (thông lệ bảo mật).
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Email hoặc mật khẩu không chính xác!");
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Đăng nhập thất bại, vui lòng thử lại!");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Email này đã được sử dụng!");
        }

        User newUser = new User();
        newUser.setFullName(registerRequest.getFullName());
        newUser.setEmail(registerRequest.getEmail());
        // Mã hoá mật khẩu bằng BCrypt trước khi lưu - KHÔNG lưu chữ thường (plain text) nữa
        newUser.setPassword(passwordEncoder.encode(registerRequest.getPassword()));

        Optional<Role> defaultRoleOpt = roleRepository.findByName("ROLE_USER");
        defaultRoleOpt.ifPresent(role -> newUser.setRoles(Collections.singleton(role)));

        String token = UUID.randomUUID().toString();
        newUser.setVerificationToken(token);
        newUser.setEnabled(false); // Chưa kích hoạt

        userRepository.save(newUser);

        String verifyLink = "http://localhost:3000/verify-account?token=" + token;
        try {
            emailService.sendVerificationEmail(newUser.getEmail(), verifyLink);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Đăng ký thành công nhưng lỗi gửi email xác nhận!");
        }

        return ResponseEntity.ok("Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản.");
    }

    @GetMapping("/verify-account")
    public ResponseEntity<?> verifyAccount(@RequestParam("token") String token) {
        Optional<User> userOpt = userRepository.findByVerificationToken(token);

        if (!userOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Đường dẫn xác nhận không hợp lệ hoặc đã hết hạn!");
        }

        User user = userOpt.get();
        user.setEnabled(true);
        user.setVerificationToken(null);

        userRepository.save(user);

        return ResponseEntity.ok("Kích hoạt tài khoản thành công!");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (!userOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Email này không tồn tại trong hệ thống!");
        }

        User user = userOpt.get();

        String token = UUID.randomUUID().toString();

        user.setResetToken(token);
        userRepository.save(user);

        String resetLink = "http://localhost:3000/reset-password?token=" + token;

        try {
            emailService.sendResetPasswordEmail(user.getEmail(), resetLink);
            return ResponseEntity.ok("Đã gửi hướng dẫn đặt lại mật khẩu! Vui lòng kiểm tra hộp thư email của bạn.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi gửi email! Vui lòng thử lại sau.");
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");

        Optional<User> userOpt = userRepository.findByResetToken(token);

        if (!userOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Đường dẫn khôi phục không hợp lệ hoặc đã hết hạn!");
        }

        User user = userOpt.get();

        // Mã hoá mật khẩu mới bằng BCrypt trước khi lưu
        user.setPassword(passwordEncoder.encode(newPassword));

        user.setResetToken(null);

        userRepository.save(user);

        return ResponseEntity.ok("Đổi mật khẩu thành công!");
    }
}
