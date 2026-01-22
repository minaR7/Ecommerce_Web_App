import React, { useEffect } from 'react';
import { Form, Input, Button, Card } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AdminLayout } from '../components/layout/AdminLayout';

const Login = () => {

  const navigate = useNavigate();
  
  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      const user = raw ? JSON.parse(raw) : null;
      if (user && user.is_admin) navigate('/', { replace: true });
    } catch {}
  }, [navigate]);

  const onFinish = async (values) => {
    try {
      const loginRes = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/login`, {
        identifier: values.username,
        password: values.password,
      });

      const user = loginRes.data.data;
      if (!user?.is_admin) {
        toast.error('Access denied: not an admin');
        return;
      }
      localStorage.setItem('user', JSON.stringify(user));

      // Success toast
      toast.success(`Welcome back, ${user.username || user.email}!`);

      navigate('/', { replace: true });
      toast.success('Logged in successfully!');

    } catch (err) {
      console.error('Login failed:', err);
      toast.error('Invalid username or password. Please try again.');
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
            <Button type="primary" htmlType="submit" className="w-full" style={{ fontWeight: 500 }}>
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
