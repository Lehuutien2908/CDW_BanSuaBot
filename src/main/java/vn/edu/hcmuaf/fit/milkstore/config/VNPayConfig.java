package vn.edu.hcmuaf.fit.milkstore.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter
public class VNPayConfig {

    @Value("${vnp.pay.url}")
    private String vnpPayUrl;

    @Value("${vnp.tmn.code}")
    private String vnpTmnCode;

    @Value("${vnp.hash.secret}")
    private String vnpHashSecret;

    @Value("${vnp.return.url}")
    private String vnpReturnUrl;

    @Value("${vnp.api.url}")
    private String vnpApiUrl;
}
