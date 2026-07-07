import React, { useEffect, useMemo, useState } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { FiDollarSign, FiShoppingBag, FiTrendingUp, FiUsers, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { getRevenueStats } from '../../services/adminService';
import './statistics.css';

// yyyy-mm hiện tại, dùng làm giá trị mặc định cho input month
const getCurrentYearMonth = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
};

const formatCurrencyFull = (value) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value || 0);

// Rút gọn số tiền cho trục biểu đồ: 1.500.000 -> 1,5tr ; 800.000 -> 800k
const formatCurrencyShort = (value) => {
    if (!value) return '0';
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}tr`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
    return `${value}`;
};

const MONTH_LABELS_VI = (year, month) => `Tháng ${month}/${year}`;

const Statistics = () => {
    const [yearMonth, setYearMonth] = useState(getCurrentYearMonth());
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const [year, month] = yearMonth.split('-').map(Number);

        let cancelled = false;
        setLoading(true);
        setError('');

        getRevenueStats(year, month)
            .then((res) => {
                if (!cancelled) setData(res);
            })
            .catch(() => {
                if (!cancelled) setError('Không thể tải dữ liệu thống kê. Vui lòng thử lại.');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [yearMonth]);

    const chartData = useMemo(() => {
        if (!data) return [];
        return data.dailyRevenue.map((d) => ({
            day: Number(d.date.split('-')[2]),
            date: d.date,
            revenue: d.revenue,
            orderCount: d.orderCount,
        }));
    }, [data]);

    const hasAnyRevenue = data ? data.totalRevenue > 0 : false;

    const handleThisMonth = () => setYearMonth(getCurrentYearMonth());

    const renderGrowthBadge = () => {
        if (!data || data.growthPercent === null || data.growthPercent === undefined) {
            return <span className="stats-badge flat">Chưa có dữ liệu tháng trước</span>;
        }
        const growth = data.growthPercent;
        if (Math.abs(growth) < 0.05) {
            return <span className="stats-badge flat">Không đổi so với tháng trước</span>;
        }
        const isUp = growth > 0;
        return (
            <span className={`stats-badge ${isUp ? 'up' : 'down'}`}>
                {isUp ? <FiArrowUp /> : <FiArrowDown />}
                {Math.abs(growth).toFixed(1)}% so với tháng trước
            </span>
        );
    };

    const CustomTooltip = ({ active, payload }) => {
        if (!active || !payload || !payload.length) return null;
        const point = payload[0].payload;
        return (
            <div className="stats-tooltip">
                <div className="stats-tooltip-date">Ngày {point.day}</div>
                <div className="stats-tooltip-revenue">{formatCurrencyFull(point.revenue)}</div>
                <div className="stats-tooltip-orders">{point.orderCount} đơn hàng</div>
            </div>
        );
    };

    return (
        <div>
            <div className="stats-header">
                <div>
                    <h1>Thống kê doanh thu</h1>
                    <p>Theo dõi doanh thu cửa hàng theo từng tháng</p>
                </div>

                <div className="stats-month-picker">
                    <label htmlFor="stats-month">Xem theo tháng</label>
                    <input
                        id="stats-month"
                        type="month"
                        value={yearMonth}
                        max={getCurrentYearMonth()}
                        onChange={(e) => setYearMonth(e.target.value)}
                    />
                    {yearMonth !== getCurrentYearMonth() && (
                        <button onClick={handleThisMonth}>Tháng này</button>
                    )}
                </div>
            </div>

            {loading && (
                <div className="stats-state">
                    <div className="stats-spinner" />
                    <span>Đang tải dữ liệu...</span>
                </div>
            )}

            {!loading && error && (
                <div className="stats-state">
                    <span>{error}</span>
                </div>
            )}

            {!loading && !error && data && (
                <>
                    <div className="stats-cards">
                        <div className="stats-card">
                            <div className="stats-card-label">
                                <span className="stats-card-icon blue"><FiDollarSign /></span>
                                Tổng doanh thu
                            </div>
                            <div className="stats-card-value">{formatCurrencyFull(data.totalRevenue)}</div>
                            {renderGrowthBadge()}
                        </div>

                        <div className="stats-card">
                            <div className="stats-card-label">
                                <span className="stats-card-icon amber"><FiShoppingBag /></span>
                                Tổng đơn hàng
                            </div>
                            <div className="stats-card-value">{data.totalOrders}</div>
                            <div className="stats-card-sub">đơn hàng hợp lệ trong tháng</div>
                        </div>

                        <div className="stats-card">
                            <div className="stats-card-label">
                                <span className="stats-card-icon green"><FiTrendingUp /></span>
                                Giá trị TB / đơn
                            </div>
                            <div className="stats-card-value">{formatCurrencyFull(data.avgOrderValue)}</div>
                            <div className="stats-card-sub">trung bình mỗi đơn hàng</div>
                        </div>

                        <div className="stats-card">
                            <div className="stats-card-label">
                                <span className="stats-card-icon purple"><FiUsers /></span>
                                Khách hàng
                            </div>
                            <div className="stats-card-value">{data.totalCustomers}</div>
                            <div className="stats-card-sub">khách hàng đã mua trong tháng</div>
                        </div>
                    </div>

                    <div className="stats-chart-card">
                        <div className="stats-chart-header">
                            <h2>Doanh thu theo ngày</h2>
                            <span>{MONTH_LABELS_VI(data.year, data.month)}</span>
                        </div>

                        <ResponsiveContainer width="100%" height={340}>
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#2b6cb0" stopOpacity={0.35} />
                                        <stop offset="100%" stopColor="#2b6cb0" stopOpacity={0.02} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef1f6" />
                                <XAxis
                                    dataKey="day"
                                    tickLine={false}
                                    axisLine={{ stroke: '#e5e9f2' }}
                                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                                    interval={Math.floor(chartData.length / 10)}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                                    tickFormatter={formatCurrencyShort}
                                    width={50}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#2b6cb0"
                                    strokeWidth={2}
                                    fill="url(#revenueGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>

                        {!hasAnyRevenue && (
                            <div className="stats-chart-empty">
                                <strong>Chưa có doanh thu trong {MONTH_LABELS_VI(data.year, data.month).toLowerCase()}</strong>
                                <span>Biểu đồ sẽ tự động cập nhật khi có đơn hàng mới</span>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Statistics;
