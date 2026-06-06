import React from 'react';
import './features.css';
import { FaShieldAlt, FaFlask, FaLeaf, FaTruck } from 'react-icons/fa';

function Features() {
    return (
        <section className="features-bar">
            <div className="features-container">
                <div className="feature-item">
                    <div className="feature-icon"><FaShieldAlt /></div>
                    <div className="feature-text">
                        <h4>Kiểm Định An Toàn</h4>
                        <p>Tiêu chuẩn Châu Âu</p>
                    </div>
                </div>
                <div className="feature-item">
                    <div className="feature-icon"><FaFlask /></div>
                    <div className="feature-text">
                        <h4>Công Thức Độc Quyền</h4>
                        <p>Phát triển bởi chuyên gia</p>
                    </div>
                </div>
                <div className="feature-item">
                    <div className="feature-icon"><FaLeaf /></div>
                    <div className="feature-text">
                        <h4>100% Hữu Cơ</h4>
                        <p>Thành phần tự nhiên</p>
                    </div>
                </div>
                <div className="feature-item">
                    <div className="feature-icon"><FaTruck /></div>
                    <div className="feature-text">
                        <h4>Giao Hàng Miễn Phí</h4>
                        <p>Cho đơn từ 500k</p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Features;