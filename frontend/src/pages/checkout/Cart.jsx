import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {FiMinus, FiPlus, FiTrash2, FiShoppingCart} from 'react-icons/fi';
import * as cartService from '../../services/cartService';
import './cart.css';

const Cart = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const isLoggedIn = !!sessionStorage.getItem('token');

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login', {state: {from: '/cart'}});
            return;
        }
        fetchCart();
    }, [isLoggedIn, navigate]);

    const fetchCart = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await cartService.getCart();
            setCart(data);
        } catch (err) {
            console.error('Lỗi khi tải giỏ hàng:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleIncrease = async (item) => {
        if (item.quantity >= item.stock) {
            alert('Đã đạt số lượng tối đa trong kho!');
            return;
        }
        try {
            const data = await cartService.updateCartItem(item.id, item.quantity + 1);
            setCart(data);
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDecrease = async (item) => {
        if (item.quantity <= 1) {
            if (window.confirm('Số lượng = 1. Bạn muốn xóa sản phẩm này?')) {
                handleRemove(item.id);
            }
            return;
        }
        try {
            const data = await cartService.updateCartItem(item.id, item.quantity - 1);
            setCart(data);
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (err) {
            alert(err.message);
        }
    };

    const handleQuantityChange = async (item, newQuantity) => {
        const qty = parseInt(newQuantity);
        if (isNaN(qty) || qty < 0) return;

        if (qty === 0) {
            if (window.confirm('Bạn muốn xóa sản phẩm này?')) {
                handleRemove(item.id);
            }
            return;
        }

        if (qty > item.stock) {
            alert(`Kho chỉ còn ${item.stock} sản phẩm!`);
            return;
        }

        try {
            const data = await cartService.updateCartItem(item.id, qty);
            setCart(data);
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (err) {
            alert(err.message);
        }
    };

    const handleRemove = async (itemId) => {
        try {
            const data = await cartService.removeCartItem(itemId);
            setCart(data);
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (err) {
            alert(err.message);
        }
    };

    const handleClearCart = async () => {
        if (!window.confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng?')) return;
        try {
            await cartService.clearCart();
            setCart({items: [], totalQuantity: 0, totalPrice: 0});
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) {
        return (
            <div className="cart-container">
                <div className="cart-loading">Đang tải giỏ hàng...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="cart-container">
                <div className="cart-error">
                    <p>{error}</p>
                    <button onClick={fetchCart} className="retry-btn">Thử lại</button>
                </div>
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="cart-container">
                <div className="empty-cart">
                    <FiShoppingCart size={80} className="empty-cart-icon"/>
                    <h2>Giỏ hàng trống</h2>
                    <p>Bạn chưa có sản phẩm nào trong giỏ hàng</p>
                    <button onClick={() => navigate('/products')} className="continue-shopping-btn">
                        Tiếp tục mua sắm
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-container">
            <div className="cart-header">
                <h1>Giỏ hàng của bạn</h1>
                <span className="cart-item-count">({cart.totalQuantity} sản phẩm)</span>
            </div>

            <div className="cart-content">
                <div className="cart-items-section">
                    <div className="cart-items-header">
                        <div className="col-product">Sản phẩm</div>
                        <div className="col-price">Đơn giá</div>
                        <div className="col-quantity">Số lượng</div>
                        <div className="col-total">Thành tiền</div>
                        <div className="col-actions"></div>
                    </div>

                    {cart.items.map((item) => (
                        <div key={item.id} className="cart-item">
                            <div className="col-product">
                                <img src={item.image} alt={item.productName} className="item-image"/>
                                <div className="item-info">
                                    <h3>{item.productName}</h3>
                                    <p className="item-size">Kích thước: {item.size}</p>
                                </div>
                            </div>

                            <div className="col-price">
                                {item.price.toLocaleString('vi-VN')}₫
                            </div>

                            <div className="col-quantity">
                                <div className="quantity-controls">
                                    <button
                                        className="qty-btn"
                                        onClick={() => handleDecrease(item)}
                                        disabled={item.quantity <= 1}
                                    >
                                        <FiMinus/>
                                    </button>
                                    <input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => handleQuantityChange(item, e.target.value)}
                                        className="qty-input"
                                        min="1"
                                        max={item.stock}
                                    />
                                    <button
                                        className="qty-btn"
                                        onClick={() => handleIncrease(item)}
                                        disabled={item.quantity >= item.stock}
                                    >
                                        <FiPlus/>
                                    </button>
                                </div>
                                <p className="stock-info">Còn {item.stock} sản phẩm</p>
                            </div>

                            <div className="col-total">
                                <strong>{item.subtotal.toLocaleString('vi-VN')}₫</strong>
                            </div>

                            <div className="col-actions">
                                <button
                                    className="remove-btn"
                                    onClick={() => handleRemove(item.id)}
                                    title="Xóa sản phẩm"
                                >
                                    <FiTrash2/>
                                </button>
                            </div>
                        </div>
                    ))}

                    <div className="cart-actions-bottom">
                        <button onClick={() => navigate('/products')} className="continue-btn">
                            ← Tiếp tục mua sắm
                        </button>
                        <button onClick={handleClearCart} className="clear-cart-btn">
                            <FiTrash2/> Xóa giỏ hàng
                        </button>
                    </div>
                </div>

                <div className="cart-summary">
                    <h2>Thông tin đơn hàng</h2>

                    <div className="summary-row">
                        <span>Tạm tính:</span>
                        <span>{cart.totalPrice.toLocaleString('vi-VN')}₫</span>
                    </div>

                    <div className="summary-row">
                        <span>Phí vận chuyển:</span>
                        <span className="free-shipping">Miễn phí</span>
                    </div>

                    <div className="summary-divider"></div>

                    <div className="summary-row total-row">
                        <span>Tổng cộng:</span>
                        <span className="total-price">{cart.totalPrice.toLocaleString('vi-VN')}₫</span>
                    </div>

                    <button className="checkout-btn" onClick={() => navigate('/checkout')}>
                        Thanh toán
                    </button>

                </div>
            </div>
        </div>
    );
};

export default Cart;
