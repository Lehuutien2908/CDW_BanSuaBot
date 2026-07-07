import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiArrowLeft, FiMinus, FiPlus } from 'react-icons/fi';
import { addToCart } from '../../services/cartService';
import './productDetail.css';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);

    // Ảnh đang hiển thị to ở khung chính + toàn bộ ảnh của biến thể đang chọn (để hiện thumbnail)
    const [activeImage, setActiveImage] = useState(null);
    const variantImages = (selectedVariant?.images && selectedVariant.images.length > 0)
        ? selectedVariant.images
        : (selectedVariant?.imageUrl ? [selectedVariant.imageUrl] : (product?.imageUrl ? [product.imageUrl] : []));

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

    // Khi đổi biến thể (trọng lượng) -> tự động quay về ảnh đầu tiên (ảnh chính) của biến thể đó
    useEffect(() => {
        if (variantImages.length > 0) {
            setActiveImage(variantImages[0]);
        } else {
            setActiveImage(null);
        }
    }, [selectedVariant]);

    const handleAddToCart = async () => {
        // Kiểm tra đăng nhập
        const token = sessionStorage.getItem('token');
        if (!token) {
            alert('Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng.');
            navigate('/login', { state: { from: `/products/${id}` } });
            return;
        }

        // Validate
        if (!selectedVariant) {
            alert('Vui lòng chọn trọng lượng!');
            return;
        }

        if (quantity <= 0) {
            alert('Số lượng phải lớn hơn 0!');
            return;
        }

        if (selectedVariant.stock < quantity) {
            alert(`Rất tiếc, kho chỉ còn ${selectedVariant.stock} sản phẩm!`);
            return;
        }

        if (selectedVariant.stock === 0) {
            alert('Sản phẩm đã hết hàng!');
            return;
        }

        try {
            setAddingToCart(true);
            await addToCart(selectedVariant.id, quantity);
            alert(`Đã thêm ${quantity} x ${product.name} (${selectedVariant.weight}g) vào giỏ hàng!`);
            
            // Dispatch custom event để Header cập nhật badge
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (error) {
            console.error('Lỗi khi thêm vào giỏ hàng:', error);
            alert(error.message || 'Không thể thêm vào giỏ hàng. Vui lòng thử lại.');
        } finally {
            setAddingToCart(false);
        }
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
                    <div className="detail-main-image">
                        <img src={activeImage || product.imageUrl} alt={product.name} />
                    </div>

                    {variantImages.length > 1 && (
                        <div className="detail-thumbnail-list">
                            {variantImages.map((img, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    className={`detail-thumbnail-btn ${activeImage === img ? 'active' : ''}`}
                                    onClick={() => setActiveImage(img)}
                                >
                                    <img src={img} alt={`${product.name} ${index + 1}`} />
                                </button>
                            ))}
                        </div>
                    )}
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
                            <button 
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                disabled={quantity <= 1}
                            >
                                <FiMinus />
                            </button>
                            <input 
                                type="number" 
                                value={quantity} 
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    if (!isNaN(val) && val > 0) {
                                        setQuantity(Math.min(val, selectedVariant?.stock || 999));
                                    }
                                }}
                                min="1"
                                max={selectedVariant?.stock || 999}
                            />
                            <button 
                                onClick={() => setQuantity(Math.min(quantity + 1, selectedVariant?.stock || 999))}
                                disabled={quantity >= (selectedVariant?.stock || 999)}
                            >
                                <FiPlus />
                            </button>
                        </div>

                        <button 
                            className="add-to-cart-big-btn"
                            onClick={handleAddToCart}
                            disabled={addingToCart || !selectedVariant || selectedVariant.stock === 0}
                        >
                            <FiShoppingCart /> 
                            {addingToCart ? 'Đang thêm...' : 'Thêm Vào Giỏ Hàng'}
                        </button>
                    </div>

                    <div className="detail-policy">
                        <p>✓ Cam kết 100% chính hãng</p>
                        <p>✓ Đổi trả miễn phí trong 7 ngày</p>
                        <p>✓ Giao hàng nhanh</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;