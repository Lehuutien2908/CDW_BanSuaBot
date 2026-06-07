import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {FiMail, FiLock, FiEyeOff, FiEye} from 'react-icons/fi';
import './login.css';

const Login = ({ setIsLoggedIn }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    // Kiểm tra khách đến từ trang nào thì chuyển khách về trang đó
    const from = location.state?.from?.pathname || '/home';

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            setErrorMessage('Vui lòng nhập đầy đủ email và mật khẩu!');
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const errorText = await response.text();
                setErrorMessage(errorText);
                return;
            }

            const data = await response.json();

            sessionStorage.setItem("isLoggedIn", "true");
            sessionStorage.setItem("userFullName", data.fullName);
            sessionStorage.setItem("userRoles", JSON.stringify(data.roles));

            setIsLoggedIn(true);

            if (data.roles.includes("ROLE_ADMIN") || data.roles.includes("ADMIN")) {
                navigate('/admin');
            } else {
                navigate(from, { replace: true });
            }
        } catch (error) {
            setErrorMessage('Lỗi kết nối Server!');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">Đăng Nhập</h2>
                <p className="login-subtitle">Chào mừng bạn quay lại với Suatot</p>

                {errorMessage && <div className="error-message">{errorMessage}</div>}

                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <label>Email của bạn</label>
                        <div className="input-wrapper">
                            <FiMail className="input-icon" />
                            <input
                                type="email"
                                placeholder="Nhập email"
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
                                placeholder="Nhập mật khẩu"
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
                                {showPassword ? <FiEyeOff/> : <FiEye/>}
                            </button>
                        </div>
                    </div>

                    <div className="forgot-password">
                        <Link to="/forgot-password">Quên mật khẩu?</Link>
                    </div>

                    <button type="submit" className="login-submit-btn">
                        Đăng Nhập
                    </button>
                </form>

                <div className="login-footer">
                    <span>Bạn chưa có tài khoản? </span>
                    <Link to="/register" className="register-link">Đăng ký ngay</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;