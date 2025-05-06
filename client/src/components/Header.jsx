// components/Header.jsx
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Layout, Menu, Drawer, Row, Col } from 'antd';
import { UserOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const { Header } = Layout;

const HeaderMenu = () => {
    const [cartOpen, setCartOpen] = useState(false);

    return (
        <Header  style={{
            position: 'sticky',
            top: 0,
            zIndex: 1,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            height: '70px',
            backgroundColor: '#f5f5f5', //fff className="shadow"
            justifyContent: 'space-between'
        }}>
            {/* <Navbar /> */}
            <Sidebar />
            <div className="flex justify-center">
                <Link to="/"> 
                    <img
                        src="/assets/logo-jabador.png" // replace with your image path
                        alt="Logo"
                        className="object-contain"
                        style={{padding: "1rem 1rem 1rem 3rem", height: "80px", width: "480px"}}
                    />
                </Link>
            </div>
            <Navbar />
            <div className="flex items-center space-x-4 ml-auto header-icons">
                {/* Account Icon */}
                <Link to="/my-account" className="account-icon">
                    <UserOutlined className="text-xl cursor-pointer text-black" />
                </Link>

                {/* Divider */}
                <div className="border-l h-6 border-gray-400"></div>

                {/* Cart Icon */}
                <ShoppingCartOutlined
                    className="text-2xl cursor-pointer text-black"
                    onClick={() => setCartOpen(true)}
                />
            </div>
            {/* Cart Drawer */}
            <Drawer
                title="Your Cart"
                placement="right"
                closable
                onClose={() => setCartOpen(false)}
                open={cartOpen}
            >
                <p>Your cart is empty.</p> {/* You can replace this with cart items */}
            </Drawer>
        </Header>
    );
};

export default HeaderMenu;
