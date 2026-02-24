import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  AppstoreOutlined,
  TagsOutlined,
  GiftOutlined,
  GlobalOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const { Sider } = Layout;

const menuItems = [
  {
    key: '/',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
  },
  {
    key: 'catalog',
    icon: <AppstoreOutlined />,
    label: 'Catalog',
    children: [
      {
        key: '/categories',
        icon: <AppstoreOutlined />,
        label: 'Categories',
      },
      {
        key: '/subcategories',
        icon: <TagsOutlined />,
        label: 'Subcategories',
      },
      {
        key: '/products',
        icon: <ShoppingOutlined />,
        label: 'Products',
      },
    ],
  },
  {
    key: '/orders',
    icon: <ShoppingCartOutlined />,
    label: 'Orders',
  },
  {
    key: '/users',
    icon: <UserOutlined />,
    label: 'Users',
  },
  {
    key: '/customers',
    icon: <UserOutlined />,
    label: 'Customers',
  },
  {
    key: '/coupons',
    icon: <GiftOutlined />,
    label: 'Coupons',
  },
  {
    key: '/shipping',
    icon: <GlobalOutlined />,
    label: 'Shipping',
  },
  {
    key: '/pages',
    icon: <FileTextOutlined />,
    label: 'Site Content',
  },
  // {
  //   key: '/settings',
  //   icon: <SettingOutlined />,
  //   label: 'Settings',
  // },
];

export const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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
        background: 'linear-gradient(180deg, #0d0d0d 0%, #080808 100%)',
      }}
    >
      
      <div className="flex items-center justify-evenly pt-5 pb-2 px-2 border-b border-border">
      {!collapsed && (
        <div className="flex flex-col items-center gap-3">
          <div className="w-30 h-4 rounded-lg bg-foreground flex items-center justify-center">
            <span className="text-background font-bold text-lg"><img src='/assets/logo/El-Maghrib-logos-White.png' width={300} height={150}></img></span>
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
        theme="dark"
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
