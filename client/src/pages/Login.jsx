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

const MyAccount = () => {
  const onFinish = (values) => {
    console.log('Received values:', values);
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
