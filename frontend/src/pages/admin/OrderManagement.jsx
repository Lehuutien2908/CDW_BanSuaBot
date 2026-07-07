import React, { useState, useEffect } from 'react';
import adminOrderService from '../../services/adminOrderService';
import OrderDetailModal from './OrderDetailModal';
import './orderManagement.css';

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const statusOptions = [
        { value: '', label: 'Tất cả' },
        { value: 'PENDING', label: 'Chờ xử lý' },
        { value: 'PROCESSING', label: 'Đang xử lý' },
        { value: 'SHIPPING', label: 'Đang giao' },
        { value: 'DELIVERED', label: 'Đã giao' },
        { value: 'CANCELLED', label: 'Đã hủy' }
    ];

    const statusLabels = {
        'PENDING': 'Chờ xử lý',
        'PROCESSING': 'Đang xử lý',
        'SHIPPING': 'Đang giao',
        'DELIVERED': 'Đã giao',
        'CANCELLED': 'Đã hủy'
    };

    const statusColors = {
        'PENDING': '#ffa500',
        'PROCESSING': '#2196F3',
        'SHIPPING': '#9C27B0',
        'DELIVERED': '#4CAF50',
        'CANCELLED': '#f44336'
    };

    useEffect(() => {
        loadOrders();
    }, [statusFilter]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await adminOrderService.getAllOrders(statusFilter || null);
            setOrders(data);
        } catch (error) {
            console.error('Lỗi khi tải đơn hàng:', error);
            alert('Không thể tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = async (orderId) => {
        try {
            const detail = await adminOrderService.getOrderDetail(orderId);
            setSelectedOrder(detail);
            setShowDetailModal(true);
        } catch (error) {
            console.error('Lỗi khi tải chi tiết:', error);
            alert('Không thể tải chi tiết đơn hàng');
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        if (!window.confirm(`Bạn có chắc muốn chuyển trạng thái đơn hàng sang "${statusLabels[newStatus]}"?`)) {
            return;
        }

        try {
            await adminOrderService.updateOrderStatus(orderId, newStatus);
            alert('Cập nhật trạng thái thành công');
            loadOrders();
        } catch (error) {
            console.error('Lỗi khi cập nhật:', error);
            alert('Không thể cập nhật trạng thái đơn hàng');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="order-management">
            <div className="order-header">
                <h2>Quản lý đơn hàng</h2>
                <div className="order-filters">
                    <select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="status-filter"
                    >
                        {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="loading">Đang tải...</div>
            ) : orders.length === 0 ? (
                <div className="no-orders">Không có đơn hàng nào</div>
            ) : (
                <div className="orders-table-container">
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>Mã đơn</th>
                                <th>Ngày đặt</th>
                                <th>Khách hàng</th>
                                <th>SĐT</th>
                                <th>Tổng tiền</th>
                                <th>SL món</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id}>
                                    <td className="order-code">{order.orderCode}</td>
                                    <td>{formatDate(order.orderDate)}</td>
                                    <td>
                                        <div className="customer-info">
                                            <div className="customer-name">{order.customerName}</div>
                                            <div className="customer-email">{order.customerEmail}</div>
                                        </div>
                                    </td>
                                    <td>{order.customerPhone}</td>
                                    <td className="price">{formatCurrency(order.totalPrice)}</td>
                                    <td className="text-center">{order.totalItems}</td>
                                    <td>
                                        <span 
                                            className="status-badge" 
                                            style={{ backgroundColor: statusColors[order.status] }}
                                        >
                                            {statusLabels[order.status] || order.status}
                                        </span>
                                    </td>
                                    <td className="actions">
                                        <button 
                                            className="btn-view"
                                            onClick={() => handleViewDetail(order.id)}
                                            title="Xem chi tiết"
                                        >
                                            👁️
                                        </button>
                                        
                                        {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                                            <select 
                                                className="status-select"
                                                onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                                value=""
                                            >
                                                <option value="">Đổi trạng thái</option>
                                                {statusOptions
                                                    .filter(opt => opt.value && opt.value !== order.status)
                                                    .map(opt => (
                                                        <option key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </option>
                                                    ))
                                                }
                                            </select>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showDetailModal && (
                <OrderDetailModal 
                    order={selectedOrder}
                    onClose={() => {
                        setShowDetailModal(false);
                        setSelectedOrder(null);
                    }}
                />
            )}
        </div>
    );
};

export default OrderManagement;
