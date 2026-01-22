import { Layout, Input, Avatar, Dropdown, Badge } from 'antd';
import {
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const { Header } = Layout;

const userMenuItems = [
  {
    key: 'profile',
    icon: <UserOutlined />,
    label: 'Profile',
  },
  {
    key: 'settings',
    icon: <SettingOutlined />,
    label: 'Settings',
  },
  {
    type: 'divider',
  },
  {
    key: 'logout',
    icon: <LogoutOutlined />,
    label: 'Logout',
    danger: true,
  },
];

export const AdminHeader = ({ title }) => {
  return (
    <Header
      className="flex items-center justify-between px-6 border-b border-border"
      style={{ background: '#0a0a0a', height: 64 }}
    >
      <div className="flex items-center gap-6">
        <h2 className="text-xl font-semibold text-foreground m-0">{title}</h2>
      </div>

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

        <Badge count={3} size="small">
          <button className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
            <BellOutlined className="text-lg" />
          </button>
        </Badge>

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
          <div className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-accent transition-colors">
            <Avatar
              size={36}
              icon={<UserOutlined />}
              style={{ background: '#2e2e2e' }}
            />
            <div className="hidden md:block">
              <p className="text-foreground text-sm font-medium m-0">Admin User</p>
              <p className="text-muted-foreground text-xs m-0">admin@store.com</p>
            </div>
          </div>
        </Dropdown>
      </div>
    </Header>
  );
};
