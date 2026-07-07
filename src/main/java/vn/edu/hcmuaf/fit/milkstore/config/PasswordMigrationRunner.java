package vn.edu.hcmuaf.fit.milkstore.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import vn.edu.hcmuaf.fit.milkstore.entity.User;
import vn.edu.hcmuaf.fit.milkstore.repository.UserRepository;

import java.util.List;

@Component
@RequiredArgsConstructor
public class PasswordMigrationRunner implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        List<User> users = userRepository.findAll();
        int migrated = 0;

        for (User user : users) {
            String currentPassword = user.getPassword();
            if (currentPassword != null && !isAlreadyEncoded(currentPassword)) {
                user.setPassword(passwordEncoder.encode(currentPassword));
                userRepository.save(user);
                migrated++;
            }
        }

        if (migrated > 0) {
            System.out.println("[PasswordMigrationRunner] Đã mã hoá lại " + migrated + " mật khẩu cũ sang BCrypt.");
        }
    }

    private boolean isAlreadyEncoded(String password) {
        return password.startsWith("$2a$") || password.startsWith("$2b$") || password.startsWith("$2y$");
    }
}
