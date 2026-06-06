package vn.edu.hcmuaf.fit.milkstore.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String fullName;
    private String email;
    private String password;
}