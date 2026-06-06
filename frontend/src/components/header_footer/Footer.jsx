import React from 'react';
import { Link } from "react-router-dom";
import './footer.css';
import { SiGooglemaps } from "react-icons/si";
import { FaPhone } from "react-icons/fa";
import { IoMail } from "react-icons/io5";

function Footer() {
    return (
        <div className="footer">
            <div className="footer-container">
                {/* CỘT 1: GIỚI THIỆU THƯƠNG HIỆU (Thêm class brand-column) */}
                <div className="top-footer brand-column">
                    <div className="title">
                        <p>Suatot</p>
                    </div>
                    <div className="contend">
                        <p>
                            Chuyên cung cấp các sản phẩm chất lượng cao, an toàn cho sức khỏe và thân thiện với môi trường cho gia đình bạn.
                        </p>
                    </div>
                </div>

                {/* CỘT 2: LIÊN KẾT NHANH */}
                <div className="top-footer">
                    <div className="title">
                        <p>LIÊN KẾT NHANH</p>
                    </div>
                    <div className="contend">
                        <p><Link to="/home">Trang chủ</Link></p>
                        <p><Link to="/products">Sản phẩm </Link></p>
                        <p><Link to="/cart">Giỏ hàng</Link></p>
                    </div>
                </div>

                {/* CỘT 3: DỊCH VỤ KHÁCH HÀNG */}
                <div className="top-footer">
                    <div className="title">
                        <p>DỊCH VỤ KHÁCH HÀNG</p>
                    </div>
                    <div className="contend">
                        <p><Link to="/terms-and-conditions">Điều khoản mua hàng</Link></p>
                        <p><Link to="/terms-and-conditions">Điều khoản sử dụng</Link></p>
                        <p><Link to="/">Câu hỏi thường gặp</Link></p>
                    </div>
                </div>

                {/* CỘT 4: THÔNG TIN LIÊN HỆ */}
                <div className="top-footer">
                    <div className="title">
                        <p>LIÊN HỆ</p>
                    </div>
                    <div className="contend">
                        <p><SiGooglemaps/> Khu phố 6, Thủ Đức, Thành phố Hồ Chí Minh</p>
                        <p><FaPhone/> 0867294219</p>
                        <p><IoMail/> 22130290@st.hcmuaf.edu.vn</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Footer;