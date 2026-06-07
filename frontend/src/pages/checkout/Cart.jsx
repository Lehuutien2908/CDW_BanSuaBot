import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { removeFromCart, updateQuantity } from '../../redux/CartSlice'; // Sửa lại đường dẫn cho đúng nhé
import { FiTrash2, FiMinus, FiPlus, FiArrowLeft } from 'react-icons/fi';
import './cart.css';

const Cart = () => {
    const cartItems = useSelector((state) => state.cart.items || state.cart);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Tính tổng tiền
    const totalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

    const handleQuantityChange = (id, currentQuantity, change) => {
        const newQuantity = currentQuantity + change;
        if (newQuantity < 1) return; // Không cho giảm dưới 1

        // Bạn có thể thêm logic kiểm tra stock (tồn kho) ở đây nếu muốn
        dispatch(updateQuantity({ id, quantity: newQuantity }));
    };

    const handleRemove = (id, name) => {
        if (window.confirm(`Bạn có chắc muốn xóa "${name}" khỏi giỏ hàng?`)) {
            dispatch(removeFromCart(id));
        }
    };

    const handleCheckout = () => {
        const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";

        if (!isLoggedIn) {
            alert("Bạn vui lòng đăng nhập để tiến hành thanh toán nhé!");

            navigate('/login', { state: { from: '/checkout' } });
        } else {
            navigate('/checkout');
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="cart-page empty-cart">
                <h2>Giỏ hàng của bạn đang trống</h2>
                <p>Hãy tìm thêm những sản phẩm dinh dưỡng cho bé nhé!</p>
                <Link to="/products" className="continue-shopping-btn">
                    Tiếp tục mua sắm
                </Link>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <h1 className="cart-title">Giỏ Hàng Của Bạn</h1>

            <div className="cart-container">
                <div className="cart-left">
                    <div className="cart-header-row">
                        <div className="col-product">Sản phẩm</div>
                        <div className="col-price">Đơn giá</div>
                        <div className="col-quantity">Số lượng</div>
                        <div className="col-total">Thành tiền</div>
                        <div className="col-action"></div>
                    </div>

                    <div className="cart-items-list">
                        {cartItems.map((item) => (
                            <div className="cart-item" key={item.id}>
                                <div className="col-product">
                                    <Link to={`/products/${item.productId}`}>
                                        <img src={item.image_url} alt={item.name} className="cart-item-img" />
                                    </Link>
                                    <div className="cart-item-info">
                                        <Link to={`/products/${item.productId}`} className="cart-item-name">
                                            {item.name}
                                        </Link>
                                        <span className="cart-item-variant">Trọng lượng: {item.weight}g</span>
                                    </div>
                                </div>

                                <div className="col-price">
                                    {item.price.toLocaleString('vi-VN')}đ
                                </div>

                                <div className="col-quantity">
                                    <div className="qty-controls">
                                        <button onClick={() => handleQuantityChange(item.id, item.quantity, -1)}>
                                            <FiMinus />
                                        </button>
                                        <input type="text" value={item.quantity} readOnly />
                                        <button onClick={() => handleQuantityChange(item.id, item.quantity, 1)}>
                                            <FiPlus />
                                        </button>
                                    </div>
                                </div>

                                <div className="col-total font-bold">
                                    {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                                </div>

                                <div className="col-action">
                                    <button
                                        className="remove-btn"
                                        onClick={() => handleRemove(item.id, item.name)}
                                        title="Xóa sản phẩm"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="back-btn mt-4" onClick={() => navigate('/products')}>
                        <FiArrowLeft /> Tiếp tục mua sắm
                    </button>
                </div>

                {/* CỘT PHẢI: TỔNG KẾT ĐƠN HÀNG */}
                <div className="cart-right">
                    <div className="summary-card">
                        <h3>Tổng Nhập Đơn Hàng</h3>

                        <div className="summary-row">
                            <span>Tạm tính ({cartItems.length} sản phẩm):</span>
                            <span>{totalPrice.toLocaleString('vi-VN')}đ</span>
                        </div>

                        <div className="summary-row">
                            <span>Phí vận chuyển:</span>
                            <span>0đ</span>
                        </div>

                        <div className="summary-divider"></div>

                        <div className="summary-row total-row">
                            <span>Tổng cộng:</span>
                            <span className="final-price">{totalPrice.toLocaleString('vi-VN')}đ</span>
                        </div>
                        <p className="vat-note">(Đã bao gồm VAT nếu có)</p>

                        <button className="checkout-btn" onClick={handleCheckout}>
                            Tiến Hành Thanh Toán
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;