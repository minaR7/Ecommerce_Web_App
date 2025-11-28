import React from 'react';
import { Form, Input, Button } from 'antd';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();

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
        toast.success(`User, ${user.username || user.email} registered!`);
      navigate('/my-account'); // redirect to login after signup
       // Success toast
    } catch (err) {
      console.error('Signup failed:', err);
      toast.error(`Signup failed. ${err}`);
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
          >
            <Input type="email" placeholder="Email" />
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
