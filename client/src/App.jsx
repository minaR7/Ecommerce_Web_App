import React, { useState } from 'react';
import { Layout, Menu, Drawer, Button, Card, Row, Col } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import HeaderMenu from './components/Header';
import MainContent from './components/MainContent';
import FooterMenu from './components/Footer';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Men from './pages/Men';
import Women from './pages/Women';
import MenSubcategory from './pages/MenSubcategory';
import WomenSubcategory from './pages/WomenSubcategory';
import Accessories from './pages/Accessories';
import Kids from './pages/Kids';
import NotFound from './pages/404';
import MyAccount from './pages/Login';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import Category from './pages/Category';
import ProductListing from './pages/ProductListing';
import Store from './pages/Store';
import Cart from './pages/Cart'

const { Header, Content, Footer } = Layout;

const App = () => {
  const [visible, setVisible] = useState(false);

  const showDrawer = () => setVisible(true);
  const closeDrawer = () => setVisible(false);
  // const updatedCart = [{"productId":1,"variant":4,"quantity":3,"coverImg":"http://localhost:3005/assets/jabador-white-and-gold-503x800.jpg","name":"Men Casual Shirt","basePrice":29.99,"size":"L","color":"yellow"}]
  // sessionStorage.setItem('guestCart', JSON.stringify(updatedCart));

  return (
     <Layout style={{ backgroundColor: "#ffffff"}} >
        <HeaderMenu> </HeaderMenu>
        <Content style={{ padding: '0rem 0rem 1rem 0rem', minHeight: "75vh", backgroundColor: "#fff" }}> 
          {/* {marginTop: 64, #f5f5f5 } */}
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
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/cart" element={<Cart/>} />

              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
          </Routes>
         </Content>
      <FooterMenu></FooterMenu>
    </Layout>

  );
};

export default App;
