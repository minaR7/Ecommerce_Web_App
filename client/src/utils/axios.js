// axios.js
import axios from 'axios';

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL:`${import.meta.env.VITE_BACKEND_SERVER_URL}` || 'http://localhost:3005/', // Update as needed
  withCredentials: true,
});

// Request Interceptor: Attach token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // or use Redux selector if preferred
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle errors globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or unauthorized
      console.warn('Unauthorized, redirecting to login...');
      // Optional: remove token and redirect
      localStorage.removeItem('token');
      window.location.href = '/login'; // or use Next.js router
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
