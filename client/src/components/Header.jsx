// // components/Header.jsx
// import Navbar from './Navbar';
// import Sidebar from './Sidebar';
// import { Layout, Menu, Drawer, Row, Col, List, Avatar } from 'antd';
// import { UserOutlined, ShoppingCartOutlined } from '@ant-design/icons';
// import { Link } from 'react-router-dom';
// import { useSelector } from 'react-redux';
// import { useState } from 'react';

// const { Header } = Layout;

// const HeaderMenu = () => {
//     const [cartOpen, setCartOpen] = useState(false);
//     const cartItems = useSelector((state) => state.cart.items); // adjust based on your slice
//     const user = localStorage.getItem('user');
//     const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');

//     return (
//         <Header  style={{
//             position: 'sticky',
//             top: 0,
//             zIndex: 1,
//             width: '100%',
//             display: 'flex',
//             alignItems: 'center',
//             height: '70px',
//             backgroundColor: '#f5f5f5', //fff className="shadow"
//             justifyContent: 'space-between'
//         }}>
//             {/* <Navbar /> */}
//             <Sidebar />
//             <div className="flex justify-center">
//                 <Link to="/"> 
//                     <img
//                         src="/assets/logo-jabador.png" // replace with your image path
//                         alt="Logo"
//                         className="object-contain"
//                         style={{padding: "1rem 1rem 1rem 3rem", height: "80px", width: "480px"}}
//                     />
//                 </Link>
//             </div>
//             <Navbar />
//             <div className="flex items-center space-x-4 ml-auto header-icons">
//                 {/* Account Icon */}
//                 <Link to="/my-account" className="account-icon">
//                     <UserOutlined className="text-xl cursor-pointer text-black" />
//                 </Link>

//                 {/* Divider */}
//                 <div className="border-l h-6 border-gray-400"></div>

//                 {/* Cart Icon */}
//                 <ShoppingCartOutlined
//                     className="text-2xl cursor-pointer text-black"
//                     onClick={() => setCartOpen(true)}
//                 />
//             </div>
//             {/* Cart Drawer */}
//             <Drawer
//                 title="Cart Items"
//                 placement="right"
//                 closable
//                 onClose={() => setCartOpen(false)}
//                 open={cartOpen}
//             >
//                <List
//                 itemLayout="horizontal"
//                 dataSource={(user ? cartItems : guestCart) || []}
//                 renderItem={(item) => (
//                     <List.Item>
//                     <List.Item.Meta
//                         avatar={<Avatar src={item.image ? item.image : "/fallback.jpg"} />}
//                         title={item.name || "Unnamed Product"}
//                         description={`Qty: ${item.quantity} | $${item.price || 0}`}
//                     />
//                     </List.Item>
//                 )}
//                 />
//             </Drawer>
//         </Header>
//     );
// };

// export default HeaderMenu;


import { useEffect, useState } from 'react';
import { Layout, Badge } from 'antd';
import { Link } from 'react-router-dom';
import { UserOutlined, ShoppingCartOutlined } from '@ant-design/icons';

import Navbar from './Navbar';
import Sidebar from './Sidebar';
import CartDrawer from './CartDrawer';

const { Header } = Layout;
import { useSelector, useDispatch } from 'react-redux';
import { openDrawer, closeDrawer } from '../redux/slices/cartSlice';


const HeaderMenu = () => {
    
  const cartCount = useSelector((state) => {state.cart.items.length, console.log(state)});
  const isDrawerOpen = useSelector((state) => state.cart.isDrawerOpen);
  const dispatch = useDispatch();
   const [cartOpen, setCartOpen] = useState(false);

    return (
        <Header
            style={{
                position: 'sticky',
                top: 0,
                zIndex: 1,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                height: '70px',
                backgroundColor: '#f5f5f5',
                justifyContent: 'space-between',
            }}
        >
            <Sidebar />

            <div className="flex justify-center">
                <Link to="/">
                    <img
                        src="/assets/logo-jabador.png"
                        alt="Logo"
                        className="object-contain"
                        style={{ padding: "1rem 1rem 1rem 3rem", height: "80px", width: "480px" }}
                    />
                </Link>
            </div>

            <Navbar />

            <div className="flex items-center space-x-4 ml-auto header-icons">
                <Link to="/my-account" className="account-icon">
                    <UserOutlined className="text-xl cursor-pointer text-black" />
                </Link>

                <div className="border-l h-6 border-gray-400"></div>

                   <Badge count={cartCount} showZero>
                        <ShoppingCartOutlined
                            className="text-2xl cursor-pointer text-black"
                            onClick={() => dispatch(openDrawer())}
                        />
                    </Badge>
            </div>


            {/* Cart Drawer */}
            {/* <CartDrawer cartOpen={cartOpen} setCartOpen={setCartOpen} /> */}
            <CartDrawer cartOpen={isDrawerOpen} setCartOpen={() => dispatch(closeDrawer())} />
        </Header>
    );
};

export default HeaderMenu;
