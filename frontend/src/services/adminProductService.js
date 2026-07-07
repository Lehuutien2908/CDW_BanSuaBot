const API_BASE_URL = 'http://localhost:8080/api/admin/products';

const authHeaders = () => {
    const token = sessionStorage.getItem('token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
};

// Đọc message lỗi trả về từ BE (dạng {message: "..."} hoặc text thường)
const extractErrorMessage = async (response, fallback) => {
    try {
        const data = await response.clone().json();
        if (data && data.message) return data.message;
    } catch (_) {
        // không phải JSON, bỏ qua
    }
    return fallback;
};

const adminProductService = {
    // Lấy toàn bộ sản phẩm (kèm biến thể) cho bảng quản lý
    getAllProducts: async () => {
        const response = await fetch(API_BASE_URL, {
            headers: authHeaders(),
        });
        if (!response.ok) {
            throw new Error(await extractErrorMessage(response, 'Không thể tải danh sách sản phẩm'));
        }
        return response.json();
    },

    // Lấy chi tiết 1 sản phẩm (đổ vào form sửa)
    getProductDetail: async (id) => {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            headers: authHeaders(),
        });
        if (!response.ok) {
            throw new Error(await extractErrorMessage(response, 'Không thể tải chi tiết sản phẩm'));
        }
        return response.json();
    },

    // Tạo sản phẩm mới
    createProduct: async (payload) => {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            throw new Error(await extractErrorMessage(response, 'Không thể tạo sản phẩm'));
        }
        return response.json();
    },

    // Cập nhật sản phẩm
    updateProduct: async (id, payload) => {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            throw new Error(await extractErrorMessage(response, 'Không thể cập nhật sản phẩm'));
        }
        return response.json();
    },

    // Xoá sản phẩm
    deleteProduct: async (id) => {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE',
            headers: authHeaders(),
        });
        if (!response.ok) {
            throw new Error(await extractErrorMessage(response, 'Không thể xoá sản phẩm'));
        }
    },

    // Upload 1 ảnh sản phẩm, trả về { url }
    uploadImage: async (file) => {
        const token = sessionStorage.getItem('token');
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE_URL}/upload-image`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                // Không set Content-Type - browser tự thêm boundary cho multipart/form-data
            },
            body: formData,
        });
        if (!response.ok) {
            throw new Error(await extractErrorMessage(response, 'Không thể upload ảnh'));
        }
        return response.json();
    },
};

export default adminProductService;
