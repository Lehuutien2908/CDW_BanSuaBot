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
    if (response.status === 204) {
        return null;
    }
    return response.json();
};

// Lấy thống kê doanh thu theo tháng. Không truyền year/month -> BE tự lấy tháng hiện tại.
export const getRevenueStats = async (year, month) => {
    const params = new URLSearchParams();
    if (year) params.append('year', year);
    if (month) params.append('month', month);

    const query = params.toString() ? `?${params.toString()}` : '';

    const response = await fetch(`${API_BASE_URL}/admin/stats/revenue${query}`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};
