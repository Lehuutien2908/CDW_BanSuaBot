package vn.edu.hcmuaf.fit.milkstore.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.edu.hcmuaf.fit.milkstore.dto.RevenueDayResponse;
import vn.edu.hcmuaf.fit.milkstore.dto.RevenueStatsResponse;
import vn.edu.hcmuaf.fit.milkstore.entity.Order;
import vn.edu.hcmuaf.fit.milkstore.repository.OrderRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminStatsService {

    private final OrderRepository orderRepository;

    // Các trạng thái đơn hàng không được tính vào doanh thu (đơn đã huỷ)
    private static final String CANCELLED_STATUS = "CANCELLED";

    /**
     * Lấy thống kê doanh thu theo tháng (mặc định là tháng hiện tại nếu không truyền year/month)
     */
    public RevenueStatsResponse getMonthlyRevenue(Integer year, Integer month) {
        YearMonth targetMonth = (year != null && month != null)
                ? YearMonth.of(year, month)
                : YearMonth.now();

        List<Order> validOrders = getValidOrdersInMonth(targetMonth);

        // Gom nhóm đơn hàng theo ngày để tính doanh thu từng ngày
        Map<LocalDate, List<Order>> ordersByDay = validOrders.stream()
                .collect(Collectors.groupingBy(o -> o.getOrderDate().toLocalDate()));

        List<RevenueDayResponse> dailyRevenue = new ArrayList<>();
        int daysInMonth = targetMonth.lengthOfMonth();
        for (int day = 1; day <= daysInMonth; day++) {
            LocalDate date = targetMonth.atDay(day);
            List<Order> ordersOfDay = ordersByDay.getOrDefault(date, List.of());
            double revenue = ordersOfDay.stream().mapToDouble(o -> nz(o.getTotalPrice())).sum();
            dailyRevenue.add(new RevenueDayResponse(date, revenue, (long) ordersOfDay.size()));
        }

        double totalRevenue = validOrders.stream().mapToDouble(o -> nz(o.getTotalPrice())).sum();
        long totalOrders = validOrders.size();
        double avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        long totalCustomers = validOrders.stream()
                .filter(o -> o.getUser() != null)
                .map(o -> o.getUser().getId())
                .distinct()
                .count();

        // So sánh với tháng trước
        YearMonth prevMonth = targetMonth.minusMonths(1);
        double prevMonthRevenue = getValidOrdersInMonth(prevMonth).stream()
                .mapToDouble(o -> nz(o.getTotalPrice())).sum();

        Double growthPercent = null;
        if (prevMonthRevenue > 0) {
            growthPercent = ((totalRevenue - prevMonthRevenue) / prevMonthRevenue) * 100;
        } else if (totalRevenue > 0) {
            growthPercent = 100.0;
        }

        return new RevenueStatsResponse(
                targetMonth.getYear(),
                targetMonth.getMonthValue(),
                totalRevenue,
                totalOrders,
                avgOrderValue,
                totalCustomers,
                prevMonthRevenue,
                growthPercent,
                dailyRevenue
        );
    }

    private List<Order> getValidOrdersInMonth(YearMonth month) {
        LocalDateTime start = month.atDay(1).atStartOfDay();
        LocalDateTime end = month.plusMonths(1).atDay(1).atStartOfDay();

        return orderRepository.findByOrderDateBetween(start, end).stream()
                .filter(o -> o.getStatus() == null || !CANCELLED_STATUS.equalsIgnoreCase(o.getStatus()))
                .collect(Collectors.toList());
    }

    private double nz(Double value) {
        return value != null ? value : 0.0;
    }
}
