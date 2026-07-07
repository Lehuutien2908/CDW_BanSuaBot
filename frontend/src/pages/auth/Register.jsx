import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import './register.css';

const Register = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!fullName || !email || !password || !confirmPassword) {
            setErrorMessage('Vui lòng điền đầy đủ tất cả thông tin!');
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage('Mật khẩu xác nhận không khớp!');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:8080/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, email, password })
            });

            if (!response.ok) {
                const errorText = await response.text();
                setSuccessMessage('');
                setErrorMessage(errorText);
                return;
            }

            setErrorMessage('');
            setSuccessMessage('Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản.');

        } catch (error) {
            setSuccessMessage('');
            setErrorMessage('Không thể kết nối đến máy chủ! Bạn đã bật dự án Spring Boot chưa?');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <h2 className="register-title">Đăng Ký Tài Khoản</h2>
                <p className="register-subtitle">Trở thành thành viên của Suatot ngay hôm nay</p>

                {errorMessage && <div className="error-message">{errorMessage}</div>}
                {successMessage && <div className="success-message">{successMessage}</div>}

                <form onSubmit={handleRegister}>
                    <div className="input-group">
                        <label>Họ và Tên</label>
                        <div className="input-wrapper">
                            <FiUser className="input-icon" />
                            <input
                                type="text"
                                placeholder="Nhập họ và tên"
                                value={fullName}
                                onChange={(e) => {
                                    setFullName(e.target.value);
                                    setErrorMessage('');
                                }}
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Email của bạn</label>
                        <div className="input-wrapper">
                            <FiMail className="input-icon" />
                            <input
                                type="email"
                                placeholder="Nhập email đăng ký"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setErrorMessage('');
                                }}
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Mật khẩu</label>
                        <div className="input-wrapper">
                            <FiLock className="input-icon" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Tạo mật khẩu (Ít nhất 6 ký tự)"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
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
                        <label>Xác nhận mật khẩu</label>
                        <div className="input-wrapper">
                            <FiLock className="input-icon" />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Nhập lại mật khẩu"
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

                    <button
                        type="submit"
                        className={`register-submit-btn ${isLoading ? 'loading' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Đang xử lý...' : 'Đăng Ký'}
                    </button>
                </form>

                <div className="register-footer">
                    <span>Đã có tài khoản? </span>
                    <Link to="/login" className="login-link">Đăng nhập ngay</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;