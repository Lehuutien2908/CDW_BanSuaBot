const API_BASE_URL = 'http://localhost:8080/api';

// Helper: Lấy token từ sessionStorage
const getAuthHeaders = () => {
    const token = sessionStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

// Helper: Xử lý response
const handleResponse = async (response) => {
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Có lỗi xảy ra');
    }
    // Nếu 204 No Content
    if (response.status === 204) {
        return null;
    }
    return response.json();
};

// Thêm vào giỏ hàng
export const addToCart = async (variantId, quantity) => {
    const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ variantId, quantity }),
    });
    return handleResponse(response);
};

// Lấy giỏ hàng
export const getCart = async () => {
    const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

// Cập nhật số lượng
export const updateCartItem = async (cartItemId, quantity) => {
    const response = await fetch(`${API_BASE_URL}/cart/${cartItemId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ quantity }),
    });
    return handleResponse(response);
};

// Xóa item
export const removeCartItem = async (cartItemId) => {
    const response = await fetch(`${API_BASE_URL}/cart/${cartItemId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

// Xóa toàn bộ giỏ hàng
export const clearCart = async () => {
    const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};
