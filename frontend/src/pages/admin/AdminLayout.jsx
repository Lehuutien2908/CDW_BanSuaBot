import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FiBarChart2, FiBox, FiShoppingBag, FiUsers, FiArrowLeft } from 'react-icons/fi';
import './adminLayout.css';

// Các mục điều hướng của khu Admin
const NAV_ITEMS = [
    { label: 'Thống kê', icon: FiBarChart2, path: '/admin' },
    { label: 'Sản phẩm', icon: FiBox, path: '/admin/products' },
    { label: 'Đơn hàng', icon: FiShoppingBag, path: '/admin/orders' },
    { label: 'Khách hàng', icon: FiUsers, path: '/admin/customers' },
];

const AdminLayout = () => {
    const navigate = useNavigate();

    return (
        <div className="admin-shell">
            <aside className="admin-sidebar">
                <div className="admin-sidebar-brand">
                    <div className="admin-sidebar-brand-icon">S</div>
                    <div className="admin-sidebar-brand-text">
                        <strong>Suatot</strong>
                        <span>Trang quản trị</span>
                    </div>
                </div>

                <nav className="admin-nav">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.label}
                                to={item.path}
                                end
                                className={({ isActive }) => `admin-nav-item${isActive ? ' is-active' : ''}`}
                            >
                                <Icon />
                                {item.label}
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="admin-sidebar-footer">
                    <button className="admin-back-site" onClick={() => navigate('/home')}>
                        <FiArrowLeft />
                        Về trang chủ
                    </button>
                </div>
            </aside>

            <main className="admin-content">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
