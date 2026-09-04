import React, { useState, lazy, Suspense } from 'react';
import { Layout, Spin } from 'antd';
import HeaderMenu from './components/Header';
import FooterMenu from './components/Footer';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';

// Route pages are code-split so each loads on demand, keeping the initial
// bundle small. Home stays eager for a fast first paint on the landing page.
const NotFound = lazy(() => import('./pages/404'));
const MyAccount = lazy(() => import('./pages/Login'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Category = lazy(() => import('./pages/Category'));
const ProductListing = lazy(() => import('./pages/ProductListing'));
const Store = lazy(() => import('./pages/Store'));
const Cart = lazy(() => import('./pages/Cart'));
const Signup = lazy(() => import('./pages/Signup'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const CheckoutComplete = lazy(() => import('./pages/CheckoutComplete'));
const OurHistory = lazy(() => import('./pages/about-us/OurHistory'));
const ConditionsOfSale = lazy(() => import('./pages/about-us/ConditionsOfSale'));
const PrivacyPolicy = lazy(() => import('./pages/about-us/PrivacyPolicy'));
const LegalNotice = lazy(() => import('./pages/about-us/LegalNotice'));
const PaymentMethods = lazy(() => import('./pages/quick-links/PaymentMethods'));
const ExchangeReturn = lazy(() => import('./pages/quick-links/ExchangeReturn'));
const DeliveryPolicy = lazy(() => import('./pages/quick-links/DeliveryTime'));

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ScrollToTop from './components/ScrollToTop';

const { Header, Content, Footer } = Layout;

const App = () => {
  const [visible, setVisible] = useState(false);

  const showDrawer = () => setVisible(true);
  const closeDrawer = () => setVisible(false);
  // const updatedCart = [{"productId":1,"variant":4,"quantity":3,"coverImg":"http://localhost:3005/assets/jabador-white-and-gold-503x800.jpg","name":"Men Casual Shirt","basePrice":29.99,"size":"L","color":"yellow"}]
  // sessionStorage.setItem('guestCart', JSON.stringify(updatedCart));

  return (
     <Layout style={{ backgroundColor: "#ffffff", overflowX: "hidden" }} >
        <ScrollToTop />
        <HeaderMenu> </HeaderMenu>
        <Content style={{ padding: '0rem 0rem 1rem 0rem', minHeight: "75vh", backgroundColor: "#fff", overflowX: "hidden" }}>
          {/* {marginTop: 64, #f5f5f5 } */}
            <Suspense fallback={<div style={{ minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spin size="large" /></div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              {/* <Route path="/men" element={<Men />} />
              <Route path="/men/:subcategory" element={<MenSubcategory />} />
              <Route path="/women" element={<Women />} />
              <Route path="/women/:subcategory" element={<WomenSubcategory />} />
              <Route path="/kids" element={<Kids />} />
              <Route path="/accessories" element={<Accessories />} /> */}
              <Route path="/store" element={<Store />} />
              <Route path="/store/:categoryName" element={<Category />} />
              <Route path="/store/:categoryName/:subcategoryName" element={<ProductListing />} />
              <Route path="/my-account" element={<MyAccount />} />
              <Route path="/register" element={<Signup/>}/>
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/checkout/complete" element={<CheckoutComplete />} />
              <Route path="/cart" element={<Cart/>} />
              <Route path="/our-history" element={<OurHistory />} />
              <Route path="/legal-notice" element={<LegalNotice />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} /> 
              <Route path="/conditions-of-sale" element={<ConditionsOfSale />} />
              <Route path="/exchange-return" element={<ExchangeReturn />} />
              <Route path="/delivery-time" element={<DeliveryPolicy />} />
               <Route path="/blog" element={<NotFound />} />
              <Route path="/payment-method" element={<PaymentMethods />} />
              {/* <Route path="/blog" element={<Blog />} /> */}
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
          </Routes>
            </Suspense>
            <ToastContainer position="top-right" autoClose={3000} />
         </Content>
      <FooterMenu></FooterMenu>
    </Layout>

  );
};

export default App;
