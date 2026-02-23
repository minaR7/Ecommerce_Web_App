// API Service for connecting to Express.js backend
const API_BASE_URL = `${(import.meta.env.VITE_BACKEND_SERVER_URL || 'http://elmaghrib.com')}/api`;

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
  // create: (data) => fetchApi('/categories', {
  //   method: 'POST',
  //   body: JSON.stringify(data),
  // }),
  create: (data) => {
    console.log(data)
    // const formData = new FormData();
  
    // formData.append('name', data.name);
    // formData.append('description', data.description);
  
    // if (data.image) {
    //   formData.append('image', data.image);
    // }
  
    return fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      // body: formData,
      body: data,
      credentials: 'include',
    }).then(async (res) => {
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed');
      return result;
    });
  },
  update: (id, data) => {
    if (data instanceof FormData) {
      const token = localStorage.getItem('authToken');
      return fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'PUT',
        body: data,
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: 'include',
      }).then(async (res) => {
        const result = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(result.error || result.message || 'Failed');
        return result;
      });
    }
    return fetchApi(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  delete: (id) => fetchApi(`/categories/${id}`, {
    method: 'DELETE',
  }),
  upload: (file) => {
    const form = new FormData();
    form.append('image', file);
    return fetch(`${API_BASE_URL}/categories/upload`, {
      method: 'POST',
      body: form,
      credentials: 'include',
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      return data;
    });
  }
};

// Subcategories API
export const subcategoriesApi = {
  getAll: () => fetchApi('/subcategories'),
  getByCategory: (categoryId) => fetchApi(`/subcategories/category/${categoryId}`),
  getById: (id) => fetchApi(`/subcategories/${id}`),
  create: (data) => {
    if (data instanceof FormData) {
      const token = localStorage.getItem('authToken');
      return fetch(`${API_BASE_URL}/subcategories`, {
        method: 'POST',
        body: data,
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: 'include',
      }).then(async (res) => {
        const result = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(result.error || result.message || 'Failed');
        return result;
      });
    }
    return fetchApi('/subcategories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update: (id, data) => {
    if (data instanceof FormData) {
      const token = localStorage.getItem('authToken');
      return fetch(`${API_BASE_URL}/subcategories/${id}`, {
        method: 'PUT',
        body: data,
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: 'include',
      }).then(async (res) => {
        const result = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(result.error || result.message || 'Failed');
        return result;
      });
    }
    return fetchApi(`/subcategories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  delete: (id) => fetchApi(`/subcategories/${id}`, {
    method: 'DELETE',
  }),
  upload: (file) => {
    const form = new FormData();
    form.append('image', file);
    return fetch(`${API_BASE_URL}/subcategories/upload`, {
      method: 'POST',
      body: form,
      credentials: 'include',
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      return data;
    });
  }
};

// Products API
export const productsApi = {
  getAll: () => fetchApi('/products'),
  getById: (id) => fetchApi(`/products/${id}`),
  create: (data) => {
    if (data instanceof FormData) {
      const token = localStorage.getItem('authToken');
      return fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        body: data,
        headers: {
           ...(token && { Authorization: `Bearer ${token}` }),
        }
      }).then(async res => {
         if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || err.message || 'Failed to create product');
         }
         return res.json();
      });
    }
    return fetchApi('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update: (id, data) => {
    if (data instanceof FormData) {
      const token = localStorage.getItem('authToken');
      return fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        body: data,
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        }
      }).then(async res => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || err.message || 'Failed to update product');
        }
        return res.json();
      });
    }
    return fetchApi(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  delete: (id) => fetchApi(`/products/${id}`, {
    method: 'DELETE',
  }),
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

// Orders API
export const ordersApi = {
  getAll: () => fetchApi('/orders'),
  getById: (id) => fetchApi(`/orders/${id}`),
  getStats: () => fetchApi('/orders/stats'),
  // getAll: () => fetchApi('/checkout'),
  // getById: (id) => fetchApi(`/checkout/${id}`),
  updateStatus: (id, status) => fetchApi(`/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
};

// Users API
export const usersApi = {
  getAll: () => fetchApi('/users'),
  getAdmins: () => fetchApi('/users?isAdmin=true'),
  getById: (id) => fetchApi(`/users/${id}`),
  create: (data) => fetchApi('/users/register', {
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
  getCustomers: () => fetchApi('/users/customers'),
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

// Pages API
export const pagesApi = {
  getAll: () => fetchApi('/pages'),
  getBySlug: (slug) => fetchApi(`/pages/${slug}`),
  create: (data) => fetchApi('/pages', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (slug, data) => fetchApi(`/pages/${slug}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchApi(`/sizes/${id}`, {
    method: 'DELETE',
  }),
};

export const notificationsApi = {
  getUnread: () => fetchApi('/notifications/unread'),
  markAsRead: (id) => fetchApi(`/notifications/${id}/read`, {
    method: 'POST',
  }),
  markAllAsRead: () => fetchApi('/notifications/mark-all-read', {
    method: 'POST',
  }),
};
