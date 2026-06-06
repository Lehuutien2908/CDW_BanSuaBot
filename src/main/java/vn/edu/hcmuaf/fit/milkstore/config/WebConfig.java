package vn.edu.hcmuaf.fit.milkstore.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**") // Áp dụng cho tất cả các URL bắt đầu bằng /api/
                .allowedOrigins("http://localhost:3000") // Cho phép React kết nối
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Cho phép các hành động
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}