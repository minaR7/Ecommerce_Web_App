import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/axios';
import { getLoggedInUser } from '../../utils/getLoggedInUser';
import { notification } from 'antd';

//Add to Cart
export const addToCart = createAsyncThunk(
  'cart/add',
  async (payload, { getState, dispatch, rejectWithValue }) => {
    console.log('addTocart', payload)
    const user = getLoggedInUser();
    const finalPayload = {
      productId: payload.productId,
      variantId: payload.variant,
      quantity: payload.quantity,
      userId: user ? user.user_id : null,
    }
    if (user) {
        const { cart } = getState(); // Access cart from Redux store
        console.log(cart)
        const existingItem = cart.items?.find(
          item =>
            item.productId === finalPayload.productId &&
            // item.variantId === finalPayload.variantId &&
            item.size === payload.size &&
            item.color === payload.color
        );

        if (existingItem) {
                  console.log("Duplicate found")
          // Duplicate found — update instead of add
          const newQuantity = existingItem.quantity + finalPayload.quantity;

          await dispatch(updateCartItem({
            cartItemId: existingItem.cart_item_id,
            productId: finalPayload.productId,
            size: payload.size,
            color: payload.color,
            quantity: newQuantity
          }));

          notification.success({ message: 'Cart item updated' });
          return;
        }
      try {
        const res = await axios.post('/api/cart/add', finalPayload);
        window.dispatchEvent(new Event('cartUpdated'));
        return res.data;
      } catch (err) {
        notification.error({ message: 'Failed to add to cart.' });
        return rejectWithValue(err.response?.data || err.message);
      }
    } else {
      console.log('guest addTocart')
      try{
        let cart = JSON.parse(sessionStorage.getItem('guestCart') || '[]');

        const itemIndex = cart.findIndex(
            item =>
                item.productId === payload.productId &&
                item.size === payload.size &&
                item.color === payload.color
        );

        if (itemIndex > -1) {
            // Item exists, increase quantity
            cart[itemIndex].quantity += payload.quantity;
        } 
        else {
            // Add new item
            cart.push(payload);
        }

        sessionStorage.setItem('guestCart', JSON.stringify(cart));
        notification.success({ message: 'Added to cart' });
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
  async ({ cartItemId, productId, size, color, quantity}, { rejectWithValue }) => {
    const payload = {
      productId, size, color, quantity
    }
    try {
      const res = await axios.put(`/api/cart/${cartItemId}`, payload);
        window.dispatchEvent(new Event('cartUpdated'));
      return { cartItemId, data };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Remove Cart Item
export const removeFromCart = createAsyncThunk(
  'cart/remove',
  async (cart_item_id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/cart/${cart_item_id}`);
        window.dispatchEvent(new Event('cartUpdated'));
      return cart_item_id;
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
    isDrawerOpen: false,
  },
  reducers: {
    clearCart: (state) => {
      state.items = [];
    },
    openDrawer: (state) => {
      state.isDrawerOpen = true;
    },
    closeDrawer: (state) => {
      state.isDrawerOpen = false;
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

export const { clearCart,  openDrawer, closeDrawer } = cartSlice.actions;
export default cartSlice.reducer;