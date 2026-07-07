import React, {useState, useEffect} from 'react';
import {FiChevronDown, FiChevronUp, FiPackage, FiMapPin} from 'react-icons/fi';
import './orderHistory.css';

// API dự kiến (BE sẽ triển khai sau):
// GET /api/orders/history   (header: Authorization: Bearer <token>)
//   -> [
//        {
//          id, orderDate, totalPrice, status,
//          receiverName, receiverPhone, shippingAddress,
//          items: [{ productName, weight, quantity, unitPrice, imageUrl }]
//        }, ...
//      ]
//
// Server đọc email của người dùng từ JWT token, chỉ trả về đơn hàng của chính họ.

const STATUS_LABELS = {
    PENDING: {label: 'Chờ xác nhận', className: 'status-pending'},
    CONFIRMED: {label: 'Đã xác nhận', className: 'status-confirmed'},
    SHIPPING: {label: 'Đang giao', className: 'status-shipping'},
    COMPLETED: {label: 'Hoàn thành', className: 'status-completed'},
    CANCELLED: {label: 'Đã hủy', className: 'status-cancelled'},
};

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};

const formatPrice = (price) => (typeof price === 'number' ? price.toLocaleString('vi-VN') + 'đ' : 'Liên hệ');

const OrderHistory = () => {
    const token = sessionStorage.getItem('token');

    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    useEffect(() => {
        if (!token) {
            setIsLoading(false);
            setErrorMessage('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.');
            return;
        }

        setIsLoading(true);
        fetch('http://localhost:8080/api/orders/history', {
            headers: {'Authorization': `Bearer ${token}`}
        })
            .then(res => {
                if (!res.ok) throw new Error('Chưa có BE / không tải được lịch sử đơn hàng');
                return res.json();
            })
            .then(data => {
                setOrders(Array.isArray(data) ? data : []);
                setIsLoading(false);
            })
            .catch(err => {
                console.warn(err.message);
                setErrorMessage('Không tải được lịch sử mua hàng. Vui lòng thử lại sau.');
                setOrders([]);
                setIsLoading(false);
            });
    }, [token]);

    const toggleExpand = (orderId) => {
        setExpandedOrderId(prev => (prev === orderId ? null : orderId));
    };

    if (isLoading) {
        return <div className="order-history-loading">Đang tải lịch sử mua hàng...</div>;
    }

    return (
        <div className="order-history-page">
            <h1 className="order-history-title">Lịch Sử Mua Hàng</h1>

            {errorMessage && <div className="order-history-message error">{errorMessage}</div>}

            {!errorMessage && orders.length === 0 && (
                <div className="order-history-empty">
                    <FiPackage size={48}/>
                    <p>Bạn chưa có đơn hàng nào.</p>
                </div>
            )}

            <div className="order-list">
                {orders.map(order => {
                    const statusInfo = STATUS_LABELS[order.status] || {
                        label: order.status || 'Không rõ',
                        className: ''
                    };
                    const isExpanded = expandedOrderId === order.id;
                    const itemCount = (order.items || []).reduce((sum, it) => sum + (it.quantity || 0), 0);

                    return (
                        <div className="order-card" key={order.id}>
                            <div className="order-card-header" onClick={() => toggleExpand(order.id)}>
                                <div className="order-card-main">
                                    <span className="order-code">Đơn hàng #{order.orderCode || order.id}</span>
                                    <span className="order-date">{formatDate(order.orderDate)}</span>
                                </div>

                                <div className="order-card-side">
                                    <span className={`order-status-badge ${statusInfo.className}`}>
                                        {statusInfo.label}
                                    </span>
                                    <span className="order-total">{formatPrice(order.totalPrice)}</span>
                                    {isExpanded ? <FiChevronUp/> : <FiChevronDown/>}
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="order-card-body">
                                    <div className="order-shipping-info">
                                        <FiMapPin/>
                                        <div>
                                            <p><strong>{order.receiverName}</strong> · {order.receiverPhone}</p>
                                            <p>{order.shippingAddress}</p>
                                        </div>
                                    </div>

                                    <div className="order-items">
                                        {(order.items || []).map((item, idx) => (
                                            <div className="order-item-row" key={idx}>
                                                <img src={item.imageUrl} alt={item.productName}/>
                                                <div className="order-item-info">
                                                    <p className="order-item-name">{item.productName}</p>
                                                    <p className="order-item-meta">
                                                        {item.weight ? `${item.weight}g` : ''} · SL: {item.quantity}
                                                    </p>
                                                </div>
                                                <div className="order-item-price">{formatPrice(item.unitPrice)}</div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="order-item-count">Tổng số lượng: {itemCount} sản phẩm</div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OrderHistory;
