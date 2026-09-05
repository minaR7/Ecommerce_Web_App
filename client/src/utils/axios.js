// axios.js
import axios from 'axios';
import { message } from 'antd';

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL:`${import.meta.env.VITE_BACKEND_SERVER_URL}` || 'https://elmaghrib.com/', // Update as needed
  withCredentials: true,
});

const clearClientSession = () => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  } catch {}
};

// Same burst-guard as the admin interceptor — prevents the Chrome
// "Throttling navigation to prevent hanging" warning when many parallel
// requests 401 at once and each tries to rewrite window.location.
let clientRedirectingToAccount = false;

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
        // Token expired or unauthorized — or password-changed logout-everywhere
        clearClientSession();
        if (!clientRedirectingToAccount) {
          clientRedirectingToAccount = true;
          setTimeout(() => { clientRedirectingToAccount = false; }, 2000);
          const onAccountPage = window.location.pathname === '/my-account';
          if (!onAccountPage) {
            console.warn('Unauthorized, redirecting to my-account...');
            window.location.replace('/my-account');
          }
        }
        return Promise.reject(error);
      }
      message.error(`${status}: ${errorMsg}`);
    }  
    else if (error && error.code === "ERR_NETWORK") {
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
