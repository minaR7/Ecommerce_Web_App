import React, { useState } from 'react';
import { Form, Input, Button } from 'antd';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Signup = () => {
  const navigate = useNavigate();
  const [emailStatus, setEmailStatus] = useState({
    checking: false,
    message: '',
    status: null,
  });

  const handleEmailBlur = async (e) => {
    const value = e.target.value.trim();
    if (!value) {
      setEmailStatus({ checking: false, message: '', status: null });
      return;
    }
    setEmailStatus({ checking: true, message: '', status: null });
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_SERVER_URL}/api/users/check-email`,
        { params: { email: value } }
      );
      const { syntaxValid, deliverable, available } = res.data || {};
      let status = 'ok';
      let message = '';
      if (!syntaxValid) {
        status = 'error';
        message = 'Invalid email format';
      } else if (!deliverable) {
        status = 'warning';
        message = 'Email domain does not appear to accept mail';
      } else if (!available) {
        status = 'error';
        message = 'Email is already registered';
      } else {
        status = 'ok';
        message = 'Email is valid and available';
      }
      setEmailStatus({ checking: false, message, status });
    } catch (err) {
      console.error('Email check failed:', err);
      setEmailStatus({
        checking: false,
        message: 'Could not verify email right now',
        status: 'error',
      });
    }
  };

  const onFinish = async (values) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_SERVER_URL}/api/users/register`,
        {
          username: values.username,
          email: values.email,
          password: values.password,
        }
      );

      console.log('Signup success:', res.data);
      toast.success('User registered successfully');
      navigate('/my-account');
    } catch (err) {
      console.error('Signup failed:', err);
      const msg = err.response?.data?.error || 'Signup failed';
      toast.error(msg);
    }
  };

  return (
    <div className="flex items-center justify-center mt-12">
      <div
        className="p-8 rounded-lg w-full max-w-sm"
        style={{
          boxShadow: '8px 5px 6px lightgray',
          backgroundColor: 'rgba(132, 152, 176, 0.1)',
        }}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>

        <Form name="signup" onFinish={onFinish} layout="vertical">
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input placeholder="Username" />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[{ required: true, message: 'Please input your email!' }]}
            validateStatus={
              emailStatus.status === 'ok'
                ? 'success'
                : emailStatus.status === 'error'
                ? 'error'
                : emailStatus.status === 'warning'
                ? 'warning'
                : undefined
            }
            help={emailStatus.checking ? 'Checking email...' : emailStatus.message || undefined}
          >
            <Input type="email" placeholder="Email" onBlur={handleEmailBlur} />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full"
              style={{
                backgroundColor: 'black',
                borderColor: 'black',
                color: 'white',
                fontWeight: '500',
              }}
            >
              Sign Up
            </Button>
          </Form.Item>

          {/* Back to login */}
          <div className="link-text text-sm text-center">
            Already have an account? <Link to="/my-account">Login</Link>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Signup;
