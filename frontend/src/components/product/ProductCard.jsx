import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart } from 'react-icons/fi';
import { addToCart } from '../../services/cartService';
import './productCard.css'

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const [adding, setAdding] = useState(false);

    const handleAddToCart = async (e) => {
        e.preventDefault(); // Ngăn chặn sự kiện click lan ra Link
        e.stopPropagation();

        // Kiểm tra đăng nhập
        const token = sessionStorage.getItem('token');
        if (!token) {
            alert('Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng.');
            navigate('/login');
            return;
        }

        // Product từ API list không có variants chi tiết
        // Cần gọi API lấy chi tiết để có variantId
        try {
            setAdding(true);
            
            // Lấy chi tiết sản phẩm để có variant đầu tiên
            const detailRes = await fetch(`http://localhost:8080/api/products/${product.id}`);
            const detail = await detailRes.json();
            
            if (!detail.variants || detail.variants.length === 0) {
                alert('Sản phẩm không có biến thể. Vui lòng vào trang chi tiết.');
                return;
            }

            const firstVariant = detail.variants[0];

            // Kiểm tra stock
            if (firstVariant.stock === 0) {
                alert('Sản phẩm đã hết hàng!');
                return;
            }

            // Thêm vào giỏ
            await addToCart(firstVariant.id, 1);
            alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
            
            // Dispatch event để Header cập nhật badge
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (error) {
            console.error('Lỗi khi thêm vào giỏ hàng:', error);
            alert(error.message || 'Không thể thêm vào giỏ hàng. Vui lòng thử lại.');
        } finally {
            setAdding(false);
        }
    };

    return (
        <Link to={`/products/${product.id}`} className="product-card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="product-image-container">
                <img src={product.image_url} alt={product.name} />
            </div>
            <div className="product-details">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-price">
                    {product.price ? product.price.toLocaleString('vi-VN') + 'đ' : 'Liên hệ'}
                </p>

                <button
                    className="add-to-cart-btn"
                    onClick={handleAddToCart}
                    disabled={adding}
                >
                    <FiShoppingCart /> 
                    {adding ? 'Đang thêm...' : 'Thêm vào giỏ'}
                </button>
            </div>
        </Link>
    );
};

export default ProductCard;