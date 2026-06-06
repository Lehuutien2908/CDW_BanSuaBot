import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import './forgotPassword.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleForget = async (e) => {
        e.preventDefault();

        if (!email) {
            setErrorMessage('Vui lòng nhập địa chỉ email của bạn!');
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (!response.ok) {
                const errorText = await response.text();
                setSuccessMessage('');
                setErrorMessage(errorText);
                return;
            }

            setErrorMessage('');
            setSuccessMessage('Đã gửi hướng dẫn đặt lại mật khẩu! Vui lòng kiểm tra hộp thư email của bạn.');
            setEmail('');

        } catch (error) {
            setSuccessMessage('');
            setErrorMessage('Không thể kết nối đến máy chủ! Vui lòng thử lại sau.');
        }
    };

    return (
        <div className="forget-container">
            <div className="forget-card">
                <h2 className="forget-title">Quên Mật Khẩu</h2>
                <p className="forget-subtitle">
                    Đừng lo lắng! Hãy nhập email bạn đã đăng ký để nhận liên kết đặt lại mật khẩu mới.
                </p>

                {errorMessage && <div className="error-message">{errorMessage}</div>}
                {successMessage && <div className="success-message">{successMessage}</div>}

                <form onSubmit={handleForget}>
                    <div className="input-group">
                        <label>Email đã đăng ký</label>
                        <div className="input-wrapper">
                            <FiMail className="input-icon" />
                            <input
                                type="email"
                                placeholder="Nhập email của bạn..."
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setErrorMessage('');
                                    setSuccessMessage('');
                                }}
                            />
                        </div>
                    </div>

                    <button type="submit" className="forget-submit-btn">
                        Gửi Yêu Cầu
                    </button>
                </form>

                <div className="forget-footer">
                    <Link to="/login" className="back-to-login-link">
                        <FiArrowLeft className="back-icon" /> Quay lại đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;