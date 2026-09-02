import React, { useState } from 'react';
import { Form, Input, Button } from 'antd';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  // const onFinish = async (values) => {
  //   setLoading(true);
  //   try {
  //     await axios.post(`${import.meta.env.VITE_BACKEND_SERVER_URL}/api/users/forgot-password`, {
  //       email: values.email,
  //     });
  //     setSent(true);
  //     toast.success('If that email is registered, a reset link has been sent.');
  //   } catch (err) {
  //     if (!err.response) {
  //       toast.error('Network error: unable to reach the server. Please try again.');
  //     } else {
  //       toast.error(err.response.data?.error || 'Something went wrong. Please try again.');
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const onFinish = async (values) => {
  console.log('1. onFinish called');
  console.log('2. values:', values);
  console.log(
    '3. Backend URL:',
    import.meta.env.VITE_BACKEND_SERVER_URL
  );

  setLoading(true);

  try {
    console.log('4. About to make POST request');

    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_SERVER_URL}/api/users/forgot-password`,
      {
        email: values.email,
      }
    );

    console.log('5. POST completed:', response);

    setSent(true);

    toast.success(response.message);
  } catch (err) {
    console.error('6. Axios error:', err);

    if (!err.response) {
      toast.error(
        'Network error: unable to reach the server. Please try again.'
      );
    } else {
      toast.error(
        err.response.data?.error ||
          'Something went wrong. Please try again.'
      );
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex items-center justify-center px-4 mt-12">
      <div
        className="p-8 rounded-2xl w-full max-w-md"
        style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.08)', backgroundColor: 'rgba(132, 152, 176, 0.08)' }}
      >
        <h2 className="text-2xl font-bold mb-2 text-center">Forgot Password</h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Enter your account email and we'll send you a link to reset your password.
        </p>

        {sent ? (
          <div className="text-center space-y-4">
            <p className="text-gray-700">
              Check your inbox for the reset link. It's valid for 30 minutes.
            </p>
            <Link to="/my-account" className="text-blue-600! hover:underline">
              Back to login
            </Link>
          </div>
        ) : (
          <Form name="forgot" onFinish={onFinish} layout="vertical">
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please enter your email!' },
                { type: 'email', message: 'Please enter a valid email!' },
              ]}
            >
              <Input placeholder="Email address" size="large" />
            </Form.Item>
            <Form.Item className="mb-3">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full"
                size="large"
                style={{ backgroundColor: 'black', borderColor: 'black', color: '#fff', fontWeight: 500 }}
              >
                Send Reset Link
              </Button>
            </Form.Item>
            <div className="text-center text-sm">
              <Link to="/my-account" className="text-blue-600! hover:underline">
                Back to login
              </Link>
            </div>
          </Form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
