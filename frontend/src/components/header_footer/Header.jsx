import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FaChevronUp } from "react-icons/fa";
import { FiSearch, FiShoppingCart, FiMenu, FiX, FiUser } from "react-icons/fi";

import './header.css';

const Header = ({ isLoggedIn, setIsLoggedIn }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleLogout = () => {
        localStorage.setItem("isLoggedIn", "false");
        setIsLoggedIn(false);
        setIsDropdownOpen(false);

        navigate('/home');
    };

    return (
        <header className="header-container">
            <div className="header-left">
                <Link to="/home" className="logo">
                    <div className="logo-icon">
                        <FaChevronUp size={20} />
                    </div>
                    <span className="logo-text">Suatot</span>
                </Link>

                <button className="mobile-menu-btn" onClick={toggleMenu}>
                    {isMenuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
                </button>

                <nav className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
                    <NavLink
                        to="/home"
                        className={({ isActive }) => isActive ? "nav-link active" : "nav-link text-gray"}
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Trang chủ
                    </NavLink>
                    <NavLink
                        to="/products"
                        className={({ isActive }) => isActive ? "nav-link active" : "nav-link text-gray"}
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Sản phẩm
                    </NavLink>
                </nav>
            </div>

            <div className="header-center">
                <div className="search-bar">
                    <FiSearch className="search-icon" size={22} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        className="search-input"
                    />
                </div>
            </div>

            <div className="header-right">
                {isLoggedIn ? (
                    <div className="user-menu-container">
                        <div className="user-avatar" onClick={toggleDropdown}>
                            <FiUser size={22} />
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

                <Link to="/cart" className="cart-btn" style={{ textDecoration: 'none' }}>
                    <FiShoppingCart size={22} />
                    <span>Giỏ hàng</span>
                    <span className="cart-badge">0</span>
                </Link>
            </div>
        </header>
    );
};

export default Header;