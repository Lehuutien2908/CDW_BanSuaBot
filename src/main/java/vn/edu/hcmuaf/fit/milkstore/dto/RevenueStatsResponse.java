package vn.edu.hcmuaf.fit.milkstore.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

// Dữ liệu trả về cho trang thống kê doanh thu Admin (1 tháng)
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RevenueStatsResponse {
    private int year;
    private int month;

    private double totalRevenue;      // Tổng doanh thu cả tháng
    private long totalOrders;         // Tổng số đơn hàng hợp lệ (không tính đơn đã huỷ)
    private double avgOrderValue;     // Giá trị trung bình / đơn
    private long totalCustomers;      // Số khách hàng khác nhau đã mua trong tháng

    private double prevMonthRevenue;  // Doanh thu tháng liền trước, để so sánh tăng/giảm
    private Double growthPercent;     // % tăng trưởng so với tháng trước (null nếu tháng trước = 0)

    private List<RevenueDayResponse> dailyRevenue; // Doanh thu từng ngày trong tháng, đủ hết các ngày (kể cả ngày = 0)
}
