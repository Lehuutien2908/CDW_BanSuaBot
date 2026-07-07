import React from 'react';
import './orderDetailModal.css';

const OrderDetailModal = ({ order, onClose }) => {
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
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Chi tiết đơn hàng {order.orderCode}</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <div className="order-info-section">
                        <div className="info-row">
                            <span className="label">Ngày đặt:</span>
                            <span className="value">{formatDate(order.orderDate)}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Trạng thái:</span>
                            <span 
                                className="status-badge" 
                                style={{ backgroundColor: statusColors[order.status] }}
                            >
                                {statusLabels[order.status] || order.status}
                            </span>
                        </div>
                    </div>

                    <div className="shipping-info-section">
                        <h4>Thông tin giao hàng</h4>
                        <div className="info-row">
                            <span className="label">Người nhận:</span>
                            <span className="value">{order.receiverName}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Số điện thoại:</span>
                            <span className="value">{order.receiverPhone}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Địa chỉ:</span>
                            <span className="value">{order.shippingAddress}</span>
                        </div>
                    </div>

                    <div className="items-section">
                        <h4>Sản phẩm</h4>
                        <table className="items-table">
                            <thead>
                                <tr>
                                    <th>Sản phẩm</th>
                                    <th>Khối lượng</th>
                                    <th>Đơn giá</th>
                                    <th>SL</th>
                                    <th>Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((item, index) => (
                                    <tr key={index}>
                                        <td>
                                            <div className="product-cell">
                                                {item.imageUrl && (
                                                    <img 
                                                        src={item.imageUrl} 
                                                        alt={item.productName}
                                                        className="product-image"
                                                    />
                                                )}
                                                <span>{item.productName}</span>
                                            </div>
                                        </td>
                                        <td>{item.weight}g</td>
                                        <td>{formatCurrency(item.unitPrice)}</td>
                                        <td className="text-center">{item.quantity}</td>
                                        <td className="text-right">
                                            {formatCurrency(item.unitPrice * item.quantity)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="total-section">
                        <div className="total-row">
                            <span className="label">Tổng cộng:</span>
                            <span className="value total-price">{formatCurrency(order.totalPrice)}</span>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-close" onClick={onClose}>Đóng</button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailModal;
