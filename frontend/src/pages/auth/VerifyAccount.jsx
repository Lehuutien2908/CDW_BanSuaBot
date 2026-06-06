import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import './register.css';

const VerifyAccount = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [message, setMessage] = useState('Đang xác thực tài khoản của bạn...');
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (token) {
            fetch(`http://localhost:8080/api/auth/verify-account?token=${token}`)
                .then(async (response) => {
                    const text = await response.text();
                    if (response.ok) {
                        setMessage(text);
                        setIsSuccess(true);
                    } else {
                        setMessage(text);
                        setIsSuccess(false);
                    }
                })
                .catch(() => {
                    setMessage('Không thể kết nối đến máy chủ!');
                    setIsSuccess(false);
                });
        } else {
            setMessage('Không tìm thấy mã xác thực!');
        }
    }, [token]);

    return (
        <div className="register-container">
            <div className="register-card" style={{ textAlign: 'center' }}>
                <h2 className="register-title">Xác Thực Tài Khoản</h2>

                <div style={{ marginTop: '20px', marginBottom: '30px', fontSize: '18px', color: isSuccess ? 'green' : 'red' }}>
                    {message}
                </div>

                {isSuccess && (
                    <Link to="/login" className="register-submit-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
                        Đi đến Đăng Nhập
                    </Link>
                )}
            </div>
        </div>
    );
};

export default VerifyAccount;