// axios.js
import axios from 'axios';
import { message } from 'antd';

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL:`${import.meta.env.VITE_BACKEND_SERVER_URL}` || 'https://elmaghrib.com/', // Update as needed
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
    console.log("AXIOS ERROR HANDLING: Error", error, error.response)  
    if (error && error.response)
    {
      const status = error.response.status;
      const errorMsg = error.response.data?.message || "Something went wrong";

      if( error.response.status === 404 && error.response.data?.message === "Cart is empty")
      {
        return;
      }
      if( error.response.status === 500 && error.response.data?.message === "Server error adding to cart")
      {
        return;
      }
      message.error(`${status}: ${errorMsg}`);
      
      if(error.response.status === 401)
      {
        // Token expired or unauthorized
        console.warn('Unauthorized, redirecting to login...');
        // Optional: remove token and redirect
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }  
    else if (error && error.code === "ERR_NETWORK") {
      // Token expired or unauthorized
      console.warn('NETWORK ERROR');
      message.error("Network error. Please check your connection or try again later.");
    }    
    if (error.response && error.response.status === 405) {
      // Token expired or unauthorized
      console.warn('Unauthorized, redirecting to login...');
    }


    return Promise.reject(error);
  }
);

export default axiosInstance;
