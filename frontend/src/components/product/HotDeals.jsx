import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import { FaArrowRight } from 'react-icons/fa';
import './hotDeals.css';

function HotDeals() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

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

    return (
        <section className="product-section">
            <div className="section-header">
                <div className="section-title">
                    <h2>Sản Phẩm Bán Chạy Nhất</h2>
                    <p>Lựa chọn hàng đầu của hàng ngàn bà mẹ Việt Nam.</p>
                </div>
                <Link to="/products" className="view-all-link">
                    Xem tất cả <FaArrowRight />
                </Link>
            </div>

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>Đang tải sản phẩm...</div>
            ) : (
                <div className="product-grid">
                    {products.map(p => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                </div>
            )}
        </section>
    );
}

export default HotDeals;