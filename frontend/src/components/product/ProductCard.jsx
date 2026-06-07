import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../redux/CartSlice';
import { FiShoppingCart } from 'react-icons/fi';
import './productCard.css'

const ProductCard = ({ product }) => {
    const dispatch = useDispatch();

    const handleAddToCart = (e) => {
        //Ngăn chặn sự kiện click lan ra ngoài thẻ Link
        e.preventDefault();

        dispatch(addToCart(product));
        alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
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
                >
                    <FiShoppingCart /> Thêm vào giỏ
                </button>
            </div>
        </Link>
    );
};

export default ProductCard;