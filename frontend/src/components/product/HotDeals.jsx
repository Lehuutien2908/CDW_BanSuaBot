import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../redux/CartSlice';
import './hotDeals.css';
import { FaArrowRight } from 'react-icons/fa';

function HotDeals() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const dispatch = useDispatch();

    useEffect(() => {
        fetch('http://localhost:8080/api/products/hot-deals')
            .then(response => response.json())
            .then(data => {
                setProducts(data);
                setIsLoading(false);
            })
            .catch(error => {
                console.error("Lỗi :", error);
                setIsLoading(false);
            });
    }, []);

    const handleAddToCart = (product) => {
        dispatch(addToCart(product));
        alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
    };

    return (
        <section className="product-section">
            <div className="section-header">
                <div className="section-title">
                    <h2>Sản Phẩm Bán Chạy Nhất</h2>
                    <p>Lựa chọn hàng đầu của hàng ngàn bà mẹ Việt Nam.</p>
                </div>
                <a href="/products" className="view-all-link">
                    Xem tất cả <FaArrowRight />
                </a>
            </div>

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>Đang tải sản phẩm...</div>
            ) : (
                <div className="product-grid">
                    {products.map(p => (
                        <div className="product-card" key={p.id}>
                            <div className="product-img-wrapper">
                                <img src={p.image_url} alt={p.name} />
                            </div>
                            <div className="product-info">
                                <h3>{p.name}</h3>
                                <p className="product-price">{p.price ? p.price.toLocaleString('vi-VN') + 'đ' : 'Liên hệ'}</p>
                                <button className="add-to-cart-btn" onClick={() => handleAddToCart(p)}>Thêm vào giỏ</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

export default HotDeals;