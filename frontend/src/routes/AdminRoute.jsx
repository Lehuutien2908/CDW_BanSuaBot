import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

// Kiểm tra role admin dựa trên roles đã lưu lúc đăng nhập (xem Login.jsx)
const isAdmin = () => {
    try {
        const roles = JSON.parse(sessionStorage.getItem('userRoles') || '[]');
        return roles.includes('ROLE_ADMIN') || roles.includes('ADMIN');
    } catch {
        return false;
    }
};

const AdminRoute = ({ isLoggedIn }) => {
    const location = useLocation();

    if (!isLoggedIn) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!isAdmin()) {
        // Đã đăng nhập nhưng không phải admin -> không cho vào khu vực quản trị
        return <Navigate to="/home" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;
