import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/axios';
import { getLoggedInUser } from '../../utils/getLoggedInUser';
import { notification } from 'antd';
import { toast } from 'react-toastify';

//Add to Cart
export const addToCart = createAsyncThunk(
  'cart/add',
  async (payload, { getState, dispatch, rejectWithValue }) => {
    console.log('addTocart', payload)
    const user = getLoggedInUser();
    const MAX_PER_VARIANT = 10;

    const userRequestedQty = Number(payload.quantity) || 1;

    if (user) {
        const finalPayload = {
          productId: payload.productId,
          variantId: payload.variant_id,
          quantity: payload.quantity,
          userId: user ? user.user_id : null,
        }
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
          // Duplicate found — increase existing qty, capped at MAX_PER_VARIANT
          const currentQty = Number(existingItem.quantity) || 0;
          const uncapped = currentQty + userRequestedQty;
          const newQuantity = Math.min(MAX_PER_VARIANT, uncapped);
          const actuallyAdded = newQuantity - currentQty;

          if (actuallyAdded <= 0) {
            toast.error(`You've already reached the max of ${MAX_PER_VARIANT} items for this product.`);
            return rejectWithValue(`Already at max ${MAX_PER_VARIANT}`);
          }

          if (uncapped > MAX_PER_VARIANT) {
            toast.warning(`Only ${actuallyAdded} more item${actuallyAdded === 1 ? '' : 's'} were added (max ${MAX_PER_VARIANT} per product).`);
          }

          // Update the existing cart item with the *new total quantity*
          const resultAction = await dispatch(updateCartItem({
            cartItemId: existingItem.cart_item_id,
            productId: finalPayload.productId,
            variantId: payload.variant_id,
            size: payload.size,
            color: payload.color,
            quantity: newQuantity
          }));

          if (updateCartItem.rejected.match(resultAction)) {
            return rejectWithValue(resultAction.payload || resultAction.error?.message);
          }
          return { merged: true, newQuantity, cart_item_id: existingItem.cart_item_id };
        }

        // No existing match — cap the initial add just in case
        const firstQty = Math.min(MAX_PER_VARIANT, userRequestedQty);
        if (firstQty !== userRequestedQty) {
          toast.warning(`Only ${firstQty} item${firstQty === 1 ? '' : 's'} were added (max ${MAX_PER_VARIANT} per product).`);
        }
      try {
        const res = await axios.post(`${import.meta.env.VITE_BACKEND_SERVER_URL}/api/cart/add`, { ...finalPayload, quantity: firstQty });
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
            // Item exists — increase quantity, capped at MAX_PER_VARIANT
            const currentQty = Number(cart[itemIndex].quantity) || 0;
            const uncapped = currentQty + userRequestedQty;
            const newQuantity = Math.min(MAX_PER_VARIANT, uncapped);
            const actuallyAdded = newQuantity - currentQty;

            if (actuallyAdded <= 0) {
              toast.error(`You've already reached the max of ${MAX_PER_VARIANT} items for this product.`);
              return rejectWithValue(`Already at max ${MAX_PER_VARIANT}`);
            }

            if (uncapped > MAX_PER_VARIANT) {
              toast.warning(`Only ${actuallyAdded} more item${actuallyAdded === 1 ? '' : 's'} were added (max ${MAX_PER_VARIANT} per product).`);
            }
            cart[itemIndex].quantity = newQuantity;
        }
        else {
            // Add new item (capped)
            const firstQty = Math.min(MAX_PER_VARIANT, userRequestedQty);
            if (firstQty !== userRequestedQty) {
              toast.warning(`Only ${firstQty} item${firstQty === 1 ? '' : 's'} were added (max ${MAX_PER_VARIANT} per product).`);
            }
            cart.push({ ...payload, quantity: firstQty });
        }

        sessionStorage.setItem('guestCart', JSON.stringify(cart));
        // notification.success({ message: 'Added to cart' });
        // Dispatch custom event
        window.dispatchEvent(new Event('guestCartUpdated'));
        window.dispatchEvent(new Event('cartUpdated'));
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
    if (user){
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_SERVER_URL}/api/cart/${user.user_id}`);
      return res.data;
    }
    else{
      const cartItem = JSON.parse(sessionStorage.getItem('guestCart') || []);
      console.log(cartItem)
      return cartItem
    }
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
      const res = await axios.put(`${import.meta.env.VITE_BACKEND_SERVER_URL}/api/cart/${cartItemId}`, payload);
        window.dispatchEvent(new Event('cartUpdated'));
        toast.success('Cart updated successfully!');

      return { cartItemId, quantity, data: res.data, };
    } 
    catch (err) {
      console.log(err)
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update cart';
      toast.error(errorMsg);
      console.log(errorMsg)
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
        state.items = Array.isArray(action.payload) ? action.payload : [];
        state.loading = false;
        state.error = null;
        console.log(state)
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.items = [];
        state.error = action.error.message;
      })
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        const removedId = typeof action.payload === 'object' ? action.payload?.cart_item_id : action.payload;
        state.items = state.items.filter((item) => Number(item.cart_item_id) !== Number(removedId));
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        console.log(state, action);
        // If the thunk merged with an existing item (capped at 10 etc.),
        // fetchCart / custom events refresh the store from the server.
        // For brand-new logged-in item inserts that return one object, push it.
        const p = action.payload;
        if (p && !Array.isArray(p) && !p.merged && typeof p === 'object') {
          if (p.cart_item_id != null) {
            const already = state.items.find(i => Number(i.cart_item_id) === Number(p.cart_item_id));
            if (!already) state.items.push(p);
          }
        }
        state.loading = false;
        state.error = null;
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
        const { cartItemId, quantity } = action.payload || {};
        const index = state.items.findIndex(item => Number(item.cart_item_id) === Number(cartItemId));
        if (index !== -1) {
          state.items[index] = {
            ...state.items[index],
            ...(quantity != null ? { quantity } : {})
          };
        }
      });
      
  },
});

export const { clearCart,  openDrawer, closeDrawer } = cartSlice.actions;
export default cartSlice.reducer;