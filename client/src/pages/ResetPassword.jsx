import React, { useState } from 'react';
import { Form, Input, Button } from 'antd';
import axios from 'axios';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const onFinish = async (values) => {
    if (!token) {
      toast.error('This reset link is invalid or has expired.');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_SERVER_URL}/api/users/reset-password`, {
        token,
        password: values.password,
      });
      toast.success('Password updated successfully. Please log in.');
      navigate('/my-account');
    } catch (err) {
      if (!err.response) {
        toast.error('Network error: unable to reach the server. Please try again.');
      } else {
        toast.error(err.response.data?.error || 'Could not reset password. Please try again.');
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
        <h2 className="text-2xl font-bold mb-2 text-center">Reset Password</h2>
        <p className="text-sm text-gray-500 text-center mb-6">Choose a new password for your account.</p>

        {!token ? (
          <div className="text-center space-y-4">
            <p className="text-red-500">This reset link is invalid or has expired.</p>
            <Link to="/forgot-password" className="text-blue-600! hover:underline">
              Request a new link
            </Link>
          </div>
        ) : (
          <Form name="reset" onFinish={onFinish} layout="vertical">
            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Please enter a new password!' },
                { min: 6, message: 'Password must be at least 6 characters.' },
              ]}
              hasFeedback
            >
              <Input.Password placeholder="New password" size="large" />
            </Form.Item>
            <Form.Item
              name="confirm"
              dependencies={['password']}
              hasFeedback
              rules={[
                { required: true, message: 'Please confirm your password!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) return Promise.resolve();
                    return Promise.reject(new Error('The two passwords do not match.'));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Confirm new password" size="large" />
            </Form.Item>
            <Form.Item className="mb-0">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full"
                size="large"
                style={{ backgroundColor: 'black', borderColor: 'black', color: '#fff', fontWeight: 500 }}
              >
                Update Password
              </Button>
            </Form.Item>
          </Form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
