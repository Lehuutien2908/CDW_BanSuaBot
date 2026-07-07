import React from 'react';
import {useLocation, useNavigate, Link} from 'react-router-dom';
import {FiCheckCircle, FiPackage, FiHome} from 'react-icons/fi';
import './orderSuccess.css';

const OrderSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const order = location.state?.order;

    if (!order) {
        navigate('/');
        return null;
    }

    return (
        <div className="order-success-page">
            <div className="success-container">
                <div className="success-icon">
                    <FiCheckCircle size={64}/>
                </div>

                <h1 className="success-title">Đặt hàng thành công!</h1>
                <p className="success-subtitle">
                    Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đã được tiếp nhận và đang được xử lý.
                </p>

                <div className="order-info-card">
                    <div className="order-info-row">
                        <span className="info-label">Mã đơn hàng:</span>
                        <span className="info-value">{order.orderCode}</span>
                    </div>

                    <div className="order-info-row">
                        <span className="info-label">Thời gian đặt:</span>
                        <span className="info-value">
                            {new Date(order.orderDate).toLocaleString('vi-VN')}
                        </span>
                    </div>

                    <div className="order-info-row">
                        <span className="info-label">Tổng tiền:</span>
                        <span className="info-value price">
                            {order.totalPrice.toLocaleString('vi-VN')}đ
                        </span>
                    </div>

                    <div className="order-info-row">
                        <span className="info-label">Phương thức thanh toán:</span>
                        <span className="info-value">
                            {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : 'VNPay'}
                        </span>
                    </div>

                    <div className="order-info-row">
                        <span className="info-label">Người nhận:</span>
                        <span className="info-value">{order.receiverName}</span>
                    </div>

                    <div className="order-info-row">
                        <span className="info-label">Số điện thoại:</span>
                        <span className="info-value">{order.receiverPhone}</span>
                    </div>

                    <div className="order-info-row">
                        <span className="info-label">Địa chỉ giao hàng:</span>
                        <span className="info-value">{order.shippingAddress}</span>
                    </div>
                </div>

                <div className="success-actions">
                    <Link to="/orders" className="btn btn-primary">
                        <FiPackage/> Xem đơn hàng
                    </Link>
                    <Link to="/home" className="btn btn-secondary">
                        <FiHome/> Về trang chủ
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;
