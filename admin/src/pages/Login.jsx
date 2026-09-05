import React, { useEffect } from 'react';
import { Form, Input, Card } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AdminLayout } from '../components/layout/AdminLayout';
import { AppButton } from '../components/AppButton';

const Login = () => {

  const navigate = useNavigate();
  
  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      const user = raw ? JSON.parse(raw) : null;
      const hasToken = !!localStorage.getItem('token');
      // Only auto-bounce if BOTH the admin user marker AND a token exist.
      // When the session is revoked (401) we clear both AND the user object,
      // so this check reliably prevents the "/login ⇄ /" redirect loop
      // that Chrome flags as "Throttling navigation to prevent hanging".
      if (user && user.is_admin && hasToken) navigate('/', { replace: true });
    } catch {}
  }, [navigate]);

  const onFinish = async (values) => {
    try {
      const loginRes = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/login`,
        {
          identifier: values.username,
          password: values.password,
        },
        {
          headers: { 'x-admin-request': 'true' },
        }
      );

      const user = loginRes.data.data;
      const token = loginRes.data.token;
      if (!user?.is_admin) {
        toast.error('Access denied: not an admin');
        return;
      }
      localStorage.setItem('user', JSON.stringify(user));
      if (token) {
        localStorage.setItem('token', token);
      }

      // Success toast
      toast.success('Logged in successfully!');
      navigate('/', { replace: true });

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
        'Admin access only': 'Access denied: this account is not an admin.',
        'User is not registered': 'This account is not registered.',
        'Email is not deliverable': 'That email address is not deliverable.',
      };

      toast.error(friendly[serverMsg] || serverMsg || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #050505 100%)' }}>
      <Card
        className="w-full max-w-sm"
        style={{
          background: '#111111',
          borderColor: '#1f1f1f',
        }}
      >
        <h2 className="text-foreground text-2xl font-bold mb-6 text-center">Admin Login</h2>
        <Form name="login" onFinish={onFinish} layout="vertical">
          <Form.Item name="username" rules={[{ required: true }]}>
            <Input placeholder="Username or Email" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true }]}>
            <Input.Password placeholder="Password" />
          </Form.Item>
          <Form.Item>
            <AppButton type="primary" htmlType="submit" className="w-full" style={{ backgroundColor: 'white', fontWeight: 500 }}>
              Login
            </AppButton>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
