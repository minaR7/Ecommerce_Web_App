// axios.js
import axios from 'axios';
import { message } from 'antd';

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL:`${import.meta.env.VITE_BACKEND_SERVER_URL}` || 'http://api.elmaghrib.com/', // Update as needed
  withCredentials: true,
});

const clearAdminSession = () => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  } catch {}
};

// Prevent a burst of parallel failing requests from firing 401 on top of each
// other and spamming `window.location = '/login'` hundreds of times — that's
// exactly what triggers Chrome's "Throttling navigation" crash protection.
let axiosRedirectingToLogin = false;

// Request Interceptor: Attach token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
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
      if(error.response.status === 401)
      {
        clearAdminSession();
        if (!axiosRedirectingToLogin) {
          axiosRedirectingToLogin = true;
          setTimeout(() => { axiosRedirectingToLogin = false; }, 2000);
          const onLoginPage = window.location.pathname === '/login';
          if (!onLoginPage) {
            console.warn('Unauthorized, redirecting to login...');
            window.location.replace('/login');
          }
        }
        return Promise.reject(error);
      }
      message.error(`${status}: ${errorMsg}`);
    }  
    else if (error && error.code === "ERR_NETWORK") {
      // Token expired or unauthorized
      console.warn('NETWORK ERROR');
      message.error("Network error. Please check your connection or try again later.");
    }    
    if (error.response && error.response.status === 405) {
      console.warn('Method not allowed');
    }


    return Promise.reject(error);
  }
);

export default axiosInstance;
