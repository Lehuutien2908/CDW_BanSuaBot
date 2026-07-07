import {BrowserRouter, Routes, Route, useLocation} from "react-router-dom";
import React, {useState} from 'react';
import Home from "./pages/Home";
import Header from "./components/header_footer/Header";
import Footer from "./components/header_footer/Footer";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword"
import ResetPassword from './pages/auth/ResetPassword';
import VerifyAccount from './pages/auth/VerifyAccount';
import PrivateRoute from "./routes/PrivateRoute";
import Products from "./pages/products/Products";
import ProductDetail from "./pages/products/ProductDetail";
import Profile from "./pages/profile/Profile";
import OrderHistory from "./pages/profile/OrderHistory";
import Cart from "./pages/checkout/Cart";
import Checkout from "./pages/checkout/Checkout";
import OrderSuccess from "./pages/checkout/OrderSuccess";
import VNPayReturn from "./pages/checkout/VNPayReturn";
import AdminLayout from "./pages/admin/AdminLayout";
import Statistics from "./pages/admin/Statistics";
import ProductManagement from "./pages/admin/ProductManagement";
import OrderManagement from "./pages/admin/OrderManagement";
import CustomerManagement from "./pages/admin/CustomerManagement";
import AdminRoute from "./routes/AdminRoute";

const SiteChrome = ({isLoggedIn, setIsLoggedIn, children}) => {
    const location = useLocation();
    const isAdminArea = location.pathname.startsWith("/admin");

    if (isAdminArea) {
        return <>{children}</>;
    }

    return (
        <>
            <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/>
            {children}
            <Footer/>
        </>
    );
};

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        const token = sessionStorage.getItem("token");
        return !!token;
    });

    return (
        <BrowserRouter>
            <SiteChrome isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}>
                <Routes>

                    <Route path="/" element={<Home/>}/>
                    <Route path="/home" element={<Home/>}/>
                    <Route path="/products" element={<Products/>}/>
                    <Route path="/products/:id" element={<ProductDetail/>}/>

                    <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn}/>}/>
                    <Route path="/register" element={<Register/>}/>
                    <Route path="/forgot-password" element={<ForgotPassword/>}/>
                    <Route path="/reset-password" element={<ResetPassword/>}/>
                    <Route path="/verify-account" element={<VerifyAccount/>}/>

                    <Route path="/cart" element={<Cart/>}/>
                    <Route path="/vnpay-return" element={<VNPayReturn/>}/>

                    <Route element={<PrivateRoute isLoggedIn={isLoggedIn}/>}>
                        <Route path="/profile" element={<Profile/>}/>
                        <Route path="/orders" element={<OrderHistory/>}/>
                        <Route path="/checkout" element={<Checkout/>}/>
                        <Route path="/order-success" element={<OrderSuccess/>}/>
                    </Route>

                    <Route element={<AdminRoute isLoggedIn={isLoggedIn}/>}>
                        <Route path="/admin" element={<AdminLayout/>}>
                            <Route index element={<Statistics/>}/>
                            <Route path="products" element={<ProductManagement/>}/>
                            <Route path="orders" element={<OrderManagement/>}/>
                            <Route path="customers" element={<CustomerManagement/>}/>
                        </Route>
                    </Route>
                </Routes>
            </SiteChrome>
        </BrowserRouter>
    );
}

export default App;