package vn.edu.hcmuaf.fit.milkstore.dto;

import lombok.Data;
import java.util.Set;

@Data
public class LoginResponse {
    private String message;
    private String fullName;
    private String email;
    private Set<String> roles;
}