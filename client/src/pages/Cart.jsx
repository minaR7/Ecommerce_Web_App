import { useState, useEffect } from 'react';
import { Form, Input, Select, Radio, Collapse, notification, Col, Row, Image } from 'antd';
import { useSelector } from 'react-redux';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import {StripePaymentForm,GooglePayButton} from '../components/PaymentForm';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from 'react-redux';

const Checkout = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [useDifferentBilling, setUseDifferentBilling] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const reduxCart = useSelector(state => state.cart?.items || []);
  const navigate = useNavigate();
  const [paymentMethodId, setPaymentMethodId] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState("card");

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


  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6">

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

        {/* Confirm Order Button onClick={handleCheckout}*/}
        <button className="w-full mt-4 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-all" >
          Confirm Order
        </button>
      </div>

    </div>
  </div>
   

  );
};

export default Checkout;
