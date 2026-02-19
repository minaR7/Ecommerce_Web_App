import { Layout, Input, Avatar, Dropdown, Badge, Modal, List, Typography } from 'antd';
import { useState, useEffect } from 'react';
import {
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const { Header } = Layout;
const { Text } = Typography;

export const AdminHeader = ({ title }) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [user, setUser] = useState({
    username: '',
    email: ''
  });

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Order', description: 'Order #1234 received', time: '5 mins ago', read: false },
    { id: 2, title: 'Stock Alert', description: 'Product XYZ is low on stock', time: '1 hour ago', read: false },
    { id: 3, title: 'User Registered', description: 'New user joined the store', time: '2 hours ago', read: true },
  ]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    // Clear user session
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Redirect to login page
    window.location.href = '/login';
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const notificationMenu = (
    <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-lg shadow-xl w-80 overflow-hidden">
      <div className="p-4 border-b border-[#2e2e2e] flex justify-between items-center">
        <h3 className="text-foreground font-semibold m-0">Notifications</h3>
        <button 
          onClick={markAllAsRead}
          className="text-xs text-primary hover:underline bg-transparent border-none cursor-pointer"
        >
          Mark all as read
        </button>
      </div>
      <List
        className="max-h-96 overflow-y-auto"
        itemLayout="horizontal"
        dataSource={notifications}
        renderItem={(item) => (
          <List.Item 
            className={`px-4 cursor-pointer hover:bg-accent transition-colors border-b border-[#2e2e2e] last:border-0 ${!item.read ? 'bg-[#252525]' : ''}`}
          >
            <List.Item.Meta
              title={<span className="text-foreground text-sm font-medium">{item.title}</span>}
              description={
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-xs">{item.description}</span>
                  <span className="text-muted-foreground text-[10px] mt-1">{item.time}</span>
                </div>
              }
            />
          </List.Item>
        )}
      />
      <div className="p-2 text-center border-t border-[#2e2e2e]">
        <button className="text-xs text-muted-foreground hover:text-foreground bg-transparent border-none cursor-pointer">
          View all notifications
        </button>
      </div>
    </div>
  );

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => setIsProfileModalOpen(true),
    },
    // {
    //   key: 'settings',
    //   icon: <SettingOutlined />,
    //   label: 'Settings',
    // },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: handleLogout,
    },
  ];
  return (
    <Header
      className="flex items-center justify-end px-6 border-b border-border"
      style={{ background: '#0a0a0a', height: 64 }}
    >
      {/* <div className="flex items-center gap-6">
        <h2 className="text-xl font-semibold text-foreground m-0">{title}</h2>
      </div> */}

      <div className="flex items-center gap-4">
        <Input
          prefix={<SearchOutlined className="text-muted-foreground" />}
          placeholder="Search..."
          className="w-64"
          style={{
            background: '#1a1a1a',
            borderColor: '#2e2e2e',
          }}
        />

        <Dropdown 
          dropdownRender={() => notificationMenu} 
          trigger={['click']} 
          placement="bottomRight"
        >
          <Badge count={notifications.filter(n => !n.read).length} size="small">
            <button className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
              <BellOutlined className="text-lg" />
            </button>
          </Badge>
        </Dropdown>

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
          <div className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-accent transition-colors">
            <Avatar
              size={36}
              icon={<UserOutlined />}
              style={{ background: '#2e2e2e' }}
            />
            <div className="hidden md:block">
              <p className="text-foreground text-sm font-medium m-0">{user.username}</p>
              <p className="text-muted-foreground text-xs m-0">{user.email}</p>
            </div>
          </div>
        </Dropdown>
      </div>
      <Modal
        title="Profile"
        open={isProfileModalOpen}
        onCancel={() => setIsProfileModalOpen(false)}
        footer={null}
      >
        <div className="flex flex-col items-center">
          <Avatar
            size={64}
            icon={<UserOutlined />}
            style={{ background: '#2e2e2e' }}
          />
          <p className="text-foreground text-lg font-medium mt-4">{user.username}</p>
          <p className="text-muted-foreground text-sm">{user.email}</p>
        </div>
      </Modal>
    </Header>
  );
};
