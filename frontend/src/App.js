import {BrowserRouter, Routes, Route} from "react-router-dom";
import React, {useState} from 'react';
import Home from "./pages/Home";
import Header from "./components/header_footer/Header";
import Footer from "./components/header_footer/Footer";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword"
import ResetPassword from './pages/auth/ResetPassword';
import VerifyAccount from './pages/auth/VerifyAccount';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        const savedState = localStorage.getItem("isLoggedIn");
        if (savedState === null) {
            localStorage.setItem("isLoggedIn", "false");
            return false;
        }
        return savedState === "true";
    });

    return (
        <BrowserRouter>
            <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/>
            <Routes>

                <Route path="/" element={<Home/>}/>
                <Route path="/home" element={<Home/>}/>
                {/*<Route path="/products" element={<Products />} />*/}
                {/*<Route path="/products/:id" element={<ProductDetail />} />*/}

                <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn}/>}/>
                <Route path="/register" element={<Register/>}/>
                <Route path="/forgot-password" element={<ForgotPassword/>}/>
                <Route path="/reset-password" element={<ResetPassword/>}/>
                <Route path="/verify-account" element={<VerifyAccount/>}/>

                <Route element={<PrivateRoute isLoggedIn={isLoggedIn}/>}>
                    {/*<Route path="/profile" element={<User />} />*/}
                    {/*<Route path="/order/:id" element={<OrderDetail />} />*/}
                    {/*<Route path="/orders" element={<Orders />} />*/}

                    {/*<Route path="/payment" element={<Payment />} />*/}
                    {/*<Route path="/cart" element={<Cart />} />*/}
                </Route>
            </Routes>
            <Footer/>
        </BrowserRouter>
    );
}

export default App;