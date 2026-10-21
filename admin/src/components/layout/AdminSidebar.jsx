import { Layout, Menu, Tooltip } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  AppstoreOutlined,
  TagsOutlined,
  GiftOutlined,
  GlobalOutlined,
  LayoutOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../theme/ThemeProvider';

const { Sider } = Layout;

// Wrap a label so a tooltip appears on hover (works in both expanded and
// collapsed states). `tip` defaults to the label text.
const withTip = (label, tip = label) => (
  <Tooltip title={tip} placement="right" mouseEnterDelay={0.3}>
    <span className="inline-block w-full">{label}</span>
  </Tooltip>
);

const menuItems = [
  {
    key: '/',
    icon: <DashboardOutlined />,
    label: withTip('Dashboard'),
    title: 'Dashboard',
  },
  {
    key: 'catalog',
    icon: <AppstoreOutlined />,
    label: 'Catalog',
    title: 'Catalog',
    children: [
      {
        key: '/categories',
        icon: <AppstoreOutlined />,
        label: withTip('Categories'),
        title: 'Categories',
      },
      {
        key: '/subcategories',
        icon: <TagsOutlined />,
        label: withTip('Subcategories'),
        title: 'Subcategories',
      },
      {
        key: '/products',
        icon: <ShoppingOutlined />,
        label: withTip('Products'),
        title: 'Products',
      },
    ],
  },
  {
    key: '/orders',
    icon: <ShoppingCartOutlined />,
    label: withTip('Orders'),
    title: 'Orders',
  },
  {
    key: '/users',
    icon: <UserOutlined />,
    label: withTip('Users'),
    title: 'Users',
  },
  {
    key: '/customers',
    icon: <UserOutlined />,
    label: withTip('Customers'),
    title: 'Customers',
  },
  {
    key: '/coupons',
    icon: <GiftOutlined />,
    label: withTip('Coupons'),
    title: 'Coupons',
  },
  {
    key: '/shipping',
    icon: <GlobalOutlined />,
    label: withTip('Shipping'),
    title: 'Shipping',
  },
  {
    key: '/site-content',
    icon: <LayoutOutlined />,
    label: withTip('Site Content', 'Homepage, footer & pages'),
    title: 'Site Content',
  },
  {
    key: '/notifications',
    icon: <BellOutlined />,
    label: withTip('Notifications'),
    title: 'Notifications',
  },
];

export const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const logoSrc = theme === 'dark'
    ? '/assets/logo/El-Maghrib-logos-White.png'
    : '/assets/logo/El-Maghrib-logos-black.png';

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      trigger={null}
      width={208}
      collapsedWidth={80}
      className="min-h-screen border-r border-border"
      style={{
        background: 'var(--gradient-sidebar)',
      }}
    >
      
      <div className="flex items-center justify-evenly pt-5 pb-2 px-2 border-b border-border">
      {!collapsed && (
        <div className="flex flex-col items-center gap-3">
          {/* White logo on the dark sidebar, black logo on the light one. */}
          <div className="w-30 h-4 rounded-lg flex items-center justify-center">
            <span className="font-bold text-lg"><img src={logoSrc} alt="El-Maghrib" width={300} height={150} /></span>
          </div>
            <div className="animate-fade-in">
              {/* <h1 className="text-foreground font-semibold text-lg">Elmaghrib</h1> */}
              <p className="text-muted-foreground text-s">Admin Panel</p>
            </div>
        </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </button>
      </div>

      <Menu
        theme={theme}
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        className="border-none mt-4"
        style={{ background: 'transparent' }}
      />

    </Sider>
  );
};
