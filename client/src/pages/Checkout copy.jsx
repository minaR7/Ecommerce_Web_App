import { useState, useEffect } from 'react';
import { Form, Input, Select, Radio, Collapse, Divider, Image, Col, Row } from 'antd';
import { useSelector } from 'react-redux';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripePaymentForm from '../components/PaymentForm';

const { Option } = Select;
const { Panel } = Collapse;

const stripePromise = loadStripe(`${import.meta.env.STRIPE_PUBLISHABLE_KEY}`); // replace with your STRIPE_PUBLISHABLE_KEY
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
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item label="Email" name="email" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="First Name" name="firstName">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Last Name" name="lastName">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>

        {/* 2. Shipping Information */}
        <div className="bg-white p-4 shadow rounded-xl">
          <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
          <Form layout="vertical">
            <Row gutter={16}>
              <Col span ={24}>
                <Form.Item label="Street Address" name="street" rules={[{ required: true }]}><Input /></Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span ={8}>
                <Form.Item label="Country" name="country" rules={[{ required: true }]}><Select><Option value="usa">USA</Option></Select></Form.Item>
              </Col>
              <Col span ={8}>  
                <Form.Item label="City / Town" name="city" rules={[{ required: true }]}><Input /></Form.Item>
              </Col>
              <Col span ={8}>  
                <Form.Item label="Phone Number" name="phone" rules={[{ required: true }]}><Input /></Form.Item>
              </Col>
            </Row>
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
                  <Row gutter={16}>
                    <Col span={24}>
                      <Form.Item label="Email" name="billemail" rules={[{ required: true }]}>
                        <Input />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="First Name" name="billFirstName">
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Last Name" name="billLastName">
                        <Input />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span ={24}>
                      <Form.Item label="Street Address" name="billStreet" rules={[{ required: true }]}><Input /></Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span ={8}>
                      <Form.Item label="Country" name="billCountry" rules={[{ required: true }]}><Select><Option value="usa">USA</Option></Select></Form.Item>
                    </Col>
                    <Col span ={8}>  
                      <Form.Item label="City / Town" name="billCity" rules={[{ required: true }]}><Input /></Form.Item>
                    </Col>
                    <Col span ={8}>  
                      <Form.Item label="Phone Number" name="billPhone" rules={[{ required: true }]}><Input /></Form.Item>
                    </Col>
                  </Row>
                </Form>
              </Panel>
            </Collapse>
          )}
        </div>

        {/* 5. Payment Method */}
        <div className="bg-white p-4 shadow rounded-xl">
          <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
          {/* Add your payment options here (e.g., credit card, PayPal, etc.) */}
          <div className="flex gap-4 mb-4">
          <img src="/assets/icons/paypal-3-svgrepo-com.svg" alt="PayPal" className="w-12 h-12" />
            <img src="/assets/icons/google-pay-svgrepo-com.svg" alt="Google Pay" className="w-10" />
            <img src="/assets/icons/visa-svgrepo-com (1).svg" alt="VISA" className="w-10" />
            <img src="/assets/icons/mastercard-svgrepo-com.svg" alt="MasterCard" className="w-10" />
          </div>
          <Elements stripe={stripePromise}>
            <StripePaymentForm amount={ cartItems.reduce((acc, item) => 
              acc + item.basePrice * item.quantity, 0) + 35} />
          </Elements>
        </div>
      </div>

      {/* Right Side - Order Summary */}
      <div className="w-full lg:w-1/3 bg-white p-4 shadow rounded-xl flex flex-col justify-between h-full">
        <div>
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
                <p className="font-semibold">${item.basePrice * item.quantity}</p>
              </div>
            </div>
          ))}
        </div>

       {/* Summary Footer */}
        <div className="mt-6 space-y-3 border-t pt-4">
          <div className="flex justify-between text-base">
            <span>Subtotal</span>
            <span className="font-semibold">
              ${cartItems.reduce((acc, item) => acc + item.basePrice * item.quantity, 0).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-base">
            <span>Shipping Charges</span>
            <span className="font-semibold">$35.00</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>
              ${(
                cartItems.reduce((acc, item) => acc + item.basePrice * item.quantity, 0) + 35
              ).toFixed(2)}
            </span>
          </div>

          {/* Confirm Order Button */}
          <button className="w-full mt-4 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-all">
            Confirm Order
          </button>
        </div>
      </div>

    </div>
  );
};

export default Checkout;
