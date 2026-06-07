import { createSlice } from '@reduxjs/toolkit';

// Lấy giỏ hàng cũ từ localStorage lên
const initialState = {
    items: JSON.parse(localStorage.getItem('cart')) || [],
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const product = action.payload;
            const existingItem = state.items.find(item => item.id === product.id);

            if (existingItem) {
                existingItem.quantity += 1; // Đã có thì tăng số lượng
            } else {
                state.items.push({ ...product, quantity: 1 }); // Chưa có thì thêm mới
            }

            // Đồng bộ ngay lập tức xuống localStorage
            localStorage.setItem('cart', JSON.stringify(state.items));
        },
        // thêm các hàm: removeFromCart, clearCart,... ở đây
    },
});

export const { addToCart } = cartSlice.actions;
export default cartSlice.reducer;