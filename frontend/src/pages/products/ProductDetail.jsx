import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../redux/CartSlice'; // Sửa lại đường dẫn nếu cần
import { FiShoppingCart, FiArrowLeft, FiMinus, FiPlus } from 'react-icons/fi';
import './productDetail.css';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        window.scrollTo(0, 0); // Tự động cuộn lên đầu trang khi vào
        setLoading(true);
        fetch(`http://localhost:8080/api/products/${id}`)
            .then(res => {
                if (!res.ok) throw new Error("Lỗi tải chi tiết");
                return res.json();
            })
            .then(data => {
                setProduct(data);
                if (data.variants && data.variants.length > 0) {
                    setSelectedVariant(data.variants[0]); // Mặc định chọn biến thể đầu tiên
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    const handleAddToCart = () => {
        if (!selectedVariant) return alert("Vui lòng chọn trọng lượng!");
        if (selectedVariant.stock < quantity) return alert("Rất tiếc, số lượng tồn kho không đủ!");

        // Đóng gói dữ liệu gửi lên Redux
        const cartItem = {
            id: `${product.id}-${selectedVariant.id}`, // Tạo ID riêng cho giỏ hàng để phân biệt 400g và 800g
            productId: product.id,
            name: product.name,
            image_url: product.imageUrl,
            price: selectedVariant.price,
            weight: selectedVariant.weight,
            quantity: quantity,
            stock: selectedVariant.stock
        };

        dispatch(addToCart(cartItem));
        alert(`Đã thêm ${quantity} x ${product.name} (${selectedVariant.weight}g) vào giỏ hàng!`);
    };

    if (loading) return <div className="detail-loading">Đang tải dữ liệu sản phẩm...</div>;
    if (!product) return <div className="detail-loading">Không tìm thấy sản phẩm!</div>;

    return (
        <div className="product-detail-page">
            <button className="back-btn" onClick={() => navigate(-1)}>
                <FiArrowLeft /> Quay lại
            </button>

            <div className="detail-layout">
                <div className="detail-image-section">
                    <img src={product.imageUrl} alt={product.name} />
                </div>

                <div className="detail-info-section">
                    <h1 className="detail-title">{product.name}</h1>

                    <div className="detail-meta">
                        <p>Thương hiệu: <span>{product.brandName || 'Đang cập nhật'}</span></p>
                        <p>Danh mục: <span>{product.categoryName || 'Đang cập nhật'}</span></p>
                    </div>

                    <div className="detail-price">
                        {selectedVariant
                            ? selectedVariant.price.toLocaleString('vi-VN') + 'đ'
                            : 'Liên hệ'}
                    </div>

                    {product.variants && product.variants.length > 0 && (
                        <div className="detail-variants">
                            <h3>Chọn trọng lượng:</h3>
                            <div className="variant-buttons">
                                {product.variants.map((v) => (
                                    <button
                                        key={v.id}
                                        className={`variant-btn ${selectedVariant?.id === v.id ? 'active' : ''}`}
                                        onClick={() => setSelectedVariant(v)}
                                    >
                                        {v.weight}g
                                    </button>
                                ))}
                            </div>
                            {selectedVariant && (
                                <p className="stock-info">
                                    Kho còn: <strong>{selectedVariant.stock}</strong> sản phẩm
                                </p>
                            )}
                        </div>
                    )}

                    <div className="detail-actions">
                        <div className="quantity-selector">
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}><FiMinus /></button>
                            <input type="number" value={quantity} readOnly />
                            <button onClick={() => setQuantity(quantity + 1)}><FiPlus /></button>
                        </div>

                        <button className="add-to-cart-big-btn" onClick={handleAddToCart}>
                            <FiShoppingCart /> Thêm Vào Giỏ Hàng
                        </button>
                    </div>

                    <div className="detail-policy">
                        <p>Cam kết 100% chính hãng</p>
                        <p>Đổi trả miễn phí trong 7 ngày</p>
                        <p>Giao hàng nhanh</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;