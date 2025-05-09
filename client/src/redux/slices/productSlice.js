import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Base URL for API
const API_URL = `${import.meta.env.VITE_BACKEND_SERVE_URL}/api/products`;

// Thunks (async actions)
export const getAllProducts = createAsyncThunk(
  'products/getAllProducts',
  async () => {
   try{
    const response = await axios.get(API_URL);
    return response.data;
   }
   catch(err)
   {
    console.log("Axios error:", err.message, err.response?.data)
    
   }
  }
);

export const getSearchProduct = createAsyncThunk(
  'products/getSearchProduct',
  async (searchTerm) => {
    const response = await axios.get(`${API_URL}?search=${searchTerm}`);
    return response.data;
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (productId) => {
   try{
    const response = await axios.get(`${API_URL}/${productId}`);
    return response.data;
   }
  catch(err)
  {
   console.log("Axios error:", err.message, err.response?.data)
  }}
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (productId) => {
    const response = await axios.delete(`${API_URL}/${productId}`);
    return productId; // Return the id for deletion in the state
  }
);

export const putProduct = createAsyncThunk(
  'products/putProduct',
  async (product) => {
    const response = await axios.put(`${API_URL}/${product.id}`, product);
    return response.data;
  }
);

// Initial state
const initialState = {
  products: [],
  selectedProduct: null,
  loading: false,
  error: null,
  searchQuery: '',
};

// Create the slice
const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(getAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(getSearchProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSearchProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(getSearchProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter((product) => product.id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(putProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(putProduct.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.products.findIndex((product) => product.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(putProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

// Actions
export const { setSearchQuery } = productSlice.actions;

// Reducer
export default productSlice.reducer;
