import React, { useEffect, useRef, useState } from 'react';
import { FiX, FiPlus, FiTrash2, FiUpload, FiStar, FiLoader, FiLink2 } from 'react-icons/fi';
import adminProductService from '../../services/adminProductService';
import './orderDetailModal.css';
import './productForm.css';

let tempIdCounter = 0;
const nextTempId = () => `tmp-${++tempIdCounter}-${Date.now()}`;

const emptyImage = (url) => ({ tempId: nextTempId(), id: null, imageUrl: url, isPrimary: false });
const emptyVariant = () => ({
    tempId: nextTempId(),
    id: null,
    weight: '',
    price: '',
    stock: '',
    images: [],
});

// Ảnh có thể là link ngoài (http/https) hoặc đường dẫn do server lưu (/uploads/products/...)
const resolveImageSrc = (url) => {
    if (!url) return '';
    return /^https?:\/\//i.test(url) ? url : `http://localhost:8080${url}`;
};

// productId = null -> tạo mới; có giá trị -> sửa sản phẩm đó
const ProductFormModal = ({ productId, categories, brands, onClose, onSaved }) => {
    const isEditMode = !!productId;

    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [brandId, setBrandId] = useState('');
    const [variants, setVariants] = useState([emptyVariant()]);

    const [loadingDetail, setLoadingDetail] = useState(isEditMode);
    const [submitting, setSubmitting] = useState(false);
    const [uploadingKey, setUploadingKey] = useState(null); // tempId của biến thể đang upload ảnh
    const [urlDrafts, setUrlDrafts] = useState({}); // tempId biến thể -> link ảnh đang gõ
    const [error, setError] = useState('');

    const fileInputRefs = useRef({});

    useEffect(() => {
        if (!isEditMode) return;

        let cancelled = false;
        adminProductService.getProductDetail(productId)
            .then((data) => {
                if (cancelled) return;
                setName(data.name || '');
                setCategoryId(data.categoryId ?? '');
                setBrandId(data.brandId ?? '');
                setVariants(
                    (data.variants || []).map((v) => ({
                        tempId: nextTempId(),
                        id: v.id,
                        weight: v.weight ?? '',
                        price: v.price ?? '',
                        stock: v.stock ?? '',
                        images: (v.images || []).map((img) => ({
                            tempId: nextTempId(),
                            id: img.id,
                            imageUrl: img.imageUrl,
                            isPrimary: !!img.isPrimary,
                        })),
                    }))
                );
            })
            .catch((err) => setError(err.message))
            .finally(() => { if (!cancelled) setLoadingDetail(false); });

        return () => { cancelled = true; };
    }, [isEditMode, productId]);

    const updateVariant = (tempId, patch) => {
        setVariants((prev) => prev.map((v) => (v.tempId === tempId ? { ...v, ...patch } : v)));
    };

    const addVariant = () => setVariants((prev) => [...prev, emptyVariant()]);

    const removeVariant = (tempId) => {
        setVariants((prev) => (prev.length > 1 ? prev.filter((v) => v.tempId !== tempId) : prev));
    };

    const handleUploadImages = async (variantTempId, files) => {
        if (!files || files.length === 0) return;
        setUploadingKey(variantTempId);
        setError('');
        try {
            const uploaded = [];
            for (const file of Array.from(files)) {
                const res = await adminProductService.uploadImage(file);
                uploaded.push(emptyImage(res.url));
            }
            setVariants((prev) => prev.map((v) => {
                if (v.tempId !== variantTempId) return v;
                const images = [...v.images, ...uploaded];
                // Nếu chưa có ảnh chính, tự chọn ảnh đầu tiên
                if (!images.some((img) => img.isPrimary) && images.length > 0) {
                    images[0].isPrimary = true;
                }
                return { ...v, images };
            }));
        } catch (err) {
            setError(err.message);
        } finally {
            setUploadingKey(null);
        }
    };

    const addImageByUrl = (variantTempId) => {
        const url = (urlDrafts[variantTempId] || '').trim();
        if (!url) return;
        setVariants((prev) => prev.map((v) => {
            if (v.tempId !== variantTempId) return v;
            const images = [...v.images, emptyImage(url)];
            if (!images.some((img) => img.isPrimary) && images.length > 0) {
                images[0].isPrimary = true;
            }
            return { ...v, images };
        }));
        setUrlDrafts((prev) => ({ ...prev, [variantTempId]: '' }));
    };

    const setPrimaryImage = (variantTempId, imageTempId) => {
        setVariants((prev) => prev.map((v) => {
            if (v.tempId !== variantTempId) return v;
            return {
                ...v,
                images: v.images.map((img) => ({ ...img, isPrimary: img.tempId === imageTempId })),
            };
        }));
    };

    const removeImage = (variantTempId, imageTempId) => {
        setVariants((prev) => prev.map((v) => {
            if (v.tempId !== variantTempId) return v;
            const images = v.images.filter((img) => img.tempId !== imageTempId);
            if (images.length > 0 && !images.some((img) => img.isPrimary)) {
                images[0].isPrimary = true;
            }
            return { ...v, images };
        }));
    };

    const validate = () => {
        if (!name.trim()) return 'Vui lòng nhập tên sản phẩm';
        if (variants.length === 0) return 'Sản phẩm cần có ít nhất 1 biến thể';
        for (const v of variants) {
            if (!String(v.weight).trim()) return 'Vui lòng nhập khối lượng cho tất cả biến thể';
            if (v.price === '' || Number(v.price) < 0) return 'Giá biến thể không hợp lệ';
            if (v.stock === '' || Number(v.stock) < 0) return 'Số lượng tồn kho không hợp lệ';
        }
        return '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        const payload = {
            name: name.trim(),
            categoryId: categoryId === '' ? null : Number(categoryId),
            brandId: brandId === '' ? null : Number(brandId),
            variants: variants.map((v) => ({
                id: v.id,
                weight: String(v.weight).trim(),
                price: Number(v.price),
                stock: Number(v.stock),
                images: v.images.map((img) => ({
                    id: img.id,
                    imageUrl: img.imageUrl,
                    isPrimary: img.isPrimary,
                })),
            })),
        };

        setSubmitting(true);
        setError('');
        try {
            if (isEditMode) {
                await adminProductService.updateProduct(productId, payload);
            } else {
                await adminProductService.createProduct(payload);
            }
            onSaved();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content pf-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{isEditMode ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h3>
                    <button className="close-btn" onClick={onClose}><FiX /></button>
                </div>

                {loadingDetail ? (
                    <div className="pf-loading"><FiLoader className="pf-spin" /> Đang tải dữ liệu...</div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            {error && <div className="error-message">{error}</div>}

                            <div className="pf-field-row">
                                <div className="pf-field pf-field-grow">
                                    <label>Tên sản phẩm</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="VD: Sữa tươi Vinamilk 100% nguyên chất"
                                    />
                                </div>
                            </div>

                            <div className="pf-field-row">
                                <div className="pf-field">
                                    <label>Danh mục</label>
                                    <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                                        <option value="">-- Chọn danh mục --</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="pf-field">
                                    <label>Thương hiệu</label>
                                    <select value={brandId} onChange={(e) => setBrandId(e.target.value)}>
                                        <option value="">-- Chọn thương hiệu --</option>
                                        {brands.map((b) => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="pf-variants-header">
                                <h4>Biến thể sản phẩm</h4>
                                <button type="button" className="pf-btn-add-variant" onClick={addVariant}>
                                    <FiPlus /> Thêm biến thể
                                </button>
                            </div>

                            {variants.map((v, idx) => (
                                <div className="pf-variant-card" key={v.tempId}>
                                    <div className="pf-variant-card-header">
                                        <span>Biến thể {idx + 1}</span>
                                        {variants.length > 1 && (
                                            <button
                                                type="button"
                                                className="pf-btn-remove-variant"
                                                onClick={() => removeVariant(v.tempId)}
                                                title="Xoá biến thể này"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        )}
                                    </div>

                                    <div className="pf-field-row">
                                        <div className="pf-field">
                                            <label>Khối lượng</label>
                                            <input
                                                type="text"
                                                value={v.weight}
                                                onChange={(e) => updateVariant(v.tempId, { weight: e.target.value })}
                                                placeholder="VD: 900g"
                                            />
                                        </div>
                                        <div className="pf-field">
                                            <label>Giá (₫)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={v.price}
                                                onChange={(e) => updateVariant(v.tempId, { price: e.target.value })}
                                                placeholder="0"
                                            />
                                        </div>
                                        <div className="pf-field">
                                            <label>Tồn kho</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={v.stock}
                                                onChange={(e) => updateVariant(v.tempId, { stock: e.target.value })}
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>

                                    <div className="pf-images-section">
                                        <div className="pf-images-grid">
                                            {v.images.map((img) => (
                                                <div className={`pf-image-thumb${img.isPrimary ? ' is-primary' : ''}`} key={img.tempId}>
                                                    <img src={resolveImageSrc(img.imageUrl)} alt="" />
                                                    <button
                                                        type="button"
                                                        className="pf-image-star"
                                                        title="Đặt làm ảnh chính"
                                                        onClick={() => setPrimaryImage(v.tempId, img.tempId)}
                                                    >
                                                        <FiStar />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="pf-image-remove"
                                                        title="Xoá ảnh"
                                                        onClick={() => removeImage(v.tempId, img.tempId)}
                                                    >
                                                        <FiX />
                                                    </button>
                                                </div>
                                            ))}

                                            <button
                                                type="button"
                                                className="pf-image-upload-btn"
                                                onClick={() => fileInputRefs.current[v.tempId]?.click()}
                                                disabled={uploadingKey === v.tempId}
                                            >
                                                {uploadingKey === v.tempId ? <FiLoader className="pf-spin" /> : <FiUpload />}
                                                <span>Thêm ảnh</span>
                                            </button>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                ref={(el) => (fileInputRefs.current[v.tempId] = el)}
                                                style={{ display: 'none' }}
                                                onChange={(e) => {
                                                    handleUploadImages(v.tempId, e.target.files);
                                                    e.target.value = '';
                                                }}
                                            />
                                        </div>

                                        <div className="pf-image-url-row">
                                            <FiLink2 />
                                            <input
                                                type="text"
                                                placeholder="Hoặc dán link ảnh (https://...) rồi nhấn Gắn"
                                                value={urlDrafts[v.tempId] || ''}
                                                onChange={(e) => setUrlDrafts((prev) => ({ ...prev, [v.tempId]: e.target.value }))}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        addImageByUrl(v.tempId);
                                                    }
                                                }}
                                            />
                                            <button type="button" className="pf-btn-attach-url" onClick={() => addImageByUrl(v.tempId)}>
                                                Gắn link
                                            </button>
                                        </div>

                                        <p className="pf-images-hint">Nhấn <FiStar size={12} /> để chọn ảnh chính hiển thị ngoài danh sách sản phẩm.</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn-close" onClick={onClose} disabled={submitting}>Hủy</button>
                            <button type="submit" className="pf-btn-submit" disabled={submitting}>
                                {submitting ? 'Đang lưu...' : (isEditMode ? 'Lưu thay đổi' : 'Tạo sản phẩm')}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ProductFormModal;
