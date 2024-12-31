import { createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

const initialState = {
    items: JSON.parse(localStorage.getItem('cartItems')) || [],
    totalQuantity: JSON.parse(localStorage.getItem('cartTotalQuantity')) || 0,
    totalPrice: JSON.parse(localStorage.getItem('cartTotalPrice')) || 0,
};

const saveToLocalStorage = (state) => {
    localStorage.setItem('cartItems', JSON.stringify(state.items));
    localStorage.setItem('cartTotalQuantity', JSON.stringify(state.totalQuantity));
    localStorage.setItem('cartTotalPrice', JSON.stringify(state.totalPrice));
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const existingItem = state.items.find((item) => item.ProductID === action.payload.ProductID);

            if (existingItem) {
                if (existingItem.quantity < action.payload.Stock) {
                    existingItem.quantity += 1;
                    existingItem.totalPrice += action.payload.Price;
                    state.totalQuantity += 1;
                    state.totalPrice += Number(action.payload.Price);
                    saveToLocalStorage(state);
                    toast.success('Item added to cart');
                } else {
                    toast.error('Cannot add more than available stock');
                }
            } else {
                if (action.payload.Stock > 0) {
                    state.items.push({ ...action.payload, quantity: 1, totalPrice: action.payload.Price });
                    state.totalQuantity += 1;
                    state.totalPrice += Number(action.payload.Price);
                    saveToLocalStorage(state);
                    toast.success('Item added to cart');
                } else {
                    toast.error('Out of stock');
                }
            }
        },
        decrementQuantity: (state, action) => {
            const existingItem = state.items.find((item) => item.ProductID === action.payload.ProductID);
            if (existingItem) {
                existingItem.quantity -= 1;
                existingItem.totalPrice -= Number(action.payload.Price);
                state.totalQuantity -= 1;
                state.totalPrice -= Number(action.payload.Price);
                if (existingItem.quantity === 0) {
                    state.items = state.items.filter((item) => item.ProductID !== action.payload.ProductID);
                }
                saveToLocalStorage(state);
                toast.success('Item quantity decreased');
            }
        },
        clearCart: (state) => {
            state.items = [];
            state.totalQuantity = 0;
            state.totalPrice = 0;
            saveToLocalStorage(state);
            toast.success('Cart cleared');
        },
        removeFromCart: (state, action) => {
            const existingItem = state.items.find((item) => item.ProductID === action.payload.ProductID);
            if (existingItem) {
              state.totalQuantity -= Number(existingItem.quantity);
              state.totalPrice -= Number(existingItem.totalPrice);
              state.items = state.items.filter((item) => item.ProductID !== action.payload.ProductID);
              saveToLocalStorage(state);
              toast.success('Item removed from cart');
            }
          },
    },
});

export const { addToCart, removeFromCart, decrementQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;