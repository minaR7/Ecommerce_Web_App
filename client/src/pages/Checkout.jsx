import { useState, useEffect } from 'react';
import { Form, Input, Select, Radio, Collapse, Divider, Image } from 'antd';
import { useSelector } from 'react-redux';

const { Option } = Select;
const { Panel } = Collapse;

const Checkout = () => {
  const [useDifferentBilling, setUseDifferentBilling] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  const reduxCart = useSelector(state => state.cart?.items || []);

  useEffect(() => {
    const guestCart = JSON.parse(sessionStorage.getItem('guestCart')) || [];
    setCartItems(reduxCart.length ? reduxCart : guestCart);
  }, [reduxCart]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6">
      {/* Left Side - Form */}
      <div className="w-full lg:w-2/3 space-y-8">
        {/* 1. Information */}
        <div className="bg-white p-4 shadow rounded-xl">
          <h2 className="text-xl font-semibold mb-4">Information</h2>
          <Form layout="vertical">
            <Form.Item label="Email" name="email"><Input /></Form.Item>
            <Form.Item label="First Name" name="firstName"><Input /></Form.Item>
            <Form.Item label="Last Name" name="lastName"><Input /></Form.Item>
          </Form>
        </div>

        {/* 2. Shipping Information */}
        <div className="bg-white p-4 shadow rounded-xl">
          <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
          <Form layout="vertical">
            <Form.Item label="Country" name="country"><Select><Option value="usa">USA</Option></Select></Form.Item>
            <Form.Item label="Street Address" name="street"><Input /></Form.Item>
            <Form.Item label="City / Town" name="city"><Input /></Form.Item>
            <Form.Item label="Phone Number" name="phone"><Input /></Form.Item>
          </Form>
        </div>

        {/* 3. Shipping Method */}
        <div className="bg-white p-4 shadow rounded-xl">
          <h2 className="text-xl font-semibold mb-4">Shipping Method</h2>
          <p className="mb-2">International delivery, shipping charges: <strong>$35</strong></p>
          <Form.Item label="Order Notes" name="notes"><Input.TextArea rows={3} /></Form.Item>
        </div>

        {/* 4. Billing Details */}
        <div className="bg-white p-4 shadow rounded-xl">
          <h2 className="text-xl font-semibold mb-4">Billing Details</h2>
          <Radio.Group
            onChange={(e) => setUseDifferentBilling(e.target.value === 'different')}
            defaultValue="same"
          >
            <Radio value="same">Same as shipping</Radio>
            <Radio value="different">Use a different billing address</Radio>
          </Radio.Group>

          {useDifferentBilling && (
            <Collapse activeKey={['1']} className="mt-4">
              <Panel header="Billing Address" key="1">
                <Form layout="vertical">
                  <Form.Item label="Email"><Input /></Form.Item>
                  <Form.Item label="First Name"><Input /></Form.Item>
                  <Form.Item label="Last Name"><Input /></Form.Item>
                  <Form.Item label="Country"><Select><Option value="usa">USA</Option></Select></Form.Item>
                  <Form.Item label="Street Address"><Input /></Form.Item>
                  <Form.Item label="City / Town"><Input /></Form.Item>
                  <Form.Item label="Phone Number"><Input /></Form.Item>
                </Form>
              </Panel>
            </Collapse>
          )}
        </div>

        {/* 5. Payment Method */}
        <div className="bg-white p-4 shadow rounded-xl">
          <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
          {/* Add your payment options here (e.g., credit card, PayPal, etc.) */}
          <p>Payment method selection will be added here.</p>
        </div>
      </div>

      {/* Right Side - Order Summary */}
      <div className="w-full lg:w-1/3 bg-white p-4 shadow rounded-xl">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        {cartItems.map((item, index) => (
          <div key={index} className="grid grid-cols-3 gap-4 mb-4 border-b pb-4">
            {/* Image */}
            <div>
              <Image width={64} src={item.image} alt={item.name} />
            </div>
            {/* Name, Size, Color */}
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-500">Size: {item.size}</p>
              <p className="text-sm text-gray-500">Color: {item.color}</p>
            </div>
            {/* Quantity & Price */}
            <div className="text-right">
              <p>Qty: {item.quantity}</p>
              <p className="font-semibold">${item.price * item.quantity}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Checkout;
