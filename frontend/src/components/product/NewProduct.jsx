import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import { FaArrowRight } from 'react-icons/fa';
import './newProduct.css';

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
                <Link to="/products" className="view-all-link">
                    Xem tất cả <FaArrowRight />
                </Link>
            </div>

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>Đang tải sản phẩm...</div>
            ) : (
                <div className="product-grid">
                    {products.map(p => (
                        <div key={p.id} style={{ position: 'relative' }}>
                            <span className="new-badge" style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 2 }}>New</span>

                            <ProductCard product={p} />
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

export default NewProduct;