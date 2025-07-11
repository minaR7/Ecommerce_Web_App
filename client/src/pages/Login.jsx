// // pages/my-account.jsx
// import { Form, Input, Button } from 'antd';

// const MyAccount = () => {
//     const onFinish = (values) => {
//         console.log('Login info:', values);
//     };

//     return (
//         <div className="flex justify-center items-center bg-gray-100"> 
//         {/* h-screen  */}
//             <div className="mt-2 px-8 mt-8 rounded-lg w-full"> 
//             {/* bg-white p-8 shadow-lg rounded-lg w-full max-w-md */}
//                 <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
//                 <Form
//                     name="login"
//                     initialValues={{ remember: true }}
//                     onFinish={onFinish}
//                     layout="vertical"
//                     className='flex flex-col px-8'
//                 >
//                     <Form.Item
//                         label="Email"
//                         name="email"
//                         rules={[{ required: true, message: 'Please input your email!' }]}
//                     >
//                         <Input type="email" />
//                     </Form.Item>

//                     <Form.Item
//                         label="Password"
//                         name="password"
//                         rules={[{ required: true, message: 'Please input your password!' }]}
//                     >
//                         <Input.Password />
//                     </Form.Item>

//                     <Form.Item>
//                         <Button type="primary" htmlType="submit" block>
//                             Login
//                         </Button>
//                     </Form.Item>
//                 </Form>
//             </div>
//         </div>
//     );
// };

// export default MyAccount;

import React from 'react';
import { Form, Input, Checkbox, Button } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { fetchCart } from '../redux/slices/cartSlice';
import { useDispatch, useSelector } from 'react-redux';

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
      localStorage.setItem('user', JSON.stringify(user));
      console.log(loginRes)

       const guestCart = JSON.parse(sessionStorage.getItem('guestCart')) || [];
      if (guestCart.length > 0) {
        await axios.post(`${import.meta.env.VITE_BACKEND_SERVER_URL}/api/cart/add/bulk`, {
          userId: user.user_id,
          cartItems: guestCart
        });
        sessionStorage.removeItem('guestCart');
      }
      const newCart = dispatch(fetchCart(user.user_id));
      console.log(newCart)
        navigate('/');

    } catch (err) {
      console.error('Login failed:', err);
      // Optionally show a message to user
    }
  };

  return (
    <div className="flex items-center justify-center mt-12">
      <div className="p-8 rounded-lg w-full max-w-sm" style={{
                  boxShadow: '8px 5px 6px lightgray', backgroundColor: "rgba(132, 152, 176, 0.1)"}}>
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <Form name="login" onFinish={onFinish} layout="vertical">
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your username or email!' }]}
          >
            <Input placeholder="Username or Email" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>
          <Form.Item>
            <Form.Item name="keepLoggedIn" valuePropName="checked" noStyle>
              <Checkbox>Remember me</Checkbox>
            </Form.Item>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full " style={{ backgroundColor: 'black', borderColor: 'black', color: "white", fontWeight: "500"}}>
              Login
            </Button>
          </Form.Item>
          <Form.Item>
            <div className="flex justify-between text-sm forgot-creds">
              {/* <a href="#">Forgot username?</a> */}
              <a href="#">Forgot password?</a>
            </div>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default MyAccount;
