const API_BASE_URL = 'http://localhost:8080/api/admin/orders';

/**
 * Service để gọi API quản lý đơn hàng admin
 */
const adminOrderService = {
    /**
     * Lấy tất cả đơn hàng (có thể lọc theo status)
     */
    getAllOrders: async (status = null) => {
        const token = sessionStorage.getItem('token');
        const url = status 
            ? `${API_BASE_URL}?status=${status}` 
            : API_BASE_URL;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Không thể tải danh sách đơn hàng');
        }
        
        return await response.json();
    },

    /**
     * Lấy chi tiết đơn hàng
     */
    getOrderDetail: async (orderId) => {
        const token = sessionStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Không thể tải chi tiết đơn hàng');
        }
        
        return await response.json();
    },

    /**
     * Cập nhật trạng thái đơn hàng
     */
    updateOrderStatus: async (orderId, status) => {
        const token = sessionStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/${orderId}/status?status=${status}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Không thể cập nhật trạng thái đơn hàng');
        }
        
        return await response.json();
    }
};

export default adminOrderService;
