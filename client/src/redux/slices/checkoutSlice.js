// src/redux/slices/checkoutSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { notification } from 'antd';
import { clearCart } from './cartSlice';
// import { useNavigate } from 'react-router-dom';

// Async thunk for order checkout
export const placeOrder = createAsyncThunk(
  'checkout/placeOrder',
  async ({ validatedValues,  paymentIntentId, cartItems, discount, useDifferentBilling }, { dispatch, rejectWithValue }) => {

    // const navigate = useNavigate();
    try {
      // const totalAmount = cartItems.reduce((acc, item) => acc + item.basePrice * item.quantity, 0) + 35;
      // Calculate subtotal (items total)
      const subtotal = cartItems.reduce((acc, item) => acc + item.basePrice * item.quantity, 0);
      const shippingCharges = 35;
      // Apply discount if any
      let discountedSubtotal = subtotal;
      if (discount > 0) {
        discountedSubtotal = subtotal - (subtotal * discount) / 100;
      }
      // Final total after discount
      const totalAmount = discountedSubtotal + shippingCharges;

      if (!paymentIntentId) {
        notification.error({
          message: 'Payment not confirmed',
          description: 'Please confirm payment before placing your order.',
        });
        return rejectWithValue('Payment not completed');
      }

      // if (!paymentMethodId) {
        // message: 'Payment not completed',
        // description: 'Please complete payment before confirming your order.',
      //   });
      //   return rejectWithValue('Payment not completed');
      // }

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
        paymentIntentId,
        totalAmount: totalAmount,
        cartItems,
      };
      // http://localhost:3005
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_SERVER_URL}/api/checkout`, { payload });

      if (res.status === 200) {
        const stockMessages = res.data.stockMessages;

        notification.success({
          message: 'Order Placed',
          description: stockMessages && stockMessages.length > 0
            ? stockMessages.join(', ')
            : 'Your order has been placed successfully!',
        });
        // Clear cart on successful order
        dispatch(clearCart());
        // Navigate to homepage
        // setTimeout(() => {
        //   navigate('/');
        // }, 2000)
        return res.data;
      } else {
        return rejectWithValue('Unexpected response');
      }
    } catch (error) {
      console.log(error)
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
