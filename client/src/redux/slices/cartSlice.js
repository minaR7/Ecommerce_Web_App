import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/axios';
import { getLoggedInUser } from '../../utils/getLoggedInUser';
import { notification } from 'antd';

//Add to Cart
export const addToCart = createAsyncThunk(
  'cart/add',
  async (payload, { rejectWithValue }) => {
    console.log('addTocart', payload)
    const user = getLoggedInUser();
    const finalPayload = {
      productId: payload.productId,
      variantId: payload.variant,
      quantity: payload.quantity,
      userId: user ? user.user_id : null,
    }
    if (user) {
      try {
        const res = await axios.post('/api/cart', finalPayload);
        return res.data;
      } catch (err) {
        notification.error({ message: 'Failed to add to cart.' });
        return rejectWithValue(err.response?.data || err.message);
      }
    } else {
      console.log('guest addTocart')
      try{
        let cart = JSON.parse(sessionStorage.getItem('guestCart') || '[]');
        cart.push(payload);
        sessionStorage.setItem('guestCart', JSON.stringify(cart));
        notification.success({ message: 'Added to cart (Guest)' });
        // Dispatch custom event
        window.dispatchEvent(new Event('guestCartUpdated'));
        return cart;
      } catch (err) {
        notification.error({ message: 'Failed to add to cart.' });
        return rejectWithValue(err.response?.data || err.message);
      }
    }
  }
);

// Get Cart items
export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const user = getLoggedInUser();
    const res = await axios.get(`/api/cart/${user.user_id}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

// cartSlice.js or cartSlice.ts
export const updateCartItem = createAsyncThunk(
  'cart/update',
  async ({ cartItemId, size, color, data }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/cart/${cartItemId}`, data);
      return { cartItemId, data };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Remove Cart Item
export const removeFromCart = createAsyncThunk(
  'cart/remove',
  async (productId, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/cart/${productId}`);
      return productId;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearCart: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchCart.pending, (state, action) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(removeFromCart.pending, (state, action) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        console.log(state, action)
        // if (!Array.isArray(action.payload)) {
        //   state.items.push(action.payload); // only for logged-in user
        // }
        state.cart = action.payload
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        const { cartItemId, data } = action.payload;
        const index = state.items.findIndex(item => item.id === cartItemId);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...data };
        }
      });
      
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;
