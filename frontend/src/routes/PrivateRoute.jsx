import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const PrivateRoute = ({ isLoggedIn }) => {
    const location = useLocation();
    // Tham số replace giúp xóa lịch sử trang bị chặn, khách ấn Back không bị kẹt
    if (!isLoggedIn) {
        // Gắn vị trí hiện tại vào "state" của Navigate rồi mới đá ra /login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
};

export default PrivateRoute;