import React from 'react';
import './banner.css';
import bannerImg from '../../assets/image/banner.png';

function Banner() {
    const bannerStyle = {
        backgroundImage: `url(${bannerImg})`,
        backgroundSize: 'contain',
        backgroundPosition: 'right center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#f7fafc'
    };

    return (
        <section className="hero-banner" style={bannerStyle}>
            <div className="hero-overlay"></div>

            <div className="hero-container">
                <div className="hero-content">
                    <span className="hero-tag">🌿 Dinh Dưỡng Tự Nhiên</span>
                    <h1>Nuôi Dưỡng Khởi Đầu Tốt Đẹp Nhất Cho Bé Yêu</h1>
                    <p>
                        Công thức sữa bột cao cấp được chuyên gia khuyên dùng,
                        cung cấp dưỡng chất thiết yếu cho sự phát triển toàn diện
                        của bé từ những ngày đầu đời.
                    </p>
                </div>
            </div>
        </section>
    );
}

export default Banner;