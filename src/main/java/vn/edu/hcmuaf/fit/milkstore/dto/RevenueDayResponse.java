package vn.edu.hcmuaf.fit.milkstore.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

// Doanh thu của 1 ngày cụ thể, dùng để vẽ biểu đồ theo tháng
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RevenueDayResponse {
    private LocalDate date;
    private Double revenue;
    private Long orderCount;
}
