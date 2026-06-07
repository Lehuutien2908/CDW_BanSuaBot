import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/product/ProductCard';
import { FiFilter, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './products.css';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('search');

    const [activeCategory, setActiveCategory] = useState('');
    const [activeBrand, setActiveBrand] = useState('');
    const [activePrice, setActivePrice] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);

    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    const categories = [
        { id: '', name: 'Tất cả' },
        { id: 2, name: 'Sữa cho bé 0-6 tháng' },
        { id: 5, name: 'Sữa cho bé 6-12 tháng' },
        { id: 6, name: 'Sữa cho bé 1-3 tuổi' },
        { id: 7, name: 'Sữa cho bé trên 3 tuổi' },
        { id: 3, name: 'Sữa cho mẹ bầu' },
        { id: 4, name: 'Sữa cho người lớn' }
    ];

    const brands = [
        { id: '', name: 'Tất cả' },
        { id: 1, name: 'Meiji' },
        { id: 2, name: 'Colosbaby' },
        { id: 3, name: 'Nutifood' },
        { id: 4, name: 'Meta Care' },
        { id: 5, name: 'Enfamil - Enfagrow' },
        { id: 6, name: 'Aptamil' },
        { id: 7, name: 'Abbott' }
    ];

    const priceRanges = [
        { id: 'all', name: 'Tất cả' },
        { id: 'under_300', name: 'Dưới 300.000đ' },
        { id: '300_600', name: '300.000đ - 600.000đ' },
        { id: 'over_600', name: 'Trên 600.000đ' }
    ];

    // Riêng searchQuery từ URL đổi thì cần effect riêng để reset trang về 1 công tâm nhất
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    // Hàm gọi API chuẩn chỉnh duy nhất 1 lần khi có thay đổi trạng thái
    useEffect(() => {
        setIsLoading(true);
        const params = new URLSearchParams();

        if (searchQuery) params.append('name', searchQuery);
        if (activeCategory) params.append('categoryId', activeCategory);
        if (activeBrand) params.append('brandId', activeBrand);
        if (activePrice && activePrice !== 'all') params.append('price', activePrice);
        if (sortBy) params.append('sort', sortBy);

        // Spring Boot page bắt đầu từ 0
        params.append('page', currentPage - 1);
        params.append('size', 12);

        const apiURL = `http://localhost:8080/api/products/filter?${params.toString()}`;

        fetch(apiURL)
            .then(response => {
                if (!response.ok) throw new Error("Chưa có BE");
                return response.json();
            })
            .then(data => {
                if (data.content) {
                    setProducts(data.content);
                    setTotalPages(data.totalPages);
                    setTotalElements(data.totalElements);
                }
                setIsLoading(false);
            })
            .catch(error => {
                console.warn(error.message);
                setProducts([]);
                setTotalElements(0);
                setIsLoading(false);
            });

    }, [searchQuery, activeCategory, activeBrand, activePrice, sortBy, currentPage]);

    return (
        <div className="products-page">
            <div className="products-layout">

                <aside className="products-sidebar">
                    <div className="filter-group">
                        <h3 className="filter-title"><FiFilter /> Danh mục</h3>
                        <ul className="filter-list">
                            {categories.map((cat) => (
                                <li key={cat.id || 'all'}>
                                    <label className="filter-label">
                                        <input
                                            type="radio"
                                            name="category"
                                            checked={activeCategory === cat.id}
                                            // TỐI ƯU: Đổi bộ lọc là ép về trang 1 ngay tại chỗ
                                            onChange={() => { setActiveCategory(cat.id); setCurrentPage(1); }}
                                        />
                                        <span>{cat.name}</span>
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="filter-group">
                        <h3 className="filter-title">Thương hiệu</h3>
                        <ul className="filter-list">
                            {brands.map((brand) => (
                                <li key={brand.id || 'all'}>
                                    <label className="filter-label">
                                        <input
                                            type="radio"
                                            name="brand"
                                            checked={activeBrand === brand.id}
                                            // TỐI ƯU: Đổi thương hiệu ép về trang 1 luôn
                                            onChange={() => { setActiveBrand(brand.id); setCurrentPage(1); }}
                                        />
                                        <span>{brand.name}</span>
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="filter-group" style={{ borderBottom: 'none' }}>
                        <h3 className="filter-title">Khoảng giá</h3>
                        <ul className="filter-list">
                            {priceRanges.map((price) => (
                                <li key={price.id}>
                                    <label className="filter-label">
                                        <input
                                            type="radio"
                                            name="price"
                                            checked={activePrice === price.id}
                                            // TỐI ƯU: Đổi khoảng giá ép về trang 1 luôn
                                            onChange={() => { setActivePrice(price.id); setCurrentPage(1); }}
                                        />
                                        <span>{price.name}</span>
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>

                <main className="products-main">
                    <div className="products-header">
                        <div>
                            <h2>{searchQuery ? `Kết quả: "${searchQuery}"` : "Tất cả sản phẩm"}</h2>
                            <p className="products-count">Hiển thị {totalElements} sản phẩm</p>
                        </div>

                        <div className="sort-container">
                            <label>Sắp xếp:</label>
                            <select
                                value={sortBy}
                                // TỐI ƯU: Đổi kiểu sắp xếp ép về trang 1 luôn
                                onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                                className="sort-select"
                            >
                                <option value="newest">Mới nhất</option>
                                <option value="price_asc">Giá: Thấp đến Cao</option>
                                <option value="price_desc">Giá: Cao xuống Thấp</option>
                            </select>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="loading-state">Đang tải dữ liệu sản phẩm...</div>
                    ) : products.length > 0 ? (
                        <>
                            <div className="products-grid">
                                {products.map(p => (
                                    <ProductCard key={p.id} product={p} />
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="pagination">
                                    <button
                                        className="page-btn"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => prev - 1)}
                                    >
                                        <FiChevronLeft />
                                    </button>

                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                                            onClick={() => setCurrentPage(i + 1)}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}

                                    <button
                                        className="page-btn"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(prev => prev + 1)}
                                    >
                                        <FiChevronRight />
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="empty-state">
                            <h3>Không tìm thấy sản phẩm nào!</h3>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Products;