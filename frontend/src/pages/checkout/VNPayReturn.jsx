import React, {useState, useEffect} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {FiCheckCircle, FiXCircle, FiLoader} from 'react-icons/fi';
import './vnpayReturn.css';

const VNPayReturn = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        processPayment();
    }, []);

    const processPayment = async () => {
        try {
            // Lấy tất cả query params từ VNPay
            const params = {};
            for (let [key, value] of searchParams.entries()) {
                params[key] = value;
            }

            console.log('VNPay callback params:', params);

            // Gọi API backend để xác thực và cập nhật trạng thái
            const queryString = new URLSearchParams(params).toString();
            const response = await fetch(`http://localhost:8080/api/payments/vnpay-return?${queryString}`);

            const contentType = response.headers.get('content-type');
            
            if (!response.ok) {
                let errorMessage = 'Không thể xác thực thanh toán';
                
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } else {
                    errorMessage = await response.text();
                }
                
                console.error('Backend error:', errorMessage);
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('Payment result:', data);
            setResult(data);
        } catch (err) {
            console.error('Error processing payment:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="vnpay-return-page">
                <div className="vnpay-container">
                    <FiLoader className="loading-icon" />
                    <h2>Đang xử lý kết quả thanh toán...</h2>
                    <p>Vui lòng không đóng trang này</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="vnpay-return-page">
                <div className="vnpay-container error">
                    <FiXCircle className="icon error-icon" />
                    <h1>Có lỗi xảy ra</h1>
                    <p className="message">{error}</p>
                    <div className="actions">
                        <button onClick={() => navigate('/orders')} className="btn-primary">
                            Xem đơn hàng
                        </button>
                        <button onClick={() => navigate('/')} className="btn-secondary">
                            Về trang chủ
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="vnpay-return-page">
            <div className={`vnpay-container ${result?.success ? 'success' : 'failure'}`}>
                {result?.success ? (
                    <>
                        <FiCheckCircle className="icon success-icon" />
                        <h1>Thanh toán thành công!</h1>
                        <p className="message">
                            Đơn hàng #{result.orderId} của bạn đã được thanh toán thành công.
                        </p>
                        <div className="order-info">
                            <div className="info-row">
                                <span className="label">Mã đơn hàng:</span>
                                <span className="value">#{result.orderId}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Trạng thái:</span>
                                <span className="value success-text">Đang xử lý</span>
                            </div>
                        </div>
                        <p className="note">
                            Chúng tôi sẽ xử lý và giao hàng cho bạn trong thời gian sớm nhất.
                        </p>
                    </>
                ) : (
                    <>
                        <FiXCircle className="icon error-icon" />
                        <h1>Thanh toán thất bại!</h1>
                        <p className="message">
                            {result?.message || 'Giao dịch không thành công. Vui lòng thử lại.'}
                        </p>
                        <div className="order-info">
                            <div className="info-row">
                                <span className="label">Mã đơn hàng:</span>
                                <span className="value">#{result?.orderId}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Mã lỗi:</span>
                                <span className="value">{result?.responseCode}</span>
                            </div>
                        </div>
                        <p className="note">
                            Đơn hàng của bạn đã bị hủy. Bạn có thể đặt lại hoặc chọn phương thức thanh toán khác.
                        </p>
                    </>
                )}

                <div className="actions">
                    <button onClick={() => navigate('/orders')} className="btn-primary">
                        Xem đơn hàng
                    </button>
                    <button onClick={() => navigate('/')} className="btn-secondary">
                        Về trang chủ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VNPayReturn;
