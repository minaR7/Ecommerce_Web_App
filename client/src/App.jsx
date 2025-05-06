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
const { Header, Content, Footer } = Layout;

const App = () => {
  const [visible, setVisible] = useState(false);

  const showDrawer = () => setVisible(true);
  const closeDrawer = () => setVisible(false);

  return (
     <Layout style={{ backgroundColor: "#ffffff"}} >
        <HeaderMenu> </HeaderMenu>
        <Content style={{ padding: '0rem 0rem 1rem 0rem', minHeight: "75vh", backgroundColor: "#fff" }}> 
          {/* {marginTop: 64, #f5f5f5 } */}
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/men" element={<Men />} />
              <Route path="/men/:subcategory" element={<MenSubcategory />} />
              <Route path="/women" element={<Women />} />
              <Route path="/women/:subcategory" element={<WomenSubcategory />} />
              <Route path="/kids" element={<Kids />} />
              <Route path="/accessories" element={<Accessories />} />
              <Route path="/my-account" element={<MyAccount />} />
              <Route path="/product/:id" element={<ProductDetail />} />

              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
          </Routes>
         </Content>
      <FooterMenu></FooterMenu>
    </Layout>

  );
};

export default App;
