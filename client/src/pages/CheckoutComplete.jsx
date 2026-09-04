import React from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { CheckCircleFilled, ShoppingOutlined, MailOutlined } from '@ant-design/icons';

// How long after ordering the confirmation page stays viewable (survives refreshes
// within the same tab). After this, or in a new tab / via a typed URL, it's blocked.
const ACCESS_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

const readValidToken = () => {
  try {
    const raw = sessionStorage.getItem('orderComplete');
    if (!raw) return null;
    const token = JSON.parse(raw);
    if (!token?.ts || Date.now() - token.ts > ACCESS_WINDOW_MS) {
      sessionStorage.removeItem('orderComplete');
      return null;
    }
    return token;
  } catch {
    return null;
  }
};

const CheckoutComplete = () => {
  const location = useLocation();

  // Access is allowed if we arrived straight from checkout (navigation state) OR a
  // recent order token exists in this tab (so a refresh still works). Typing the URL
  // directly, opening a new tab, or coming back later has neither → bounce home.
  const token = readValidToken();
  const allowed = Boolean(location.state?.justPlaced || token);
  if (!allowed) {
    return <Navigate to="/" replace />;
  }

  const orderId = location.state?.orderId ?? token?.orderId;

  return (
    <div className="flex items-center justify-center px-4 py-16 bg-[#f7f7f5] min-h-[70vh]">
      <div
        className="w-full max-w-lg text-center bg-white rounded-2xl p-8 sm:p-10"
        style={{ boxShadow: '0 10px 30px rgba(21,32,58,0.08)' }}
      >
        <div className="flex justify-center mb-4">
          <CheckCircleFilled style={{ fontSize: 64, color: '#16a34a' }} />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-[#15203a] mb-2">Order Confirmed!</h1>
        <p className="text-gray-600 mb-1">Thank you for shopping with El-Maghrib.</p>

        {orderId ? (
          <p className="text-gray-700 mb-6">
            Your order number is{' '}
            <span className="font-semibold text-[#15203a]">#{orderId}</span>.
          </p>
        ) : (
          <p className="text-gray-700 mb-6">Your order has been placed successfully.</p>
        )}

        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-8">
          <MailOutlined />
          <span>A confirmation email with your invoice is on its way.</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/store"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#15203a] text-white! font-semibold hover:bg-[#1f2b47] transition-colors"
          >
            <ShoppingOutlined /> Continue Shopping
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-[#15203a] text-[#15203a]! font-semibold hover:bg-[#15203a] hover:text-white! transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckoutComplete;
