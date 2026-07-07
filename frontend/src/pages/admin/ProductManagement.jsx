import React, { useEffect, useMemo, useState } from 'react';
import { FiBox, FiSearch, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import adminProductService from '../../services/adminProductService';
import ProductFormModal from './ProductFormModal';
import './management.css';

const formatCurrency = (value) =>
    value === null || value === undefined ? '-' : `${Number(value).toLocaleString('vi-VN')}₫`;

// Ảnh có thể là link ngoài (http/https) hoặc đường dẫn do server lưu (/uploads/products/...)
const resolveImageSrc = (url) => {
    if (!url) return '';
    return /^https?:\/\//i.test(url) ? url : `http://localhost:8080${url}`;
};

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [brandFilter, setBrandFilter] = useState('');

    const [showForm, setShowForm] = useState(false);
    const [editingProductId, setEditingProductId] = useState(null);

    useEffect(() => {
        loadProducts();
        loadOptions();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await adminProductService.getAllProducts();
            setProducts(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadOptions = async () => {
        try {
            const [catRes, brandRes] = await Promise.all([
                fetch('http://localhost:8080/api/categories'),
                fetch('http://localhost:8080/api/brands'),
            ]);
            setCategories(catRes.ok ? await catRes.json() : []);
            setBrands(brandRes.ok ? await brandRes.json() : []);
        } catch {
            // Không chặn trang nếu lỗi tải danh mục/thương hiệu - form vẫn dùng được, chỉ thiếu lựa chọn
        }
    };

    const openCreateForm = () => {
        setEditingProductId(null);
        setShowForm(true);
    };

    const openEditForm = (productId) => {
        setEditingProductId(productId);
        setShowForm(true);
    };

    const closeForm = () => setShowForm(false);

    const handleSaved = () => {
        setShowForm(false);
        loadProducts();
    };

    const handleDelete = async (product) => {
        if (!window.confirm(`Xoá sản phẩm "${product.name}"? Hành động này không thể hoàn tác.`)) return;
        try {
            await adminProductService.deleteProduct(product.id);
            setProducts((prev) => prev.filter((p) => p.id !== product.id));
        } catch (err) {
            alert(err.message);
        }
    };

    const filteredProducts = useMemo(() => {
        return products.filter((p) => {
            const matchesSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = !categoryFilter || String(p.categoryId) === categoryFilter;
            const matchesBrand = !brandFilter || String(p.brandId) === brandFilter;
            return matchesSearch && matchesCategory && matchesBrand;
        });
    }, [products, searchTerm, categoryFilter, brandFilter]);

    if (loading) return <div className="loading">Đang tải...</div>;

    return (
        <div className="management-container">
            <div className="management-header">
                <h1><FiBox /> Quản lý Sản phẩm</h1>
                <button className="btn-add" onClick={openCreateForm}>
                    <FiPlus /> Thêm sản phẩm
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="search-bar-admin">
                <FiSearch />
                <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm theo tên..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="pm-filter-row">
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                    <option value="">Tất cả danh mục</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
                <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)}>
                    <option value="">Tất cả thương hiệu</option>
                    {brands.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                </select>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                    <tr>
                        <th>Ảnh</th>
                        <th>Tên sản phẩm</th>
                        <th>Danh mục</th>
                        <th>Thương hiệu</th>
                        <th>Giá</th>
                        <th>Tồn kho</th>
                        <th>Biến thể</th>
                        <th>Thao tác</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredProducts.length === 0 ? (
                        <tr>
                            <td colSpan="8" className="empty-row">Không có sản phẩm nào</td>
                        </tr>
                    ) : (
                        filteredProducts.map((p) => (
                            <tr key={p.id}>
                                <td>
                                    {p.thumbnailUrl ? (
                                        <img
                                            className="product-thumb"
                                            src={resolveImageSrc(p.thumbnailUrl)}
                                            alt={p.name}
                                        />
                                    ) : (
                                        <div className="product-thumb pm-thumb-placeholder"><FiBox /></div>
                                    )}
                                </td>
                                <td className="product-name">{p.name}</td>
                                <td>{p.categoryName || '-'}</td>
                                <td>{p.brandName || '-'}</td>
                                <td className="price-range">
                                    {p.minPrice === p.maxPrice
                                        ? formatCurrency(p.minPrice)
                                        : `${formatCurrency(p.minPrice)} - ${formatCurrency(p.maxPrice)}`}
                                </td>
                                <td className="center-cell">
                                        <span className={`stock-badge ${p.totalStock > 0 ? 'in-stock' : 'out-stock'}`}>
                                            {p.totalStock}
                                        </span>
                                </td>
                                <td className="center-cell">{p.variantCount}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="btn-edit" title="Sửa" onClick={() => openEditForm(p.id)}>
                                            <FiEdit2 />
                                        </button>
                                        <button className="btn-delete" title="Xoá" onClick={() => handleDelete(p)}>
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            <div className="table-footer">
                <span>Tổng: {filteredProducts.length} sản phẩm</span>
            </div>

            {showForm && (
                <ProductFormModal
                    productId={editingProductId}
                    categories={categories}
                    brands={brands}
                    onClose={closeForm}
                    onSaved={handleSaved}
                />
            )}
        </div>
    );
};

export default ProductManagement;
