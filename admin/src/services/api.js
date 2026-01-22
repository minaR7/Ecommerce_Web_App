// API Service for connecting to Express.js backend
const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api` || 'http://localhost:3005/api';

// Generic fetch wrapper with error handling
async function fetchApi(endpoint, options) {
  const token = localStorage.getItem('authToken');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options?.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Categories API
export const categoriesApi = {
  getAll: () => fetchApi('/categories'),
  getById: (id) => fetchApi(`/categories/${id}`),
  create: (data) => fetchApi('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchApi(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchApi(`/categories/${id}`, {
    method: 'DELETE',
  }),
};

// Subcategories API
export const subcategoriesApi = {
  getAll: () => fetchApi('/subcategories'),
  getByCategory: (categoryId) => fetchApi(`/subcategories/category/${categoryId}`),
  getById: (id) => fetchApi(`/subcategories/${id}`),
  create: (data) => fetchApi('/subcategories', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchApi(`/subcategories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchApi(`/subcategories/${id}`, {
    method: 'DELETE',
  }),
};

// Products API
export const productsApi = {
  getAll: () => fetchApi('/products'),
  getById: (id) => fetchApi(`/products/${id}`),
  create: (data) => fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    body: data,
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken') || ''}`,
    },
  }).then(res => res.json()),
  update: (id, data) => fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'PUT',
    body: data,
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken') || ''}`,
    },
  }).then(res => res.json()),
  delete: (id) => fetchApi(`/products/${id}`, {
    method: 'DELETE',
  }),
};

// Orders API
export const ordersApi = {
  getAll: () => fetchApi('/orders'),
  getById: (id) => fetchApi(`/orders/${id}`),
  // getAll: () => fetchApi('/checkout'),
  // getById: (id) => fetchApi(`/checkout/${id}`),
  updateStatus: (id, status) => fetchApi(`/checkout/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
};

// Users API
export const usersApi = {
  getAll: () => fetchApi('/users'),
  getById: (id) => fetchApi(`/users/${id}`),
  create: (data) => fetchApi('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchApi(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchApi(`/users/${id}`, {
    method: 'DELETE',
  }),
};

// Coupons API
export const couponsApi = {
  getAll: () => fetchApi('/coupons'),
  getById: (id) => fetchApi(`/coupons/${id}`),
  create: (data) => fetchApi('/coupons', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchApi(`/coupons/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchApi(`/coupons/${id}`, {
    method: 'DELETE',
  }),
  validate: (code) => fetchApi(`/coupons/validate/${code}`),
};

// Colors API
export const colorsApi = {
  getAll: () => fetchApi('/colors'),
  getById: (id) => fetchApi(`/colors/${id}`),
  create: (data) => fetchApi('/colors', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchApi(`/colors/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchApi(`/colors/${id}`, {
    method: 'DELETE',
  }),
};

// Sizes API
export const sizesApi = {
  getAll: () => fetchApi('/sizes'),
  getById: (id) => fetchApi(`/sizes/${id}`),
  create: (data) => fetchApi('/sizes', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchApi(`/sizes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchApi(`/sizes/${id}`, {
    method: 'DELETE',
  }),
};

// Shipping API
export const shippingApi = {
  getAll: () => fetchApi('/shipping'),
  getByCountry: (country) => fetchApi(`/shipping/${country}`),
  create: (data) => fetchApi('/shipping', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchApi(`/shipping/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchApi(`/shipping/${id}`, {
    method: 'DELETE',
  }),
};
