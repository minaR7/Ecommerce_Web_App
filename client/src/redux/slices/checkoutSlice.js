// src/redux/slices/checkoutSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { notification } from 'antd';
import { clearCart } from './cartSlice';

// Async thunk for order checkout
export const placeOrder = createAsyncThunk(
  'checkout/placeOrder',
  async ({ validatedValues, paymentMethodId, cartItems, useDifferentBilling }, { dispatch, rejectWithValue }) => {
    try {
      const totalAmount = cartItems.reduce((acc, item) => acc + item.basePrice * item.quantity, 0) + 35;

      if (!paymentMethodId) {
        notification.error({
          message: 'Payment not completed',
          description: 'Please complete payment before confirming your order.',
        });
        return rejectWithValue('Payment not completed');
      }

      const payload = {
        user_info: {
          firstName: validatedValues.firstName,
          lastName: validatedValues.lastName,
          email: validatedValues.email,
          phone: validatedValues.phone,
        },
        shipping: {
          city: validatedValues.city,
          country: validatedValues.country,
          street: validatedValues.street,
          phone: validatedValues.phone,
        },
        billing: useDifferentBilling
          ? {
              city: validatedValues.billCity,
              country: validatedValues.billCountry,
              street: validatedValues.billStreet,
              phone: validatedValues.billPhone,
            }
          : {
              city: validatedValues.city,
              country: validatedValues.country,
              street: validatedValues.street,
              phone: validatedValues.phone,
            },
        paymentMethodId,
        totalAmount,
        cartItems,
      };

      const res = await axios.post(`${import.meta.env.VITE_BACKEND_SERVER_URL}/api/checkout`, { payload });

      if (res.status === 200) {
        notification.success({
          message: 'Order Placed',
          description: 'Your order has been placed successfully!',
        });

        // Clear cart on successful order
        dispatch(clearCart());
        // Navigate to homepage
        setTimeout(() => {
          navigate('/');
        }, 2000)
        return res.data;
      } else {
        return rejectWithValue('Unexpected response');
      }
    } catch (error) {
      const message =
        error?.response?.data?.message || 'Something went wrong. Please try again.';
      notification.error({
        message: 'Checkout Failed',
        description: message,
      });
      return rejectWithValue(message);
    }
  }
);

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState: {
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(placeOrder.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(placeOrder.fulfilled, (state) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default checkoutSlice.reducer;
