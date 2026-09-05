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
import { Layout, Badge, Dropdown, Menu  } from 'antd';
import { Link, useNavigate  } from 'react-router-dom';
import { UserOutlined, ShoppingCartOutlined, DownOutlined  } from '@ant-design/icons';

import Navbar from './Navbar';
import Sidebar from './Sidebar';
import CartDrawer from './CartDrawer';
import { useSiteSettings } from '../hooks/useSiteSettings';

const { Header } = Layout;
import { useSelector, useDispatch } from 'react-redux';
import { openDrawer, closeDrawer, clearCart } from '../redux/slices/cartSlice';


const DEFAULT_LOGO = '/assets/logo/El-Maghrib-logo.png';

const HeaderMenu = () => {
  const { settings } = useSiteSettings();
  const logoSrc = settings.logo_url || DEFAULT_LOGO;
  const cartCount = useSelector((state) => state.cart.items.length);
  const isDrawerOpen = useSelector((state) => state.cart.isDrawerOpen);
  const dispatch = useDispatch();
   const [cartOpen, setCartOpen] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));

    // Listen for login events to update instantly
    const handleLogin = () => {
        const updatedUser = JSON.parse(localStorage.getItem('user'));
        setUser(updatedUser);
    };

    window.addEventListener('user-login', handleLogin);

    // Cleanup listener
    return () => {
        window.removeEventListener('user-login', handleLogin);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null); 
    dispatch(clearCart());   // don't leak the previous user's cart to the next visitor
    navigate('/');
  };

  const userMenu = (
    <Menu
      items={[
        // { key: '1', label: <Link to="/my-account">My Account</Link> },
        { key: '2', label: <div onClick={handleLogout}>Logout</div> },
      ]}
    />
  );

    return (
        <Header
            style={{
                position: 'sticky',
                top: 0,
                zIndex: 10,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                height: 'auto',
                minHeight: '64px',
                backgroundColor: '#f5f5f5',
                justifyContent: 'space-between',
                padding: '4px 8px',
                lineHeight: 'normal',
            }}
        >
            {/* Left: burger — flex-1 so the centre logo stays truly centred */}
            <div className="flex items-center flex-1 min-w-0">
                <Sidebar />
            </div>

            {/* Centre: logo, in normal flow (no absolute positioning) so it can never
                overflow the bar or overlap the hero at any zoom level. */}
            <div className="flex justify-center shrink-0 px-2">
                <Link to="/">
                    <img
                        src={logoSrc}
                        alt="Logo"
                        className="object-contain block"
                        style={{
                            height: "clamp(42px, 8vw, 72px)",
                            width: "auto",
                            maxWidth: "min(420px, 55vw)",
                        }}
                    />
                </Link>
            </div>

            {/* Right: account + cart — flex-1 mirrors the left so the logo is centred */}
            <div className="flex items-center justify-end flex-1 min-w-0 space-x-3 sm:space-x-4 header-icons z-10 pr-1 sm:pr-3">
                {/* User section */}
                {user ? (
                <Dropdown overlay={userMenu} trigger={['click']}>
                    <div className="cursor-pointer flex items-center gap-1 min-w-0">
                    <UserOutlined className="text-xl text-black shrink-0" />
                    <span className="font-medium text-black hidden sm:inline-block max-w-[140px] truncate align-middle">
                      Hi,&nbsp;
                      {Array.isArray(user)
                        ? user[0]?.username || user[0]?.email || 'User'
                        : user?.username || user?.email || 'User'}
                    </span>
                    <DownOutlined className="text-xs text-gray-600 shrink-0" />
                    </div>
                </Dropdown>
                ) : (
                <Link to="/my-account" className="account-icon">
                    <UserOutlined className="text-xl cursor-pointer text-black" />
                </Link>
                )}
                <div className="border-l h-6 border-gray-400 "></div>

                   <Badge count={cartCount} showZero>
                        <ShoppingCartOutlined
                            className="text-2xl cursor-pointer text-black mr-1"
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
