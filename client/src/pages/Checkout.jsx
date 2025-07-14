import { useState, useEffect } from 'react';
import { Form, Input, Select, Radio, Collapse, notification, Col, Row, Image } from 'antd';
import { useSelector } from 'react-redux';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import {StripePaymentForm,GooglePayButton} from '../components/PaymentForm';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { placeOrder } from '../redux/slices/checkoutSlice';
import countries from 'world-countries';


const { Option } = Select;
const { Panel } = Collapse;

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const Checkout = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [useDifferentBilling, setUseDifferentBilling] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const reduxCart = useSelector(state => state.cart?.items || []);
  const navigate = useNavigate();
  const [paymentMethodId, setPaymentMethodId] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState("card");

  // useEffect(() => {
  //   const guestCart = JSON.parse(sessionStorage.getItem('guestCart')) || [];
  //   setCartItems(reduxCart.length ? reduxCart : guestCart);
  // }, [reduxCart]);

  useEffect(() => {
    const loadCart = () => {
      const guestCart = JSON.parse(sessionStorage.getItem('guestCart')) || [];
      setCartItems(reduxCart.length ? reduxCart : guestCart);
    };
  
    loadCart(); // Initial load
  
    // Listen for guest cart updates
    window.addEventListener('guestCartUpdated', loadCart);
  
    return () => {
      window.removeEventListener('guestCartUpdated', loadCart);
    };
  }, [reduxCart]);
  
  // Passed into StripePaymentForm
  const handlePaymentMethodGenerated = (id) => {
    setPaymentMethodId(id);
    notification.success({
          message: 'Payment completed',
          // description: 'Your order is being processed',
        });
  };
  
  //This function will be triggered on Confirm Order click
  const handleCheckout = async () => {
    try {
      const validatedValues = await form.validateFields(); // ✅ Try validating
      console.log('Form is valid. Values:', validatedValues);
      const totalAmount = cartItems.reduce((acc, item) => acc + item.basePrice * item.quantity, 0) + 35;

      // Validate if Stripe Paymnet is completed first
      if (!paymentMethodId) {
        notification.error({
          message: 'Payment not completed',
          description: 'Please complete payment before confirming your order.',
        });
        return;
      }

      // const payload = {
      //   user_info: {
      //     firstName: validatedValues.firstName,
      //     lastName: validatedValues.lastName,
      //     email: validatedValues.email,
      //     phone: validatedValues.phone
      //   },
      //   shipping: {
      //     city: validatedValues.city,
      //     country: validatedValues.country,
      //     street: validatedValues.street,
      //     phone: validatedValues.phone
      //   },
      //   billing: useDifferentBilling
      //     ? {
      //         city: validatedValues.billCity,
      //         country: validatedValues.billCountry,
      //         street: validatedValues.billStreet,
      //         phone: validatedValues.billPhone
      //       }
      //     : {
      //         city: validatedValues.city,
      //         country: validatedValues.country,
      //         street: validatedValues.street,
      //         phone: validatedValues.phone
      //       },
      //     paymentMethodId: paymentMethodId || validatedValues?.paymentId || "hdhdhd", 
      //     totalAmount: totalAmount,
      //     cartItems: cartItems,
      // };

      dispatch(
        placeOrder({
          validatedValues,
          paymentMethodId,
          cartItems,
          useDifferentBilling,
        })
      );
      setTimeout(() => {
          navigate('/');
        }, 2000)
      
    } catch (error) {
      console.log(error)
      // Scroll to first error field
      if (error?.errorFields) {
        const firstErrorField = error?.errorFields?.[0]?.name?.[0];
        if (firstErrorField) {
          form.scrollToField(firstErrorField, { behavior: 'smooth' });
        }
  
        notification.error({
          message: 'Form Incomplete',
          description: 'Please fill all required fields.',
        });
        return;
      }
  
      setTimeout(() => {
          navigate('/');
        }, 2000)
      // Backend/API error
      // const message =
      //   error?.response?.data?.message || 'Something went wrong. Please try again.';
  
      // notification.error({
      //   message: 'Error',
      //   description: message,
      // });
    }
  };

  const countryOptions = countries.map(country => ({
    label: country.name.common,
    value: country.cca2 // or use `country.name.common` if you prefer
  }));

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6">
    {/* Left Side - Form */}
    <div className="w-full lg:w-2/3 space-y-8">
      <Form layout="vertical"  className="space-y-8" form={form}>
      {/* 1. Information */}
      <div className="bg-white p-4 shadow rounded-xl">
        <h2 className="text-xl font-semibold mb-4">Information</h2>
        {/* <Form layout="vertical"> */}
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
        {/* </Form> */}
      </div>

      {/* 2. Shipping Information */}
      <div className="bg-white p-4 shadow rounded-xl">
        <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
        {/* <Form layout="vertical"> */}
          <Row gutter={16}>
            <Col span ={24}>
              <Form.Item label="Street Address" name="street" rules={[{ required: true }]}><Input /></Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span ={8}>
              {/* <Form.Item label="Country" name="country" rules={[{ required: true }]}><Select><Option value="usa">USA</Option></Select></Form.Item> */}
              <Form.Item label="Country" name="country" rules={[{ required: true }]}>
                <Select showSearch placeholder="Select a country" optionFilterProp="label">
                  {countryOptions.map((country) => (
                    <Select.Option key={country.value} value={country.label} label={country.label}>
                      {country.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span ={8}>  
              <Form.Item label="City / Town" name="city" rules={[{ required: true }]}><Input /></Form.Item>
            </Col>
            <Col span ={8}>  
              <Form.Item label="Phone Number" name="phone" rules={[{ required: true }]}><Input /></Form.Item>
            </Col>
          </Row>
        {/* </Form> */}
      </div>

      {/* 3. Shipping Method */}
      <div className="bg-white p-4 shadow rounded-xl">
        <h2 className="text-xl font-semibold mb-4">Shipping Method</h2>
        <p className="mb-2">International delivery, shipping charges: <strong>€35</strong></p>
        <Form.Item label="Order Notes" name="notes"><Input.TextArea rows={3} /></Form.Item>
      </div>

      {/* 4. Billing Details */}
      {/* <div className="bg-white p-4 shadow rounded-xl">
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
              //<Form layout="vertical">
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item label="Email" name="billEmail" rules={[{ required: true }]}>
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
              // </Form> 
            </Panel>
          </Collapse>
        )}
      </div> */}
      {/* </Form> */}
      <div className="bg-white p-4 shadow rounded-xl">
        <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
        {/* Add your payment options here (e.g., credit card, PayPal, etc.) */}
        <div className="flex gap-4 mb-4">
          {/* <img  onClick={() => setSelectedMethod("paypal")} src="/assets/icons/paypal-3-svgrepo-com.svg" alt="PayPal" className="w-12 h-12 cursor-pointer" />
          <img  onClick={() => setSelectedMethod("gpay")} src="/assets/icons/google-pay-svgrepo-com.svg" alt="Google Pay" className="w-10 cursor-pointer" /> */}
          <img  onClick={() => setSelectedMethod("card")} src="/assets/icons/visa-svgrepo-com (1).svg" alt="VISA" className="w-10 cursor-pointer" />
          <img  onClick={() => setSelectedMethod("card")} src="/assets/icons/mastercard-svgrepo-com.svg" alt="MasterCard" className="w-10 cursor-pointer" />
        </div>
        {selectedMethod === 'card' && (
          // <Form.Item label="" name="paymentOption" rules={[{ required: true }]}>
            <Elements stripe={stripePromise}>
              <StripePaymentForm onPaymentMethodGenerated={handlePaymentMethodGenerated} />
            </Elements>
          //</Form.Item>
        )}

        {selectedMethod === 'gpay' && (
          <Elements stripe={stripePromise}>
            <GooglePayButton />
          </Elements>
        )}

        {/* {selectedMethod === 'paypal' && (
          <PayPalComponent />
        )} */}

        {/* <Elements stripe={stripePromise}>
          <StripePaymentForm onPaymentMethodGenerated={handlePaymentMethodGenerated} />
          {/* <StripePaymentForm amount={ cartItems.reduce((acc, item) => 
            acc + item.basePrice * item.quantity, 0) + 35} /> 
        </Elements> */}
      </div>
      </Form>
    </div>

    {/* Right Side - Order Summary */}
    <div className="w-full lg:w-1/3 bg-white p-4 shadow rounded-xl flex flex-col justify-between h-full">
      <div>
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        
        {cartItems.map((item, index) => (
          <div key={index} className="grid grid-cols-3 gap-4 mb-4 border-b pb-2">
            {/* Image */}
            <div>
              <Image width={64} src={item?.coverImg} alt={item?.name} />
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
              <p className="font-semibold">€{item.basePrice * item.quantity}</p>
            </div>
          </div>
        ))}
      </div>

    {/* Summary Footer */}
      <div className="mt-1 space-y-3 pt-1">
        <div className="flex justify-between text-base">
          <span>Subtotal</span>
          <span className="font-semibold">
            €{cartItems.reduce((acc, item) => acc + item.basePrice * item.quantity, 0).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-base">
          <span>Shipping Charges</span>
          <span className="font-semibold">€35.00</span>
        </div>
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>
            €{(
              cartItems.reduce((acc, item) => acc + item.basePrice * item.quantity, 0) + 35
            ).toFixed(2)}
          </span>
        </div>

        {/* Confirm Order Button */}
        <button className="w-full mt-4 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-all" 
        onClick={handleCheckout}>
          Confirm Order
        </button>
      </div>

    </div>
  </div>
   

  );
};

export default Checkout;
