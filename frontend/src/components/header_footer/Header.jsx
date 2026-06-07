import React, {useState, useEffect, useRef} from 'react';
import {Link, NavLink, useNavigate} from 'react-router-dom';
import {useSelector} from 'react-redux';
import {FaChevronUp} from "react-icons/fa";
import {FiSearch, FiShoppingCart, FiMenu, FiX, FiUser} from "react-icons/fi";

import './header.css';

const Header = ({isLoggedIn, setIsLoggedIn}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const searchRef = useRef(null);

    const navigate = useNavigate();

    // Hút dữ liệu Giỏ hàng từ Redux
    const cartItems = useSelector((state) => state.cart.items);
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

    const handleLogout = () => {
        sessionStorage.clear();
        setIsLoggedIn(false);
        setIsDropdownOpen(false);
        navigate('/home');
    };

    const handleSearchSubmit = (e) => {
        // Nếu khách nhấn phím Enter HOẶC đây là sự kiện click chuột vào icon kính lúp
        if (e.key === 'Enter' || e.type === 'click') {
            if (searchTerm.trim() !== '') {
                setShowSearchDropdown(false);

                navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
            }
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.trim() === '') {
                setSearchResults([]);
                setShowSearchDropdown(false);
                return;
            }

            setIsSearching(true);
            setShowSearchDropdown(true);

            try {
                const response = await fetch(`http://localhost:8080/api/products/search?name=${searchTerm}`);
                const data = await response.json();

                // Lấy tối đa 5 sản phẩm đầu tiên
                setSearchResults(data.slice(0, 5));
            } catch (error) {
                console.error("Lỗi tìm kiếm:", error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    // Ẩn khung tìm kiếm khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearchDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="header-container">
            <div className="header-left">
                <Link to="/home" className="logo">
                    <div className="logo-icon">
                        <FaChevronUp size={20}/>
                    </div>
                    <span className="logo-text">Suatot</span>
                </Link>

                <button className="mobile-menu-btn" onClick={toggleMenu}>
                    {isMenuOpen ? <FiX size={28}/> : <FiMenu size={28}/>}
                </button>

                <nav className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
                    <NavLink
                        to="/home"
                        className={({isActive}) => isActive ? "nav-link active" : "nav-link text-gray"}
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Trang chủ
                    </NavLink>
                    <NavLink
                        to="/products"
                        className={({isActive}) => isActive ? "nav-link active" : "nav-link text-gray"}
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Sản phẩm
                    </NavLink>
                </nav>
            </div>

            <div className="header-center">
                <div className="search-bar" ref={searchRef}>
                    <FiSearch className="search-icon" size={22} style={{cursor: 'pointer'}}
                              onClick={handleSearchSubmit}/>
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => {
                            if (searchResults.length > 0) setShowSearchDropdown(true)
                        }}
                        onKeyDown={handleSearchSubmit}
                    />

                    {showSearchDropdown && (
                        <div className="search-dropdown-container">
                            {isSearching ? (
                                <div className="search-message">Đang tìm kiếm...</div>
                            ) : searchResults.length > 0 ? (
                                searchResults.map(product => (
                                    <Link
                                        to={`/products/${product.id}`}
                                        key={product.id}
                                        className="search-item"
                                        onClick={() => {
                                            setShowSearchDropdown(false);
                                            setSearchTerm('');
                                        }}
                                    >
                                        <img
                                            src={product.image_url}
                                            alt={product.name}
                                            className="search-item-img"
                                        />
                                        <div className="search-item-info">
                                            <div className="search-item-name">{product.name}</div>
                                            <div className="search-item-price">
                                                {product.price ? product.price.toLocaleString('vi-VN') + 'đ' : 'Liên hệ'}
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="search-message">Không tìm thấy "{searchTerm}"</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="header-right">
                {isLoggedIn ? (
                    <div className="user-menu-container">
                        <div className="user-avatar" onClick={toggleDropdown}>
                            <FiUser size={22}/>
                        </div>

                        {isDropdownOpen && (
                            <div className="user-dropdown">
                                <Link to="/profile" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                                    Thông tin cá nhân
                                </Link>
                                <Link to="/orders" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                                    Lịch sử mua hàng
                                </Link>

                                <div className="dropdown-divider"></div>

                                <button className="dropdown-item text-danger" onClick={handleLogout}>
                                    Đăng xuất
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <Link to="/login" className="login-link text-blue font-bold">Đăng nhập</Link>
                )}

                <Link to="/cart" className="cart-btn" style={{textDecoration: 'none'}}>
                    <FiShoppingCart size={22}/>
                    <span>Giỏ hàng</span>
                    <span className="cart-badge">{cartCount}</span>
                </Link>
            </div>
        </header>
    );
};

export default Header;