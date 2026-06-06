package vn.edu.hcmuaf.fit.milkstore.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}