import React, { useState, useEffect } from 'react';
import './newProduct.css';
import { FaArrowRight } from 'react-icons/fa';

function NewProduct() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:8080/api/products/new-products')
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
        <section className="product-section new-section">
            <div className="section-header">
                <div className="section-title">
                    <h2>Sản Phẩm Mới Ra Mắt</h2>
                    <p>Cập nhật những giải pháp dinh dưỡng đột phá mới nhất cho bé.</p>
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
                            <span className="new-badge">New</span>
                            <div className="product-img-wrapper">
                                <img src={p.image_url} alt={p.name} />
                            </div>
                            <div className="product-info">
                                <h3>{p.name}</h3>
                                <p className="product-price">{p.price ? p.price.toLocaleString('vi-VN') + 'đ' : 'Liên hệ'}</p>
                                <button className="add-to-cart-btn">Thêm vào giỏ</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

export default NewProduct;