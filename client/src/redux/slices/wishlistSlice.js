import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/axios';
import { getLoggedInUser } from '../../utils/getLoggedInUser';
import { notification } from 'antd';

export const addToWishlist = createAsyncThunk(
  'wishlist/add',
  async ({ product, variant, navigate }, { rejectWithValue }) => {
    const user = getLoggedInUser();
    if (user) {
      try {
        const res = await axios.post(`${import.meta.env.VITE_BACKEND_SERVER_URL}/api/wishlist`, { productId: product.id });
        notification.success({ message: 'Added to wishlist!' });
        return res.data;
      } catch (err) {
        return rejectWithValue(err.response?.data || err.message);
      }
    } else {
      notification.warning({
        message: 'Login Required',
        description: 'Only registered users can add to wishlist.',
      });
      navigate('/login');
    }
  }
);

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async () => {
  const res = await axios.get(`${import.meta.env.VITE_BACKEND_SERVER_URL}/api/wishlist`);
  return res.data;
});

export const removeFromWishlist = createAsyncThunk('wishlist/remove', async (productId) => {
  await axios.delete(`${import.meta.env.VITE_BACKEND_SERVER_URL}/api/wishlist/${productId}`);
  return productId;
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        if (action.payload) state.items.push(action.payload);
      });
  },
});

export default wishlistSlice.reducer;
