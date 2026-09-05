import React from 'react';
import { Form, Input, Checkbox, Button } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { fetchCart } from '../redux/slices/cartSlice';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const MyAccount = () => {

  const navigate = useNavigate();
   const dispatch = useDispatch();

  const onFinish = async (values) => {
    try {
      console.log('Received values:', values);
      const loginRes = await axios.post(`${import.meta.env.VITE_BACKEND_SERVER_URL}/api/users/login`, {
        identifier: values.username,
        password: values.password,
      });

      const user = loginRes.data.data
      const token = loginRes.data.token;
      localStorage.setItem('user', JSON.stringify(user));
      console.log(loginRes)
      if (token) localStorage.setItem('token', token);
      
      if (user?.is_admin) {
        const adminBase = import.meta.env.VITE_ADMIN_BASE_URL || 'http://admin.elmaghrib.com';
        window.location.href = adminBase;
        return;
      }

      // Notify other componentsthat user logged in
      window.dispatchEvent(new Event('user-login'));
      
       const guestCart = JSON.parse(sessionStorage.getItem('guestCart')) || [];
      if (guestCart.length > 0) {
        await axios.post(`${import.meta.env.VITE_BACKEND_SERVER_URL}/api/cart/add/bulk`, {
          userId: user.user_id,
          cartItems: guestCart
        });
        sessionStorage.removeItem('guestCart');
      }
      // const newCart = dispatch(fetchCart(user.user_id));
      // console.log(newCart)

      await dispatch(fetchCart(user.user_id));

      // Success toast
      toast.success('Logged in successfully!');
      navigate('/');

    } catch (err) {
      console.error('Login failed:', err);

      // No response at all → network / server unreachable
      if (!err.response) {
        toast.error('Network error: unable to reach the server. Check your connection and try again.');
        return;
      }

      const status = err.response.status;
      const serverMsg = err.response.data?.error || err.response.data?.message;

      if (status >= 500) {
        toast.error('Server error. Please try again in a moment.');
        return;
      }

      // Map known backend messages to clear, user-facing text
      const friendly = {
        'Invalid credentials': 'Wrong credentials — check your username/email and password.',
        'User is not registered': 'This account is not registered.',
        'Email is not deliverable': 'That email address is not deliverable.',
      };

      toast.error(friendly[serverMsg] || serverMsg || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center px-4 mt-12">
      <div className="p-8 rounded-2xl w-full max-w-md" style={{
                  boxShadow: '0 10px 30px rgba(0,0,0,0.08)', backgroundColor: "rgba(132, 152, 176, 0.08)"}}>
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <Form name="login" onFinish={onFinish} layout="vertical">
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your username or email!' }]}
          >
            <Input placeholder="Username or Email" size="large" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password placeholder="Password" size="large" />
          </Form.Item>

          {/* Forgot password — right-aligned under the password field */}
          <div className="flex justify-end -mt-2 mb-4">
            <Link to="/forgot-password" className="text-sm text-blue-600! hover:underline">
              Forgot password?
            </Link>
          </div>

          <Form.Item className="mb-3">
            <Button type="primary" htmlType="submit" size="large" className="w-full" style={{ backgroundColor: 'black', borderColor: 'black', color: "white", fontWeight: "500"}}>
              Login
            </Button>
          </Form.Item>

          <p className="text-center text-sm text-gray-600 mb-0">
            Don’t have an account?{' '}
            <Link to="/register" className="text-blue-600! font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </Form>
      </div>
    </div>
  );
};

export default MyAccount;
