package vn.edu.hcmuaf.fit.milkstore.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserAdminResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private Boolean enabled;
    private List<String> roles;
    private Integer totalOrders;
    private Double totalSpent;
}
