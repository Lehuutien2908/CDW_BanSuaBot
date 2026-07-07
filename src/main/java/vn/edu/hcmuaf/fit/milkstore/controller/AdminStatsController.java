package vn.edu.hcmuaf.fit.milkstore.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.edu.hcmuaf.fit.milkstore.dto.RevenueStatsResponse;
import vn.edu.hcmuaf.fit.milkstore.service.AdminStatsService;

// Các API dành riêng cho trang quản trị (Admin)
@RestController
@RequestMapping("/api/admin/stats")
@RequiredArgsConstructor
public class AdminStatsController {

    private final AdminStatsService adminStatsService;

    /**
     * GET /api/admin/stats/revenue?year=2026&month=7
     * Không truyền year/month -> mặc định lấy tháng hiện tại
     */
    @GetMapping("/revenue")
    public ResponseEntity<?> getRevenueStats(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        try {
            RevenueStatsResponse response = adminStatsService.getMonthlyRevenue(year, month);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Có lỗi xảy ra khi lấy dữ liệu thống kê");
        }
    }
}
