import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import './resetPassword.css';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const navigate = useNavigate();

    const handleReset = async (e) => {
        e.preventDefault();

        if (!token) {
            setErrorMessage('Đường dẫn không hợp lệ hoặc đã hết hạn!');
            return;
        }

        if (!newPassword || !confirmPassword) {
            setErrorMessage('Vui lòng nhập đầy đủ mật khẩu mới!');
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorMessage('Mật khẩu xác nhận không khớp!');
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword })
            });

            if (!response.ok) {
                const errorText = await response.text();
                setSuccessMessage('');
                setErrorMessage(errorText);
                return;
            }

            setErrorMessage('');
            setSuccessMessage('Đổi mật khẩu thành công! Đang chuyển hướng...');

            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (error) {
            setSuccessMessage('');
            setErrorMessage('Không thể kết nối đến máy chủ! Vui lòng thử lại sau.');
        }
    };

    return (
        <div className="reset-container">
            <div className="reset-card">
                <h2 className="reset-title">Tạo Mật Khẩu Mới</h2>
                <p className="reset-subtitle">Vui lòng nhập mật khẩu mới cho tài khoản của bạn</p>

                {errorMessage && <div className="error-message">{errorMessage}</div>}
                {successMessage && <div className="success-message">{successMessage}</div>}

                <form onSubmit={handleReset}>
                    <div className="input-group">
                        <label>Mật khẩu mới</label>
                        <div className="input-wrapper">
                            <FiLock className="input-icon" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Nhập mật khẩu mới"
                                value={newPassword}
                                onChange={(e) => {
                                    setNewPassword(e.target.value);
                                    setErrorMessage('');
                                }}
                            />
                            <button
                                type="button"
                                className="toggle-password-btn"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Xác nhận mật khẩu mới</label>
                        <div className="input-wrapper">
                            <FiLock className="input-icon" />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Nhập lại mật khẩu mới"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    setErrorMessage('');
                                }}
                            />
                            <button
                                type="button"
                                className="toggle-password-btn"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="reset-submit-btn">
                        Xác Nhận Đổi Mật Khẩu
                    </button>
                </form>

                <div className="reset-footer">
                    <Link to="/login" className="back-link">Quay lại đăng nhập</Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;