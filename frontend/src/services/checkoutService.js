/**
 * Checkout Service - Xử lý thanh toán
 */

const API_BASE = 'http://localhost:8080/api';

/**
 * Tạo đơn hàng
 */
export const createOrder = async (orderData) => {
    const token = sessionStorage.getItem('token');
    if (!token) {
        throw new Error('Vui lòng đăng nhập để đặt hàng');
    }

    try {
        const response = await fetch(`${API_BASE}/orders/checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || 'Không thể tạo đơn hàng');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};
