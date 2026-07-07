import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {FiUser, FiMapPin, FiPackage, FiCreditCard, FiFileText} from 'react-icons/fi';
import {getCart} from '../../services/cartService';
import {createOrder} from '../../services/checkoutService';
import {getProvinces, getDistricts, getWards} from '../../services/addressService';
import './checkout.css';

const Checkout = () => {
    const navigate = useNavigate();
    const token = sessionStorage.getItem('token');

    // Cart data
    const [cart, setCart] = useState(null);
    const [isLoadingCart, setIsLoadingCart] = useState(true);

    // User profile (địa chỉ mặc định)
    const [profile, setProfile] = useState(null);

    // Form data
    const [form, setForm] = useState({
        receiverName: '',
        receiverPhone: '',
        shippingAddress: '',
        paymentMethod: 'COD',
        note: ''
    });

    // Address fields
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedWard, setSelectedWard] = useState(null);
    const [streetAddress, setStreetAddress] = useState('');
    const [useProfileAddress, setUseProfileAddress] = useState(true);

    // UI states
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Load cart và profile
    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        loadCart();
        loadProfile();
        loadProvinces();
    }, [token, navigate]);

    const loadCart = async () => {
        try {
            const data = await getCart();
            if (!data.items || data.items.length === 0) {
                navigate('/cart');
                return;
            }
            setCart(data);
        } catch (error) {
            setErrorMessage('Không thể tải giỏ hàng');
        } finally {
            setIsLoadingCart(false);
        }
    };

    const loadProfile = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/users/profile', {
                headers: {'Authorization': `Bearer ${token}`}
            });
            if (response.ok) {
                const data = await response.json();
                setProfile(data);
                setForm({
                    receiverName: data.fullName || '',
                    receiverPhone: data.phone || '',
                    shippingAddress: data.address || '',
                    paymentMethod: 'COD',
                    note: ''
                });
            }
        } catch (error) {
            console.error('Lỗi tải profile:', error);
        }
    };

    const loadProvinces = async () => {
        try {
            const data = await getProvinces();
            setProvinces(data);
        } catch (error) {
            console.error('Lỗi tải tỉnh/thành:', error);
        }
    };

    const handleProvinceChange = async (e) => {
        const provinceCode = e.target.value;
        const province = provinces.find(p => p.code === parseInt(provinceCode));
        
        setSelectedProvince(province);
        setSelectedDistrict(null);
        setSelectedWard(null);
        setDistricts([]);
        setWards([]);

        if (provinceCode) {
            try {
                const districtData = await getDistricts(provinceCode);
                setDistricts(districtData);
            } catch (error) {
                console.error('Lỗi tải quận/huyện:', error);
            }
        }
    };

    const handleDistrictChange = async (e) => {
        const districtCode = e.target.value;
        const district = districts.find(d => d.code === parseInt(districtCode));
        
        setSelectedDistrict(district);
        setSelectedWard(null);
        setWards([]);

        if (districtCode) {
            try {
                const wardData = await getWards(districtCode);
                setWards(wardData);
            } catch (error) {
                console.error('Lỗi tải phường/xã:', error);
            }
        }
    };

    const handleWardChange = (e) => {
        const wardCode = e.target.value;
        const ward = wards.find(w => w.code === parseInt(wardCode));
        setSelectedWard(ward);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        // Validate
        if (!form.receiverName.trim()) {
            setErrorMessage('Vui lòng nhập tên người nhận');
            return;
        }
        if (!form.receiverPhone.trim()) {
            setErrorMessage('Vui lòng nhập số điện thoại');
            return;
        }

        // Build shipping address
        let shippingAddress = '';
        if (useProfileAddress && form.shippingAddress) {
            shippingAddress = form.shippingAddress;
        } else if (!useProfileAddress) {
            if (!streetAddress.trim() || !selectedWard || !selectedDistrict || !selectedProvince) {
                setErrorMessage('Vui lòng nhập đầy đủ địa chỉ giao hàng');
                return;
            }
            const addressParts = [
                streetAddress.trim(),
                selectedWard.name,
                selectedDistrict.name,
                selectedProvince.name
            ];
            shippingAddress = addressParts.join(', ');
        } else {
            setErrorMessage('Vui lòng nhập địa chỉ giao hàng');
            return;
        }

        setIsSubmitting(true);
        try {
            const orderData = {
                receiverName: form.receiverName.trim(),
                receiverPhone: form.receiverPhone.trim(),
                shippingAddress: shippingAddress,
                paymentMethod: form.paymentMethod,
                note: form.note.trim()
            };

            const response = await createOrder(orderData);

            // Nếu là VNPay, redirect đến URL thanh toán
            if (form.paymentMethod === 'VNPAY' && response.vnpayUrl) {
                window.location.href = response.vnpayUrl;
                return;
            }

            // COD: chuyển đến trang success
            navigate('/order-success', {state: {order: response}});
        } catch (error) {
            setErrorMessage(error.message || 'Có lỗi xảy ra khi đặt hàng');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoadingCart) {
        return <div className="checkout-loading">Đang tải...</div>;
    }

    if (!cart || !cart.items || cart.items.length === 0) {
        return null;
    }

    return (
        <div className="checkout-page">
            <div className="checkout-container">
                <h1 className="checkout-title">Thanh Toán</h1>

                {errorMessage && (
                    <div className="checkout-error">{errorMessage}</div>
                )}

                <div className="checkout-content">
                    <div className="checkout-form-section">
                        <form onSubmit={handleSubmit}>
                            {/* Thông tin người nhận */}
                            <div className="checkout-section">
                                <h2 className="section-title">
                                    <FiUser/> Thông tin người nhận
                                </h2>
                                
                                <div className="form-field">
                                    <label>Họ và tên *</label>
                                    <input
                                        type="text"
                                        value={form.receiverName}
                                        onChange={(e) => setForm({...form, receiverName: e.target.value})}
                                        placeholder="Nhập họ tên người nhận"
                                    />
                                </div>

                                <div className="form-field">
                                    <label>Số điện thoại *</label>
                                    <input
                                        type="tel"
                                        value={form.receiverPhone}
                                        onChange={(e) => setForm({...form, receiverPhone: e.target.value})}
                                        placeholder="Nhập số điện thoại"
                                    />
                                </div>
                            </div>

                            {/* Địa chỉ giao hàng */}
                            <div className="checkout-section">
                                <h2 className="section-title">
                                    <FiMapPin/> Địa chỉ giao hàng
                                </h2>

                                {profile?.address && (
                                    <div className="address-option">
                                        <label className="radio-label">
                                            <input
                                                type="radio"
                                                checked={useProfileAddress}
                                                onChange={() => setUseProfileAddress(true)}
                                            />
                                            <span>Sử dụng địa chỉ mặc định</span>
                                        </label>
                                        <div className="default-address">{profile.address}</div>
                                    </div>
                                )}

                                <div className="address-option">
                                    <label className="radio-label">
                                        <input
                                            type="radio"
                                            checked={!useProfileAddress}
                                            onChange={() => setUseProfileAddress(false)}
                                        />
                                        <span>Sử dụng địa chỉ khác</span>
                                    </label>
                                </div>

                                {!useProfileAddress && (
                                    <div className="address-form">
                                        <input
                                            type="text"
                                            placeholder="Số nhà, tên đường..."
                                            value={streetAddress}
                                            onChange={(e) => setStreetAddress(e.target.value)}
                                            className="address-input"
                                        />
                                        
                                        <select value={selectedProvince?.code || ''} onChange={handleProvinceChange}>
                                            <option value="">-- Chọn Tỉnh/Thành phố --</option>
                                            {provinces.map(p => (
                                                <option key={p.code} value={p.code}>{p.name}</option>
                                            ))}
                                        </select>

                                        <select 
                                            value={selectedDistrict?.code || ''} 
                                            onChange={handleDistrictChange}
                                            disabled={!selectedProvince}
                                        >
                                            <option value="">-- Chọn Quận/Huyện --</option>
                                            {districts.map(d => (
                                                <option key={d.code} value={d.code}>{d.name}</option>
                                            ))}
                                        </select>

                                        <select 
                                            value={selectedWard?.code || ''} 
                                            onChange={handleWardChange}
                                            disabled={!selectedDistrict}
                                        >
                                            <option value="">-- Chọn Phường/Xã --</option>
                                            {wards.map(w => (
                                                <option key={w.code} value={w.code}>{w.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Phương thức thanh toán */}
                            <div className="checkout-section">
                                <h2 className="section-title">
                                    <FiCreditCard/> Phương thức thanh toán
                                </h2>

                                <label className="payment-method">
                                    <input
                                        type="radio"
                                        value="COD"
                                        checked={form.paymentMethod === 'COD'}
                                        onChange={(e) => setForm({...form, paymentMethod: e.target.value})}
                                    />
                                    <div className="payment-info">
                                        <strong>Thanh toán khi nhận hàng (COD)</strong>
                                        <span>Thanh toán bằng tiền mặt khi nhận hàng</span>
                                    </div>
                                </label>

                                <label className="payment-method">
                                    <input
                                        type="radio"
                                        value="VNPAY"
                                        checked={form.paymentMethod === 'VNPAY'}
                                        onChange={(e) => setForm({...form, paymentMethod: e.target.value})}
                                    />
                                    <div className="payment-info">
                                        <strong>Thanh toán qua VNPay</strong>
                                        <span>Thanh toán online qua cổng VNPay</span>
                                    </div>
                                </label>
                            </div>

                            {/* Ghi chú */}
                            <div className="checkout-section">
                                <h2 className="section-title">
                                    <FiFileText/> Ghi chú đơn hàng
                                </h2>
                                <textarea
                                    placeholder="Ghi chú về đơn hàng (tùy chọn)..."
                                    value={form.note}
                                    onChange={(e) => setForm({...form, note: e.target.value})}
                                    rows="4"
                                />
                            </div>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="checkout-summary-section">
                        <div className="order-summary">
                            <h2 className="summary-title">
                                <FiPackage/> Đơn hàng của bạn
                            </h2>

                            <div className="summary-items">
                                {cart.items.map(item => (
                                    <div key={item.id} className="summary-item">
                                        <img src={item.image} alt={item.productName}/>
                                        <div className="item-info">
                                            <div className="item-name">{item.productName}</div>
                                            <div className="item-meta">
                                                {item.size} × {item.quantity}
                                            </div>
                                        </div>
                                        <div className="item-price">
                                            {item.subtotal.toLocaleString('vi-VN')}đ
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="summary-divider"/>

                            <div className="summary-row">
                                <span>Tạm tính:</span>
                                <span>{cart.totalPrice.toLocaleString('vi-VN')}đ</span>
                            </div>

                            <div className="summary-row">
                                <span>Phí vận chuyển:</span>
                                <span>Miễn phí</span>
                            </div>

                            <div className="summary-divider"/>

                            <div className="summary-total">
                                <span>Tổng cộng:</span>
                                <span className="total-price">
                                    {cart.totalPrice.toLocaleString('vi-VN')}đ
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="checkout-submit-btn"
                            >
                                {isSubmitting ? 'Đang xử lý...' : 'Đặt hàng'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
