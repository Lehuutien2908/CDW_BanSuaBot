/**
 * API địa chỉ Việt Nam - provinces.open-api.vn
 * Miễn phí, không cần API key
 */

const API_BASE = 'https://provinces.open-api.vn/api';

/**
 * Lấy danh sách tỉnh/thành phố
 */
export const getProvinces = async () => {
    try {
        const response = await fetch(`${API_BASE}/p/`);
        if (!response.ok) throw new Error('Không thể tải danh sách tỉnh/thành phố');
        return await response.json();
    } catch (error) {
        console.error('Error fetching provinces:', error);
        throw error;
    }
};

/**
 * Lấy danh sách quận/huyện theo mã tỉnh
 */
export const getDistricts = async (provinceCode) => {
    try {
        const response = await fetch(`${API_BASE}/p/${provinceCode}?depth=2`);
        if (!response.ok) throw new Error('Không thể tải danh sách quận/huyện');
        const data = await response.json();
        return data.districts || [];
    } catch (error) {
        console.error('Error fetching districts:', error);
        throw error;
    }
};

/**
 * Lấy danh sách phường/xã theo mã quận
 */
export const getWards = async (districtCode) => {
    try {
        const response = await fetch(`${API_BASE}/d/${districtCode}?depth=2`);
        if (!response.ok) throw new Error('Không thể tải danh sách phường/xã');
        const data = await response.json();
        return data.wards || [];
    } catch (error) {
        console.error('Error fetching wards:', error);
        throw error;
    }
};
