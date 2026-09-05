import { Layout, Input, Avatar, Dropdown, Badge, Modal, List, Typography, Button, Popconfirm, message } from 'antd';
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { notificationsApi, couponsApi } from '../../services/api';
import { formatAdminDate } from '../../utils/date';
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

  const [notifications, setNotifications] = useState([]);

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
    window.location.replace('/login');
  };

  const markAllAsRead = async () => {
    await notificationsApi.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
  };

  const parseMeta = (item) => {
    try {
      return item.metadata_json ? JSON.parse(item.metadata_json) : {};
    } catch {
      return {};
    }
  };

  // After acting on a coupon-limit notification, mark it read and drop it from the list.
  const resolveNotification = async (notificationId) => {
    try {
      await notificationsApi.markAsRead(notificationId);
    } catch { /* non-fatal */ }
    setNotifications(prev => prev.filter(n => n.notification_id !== notificationId));
  };

  const handleDeactivateCoupon = async (couponId, notificationId) => {
    try {
      const coupon = await couponsApi.getById(couponId);
      await couponsApi.update(couponId, { ...coupon, status: 'inactive' });
      message.success('Coupon deactivated');
      await resolveNotification(notificationId);
    } catch (err) {
      message.error(err.message || 'Could not deactivate coupon');
    }
  };

  const handleDeleteCoupon = async (couponId, notificationId) => {
    try {
      await couponsApi.delete(couponId);
      message.success('Coupon deleted');
      await resolveNotification(notificationId);
    } catch (err) {
      message.error(err.message || 'Could not delete coupon');
    }
  };

  useEffect(() => {
    let active = true;
    const loadUnread = () => {
      notificationsApi.getUnread().then(list => {
        if (active) setNotifications(list || []);
      }).catch(() => {});
    };
    loadUnread();
    // HTTP fallback: keep notifications fresh even if the realtime socket can't
    // connect (e.g. WebSocket blocked by the reverse proxy).
    const pollId = setInterval(loadUnread, 30000);

    const base = import.meta.env.VITE_BACKEND_SERVER_URL;
    const token = localStorage.getItem('token');

    // NOTE: Plesk / shared-hosting reverse proxies sometimes don't forward
    // the /socket.io path to Node (or strip the Upgrade: websocket header).
    // In those cases the client CANNOT establish a socket — and if we let
    // socket.io's default "reconnect forever" run, the browser will spam
    // console with CORS errors (because the request lands on Plesk's default
    // 404 landing page instead of Node).  To keep the admin panel usable
    // when the proxy is misconfigured, we cap reconnect attempts, back off
    // aggressively, and silence socket's built-in error logging.
    let reconnectAttempts = 0;
    const MAX_RECONNECT_ATTEMPTS = 3;
    const socket = io(base, {
      auth: token ? { token } : { role: 'admin' },
      transports: ['polling', 'websocket'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 15000,
      randomizationFactor: 0.5,
      timeout: 10000,
      forceNew: true,
    });

    socket.on('new-notification', (n) => {
      setNotifications(prev => [n, ...prev]);
    });

    socket.on('reconnect_attempt', (n) => {
      reconnectAttempts = n;
      // Intentionally silent — don't spam toast notifications for retries.
    });

    socket.io.on('reconnect_failed', () => {
      // Socket tried 3 times and still couldn't reach Node's /socket.io.
      // The admin panel keeps working via the HTTP fallback poll, so this is
      // non-fatal.  Do NOT keep retrying forever — that's what was flooding
      // the console with CORS errors.
      try { socket.disconnect(); } catch {}
    });

    // Silence the "polling-xhr closed" / "xhr poll error" noise. Socket.io
    // already handles these internally; the repeated console warnings were
    // part of what made the devtools output look broken.
    socket.on('connect_error', () => { /* silent */ });
    socket.on('error', () => { /* silent */ });

    return () => {
      active = false;
      clearInterval(pollId);
      try { socket.close(); } catch {}
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const notificationMenu = (
    <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-lg shadow-xl w-96 overflow-hidden">
      <div className="px-4 py-3 border-b border-[#2e2e2e] flex justify-between items-center">
        <h3 className="text-foreground font-semibold m-0 text-sm">
          Notifications {unreadCount > 0 && <span className="text-muted-foreground font-normal">({unreadCount})</span>}
        </h3>
        <button
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          className="text-xs text-primary hover:underline bg-transparent border-none cursor-pointer disabled:opacity-40 disabled:cursor-default disabled:no-underline"
        >
          Mark all as read
        </button>
      </div>
      <List
        className="max-h-96 overflow-y-auto"
        itemLayout="horizontal"
        dataSource={notifications}
        locale={{ emptyText: <div className="py-10 text-center text-muted-foreground text-sm">You&apos;re all caught up</div> }}
        renderItem={(item) => (
          <List.Item
            className={`!px-4 !py-3 cursor-pointer hover:bg-accent transition-colors border-b border-[#2e2e2e] last:border-0 ${!item.is_read ? 'bg-[#252525]' : ''}`}
            onClick={async () => {
              if (!item.is_read) {
                await notificationsApi.markAsRead(item.notification_id);
                setNotifications(prev => prev.map(n => n.notification_id === item.notification_id ? { ...n, is_read: 1 } : n));
              }
            }}
          >
            <div className="flex w-full gap-2">
              <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${!item.is_read ? 'bg-primary' : 'bg-transparent'}`} />
              <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                <span className="text-foreground text-sm font-medium">{item.title}</span>
                <span className="text-muted-foreground text-xs break-words">{item.message}</span>
                <span className="text-muted-foreground text-[10px] mt-0.5">{formatAdminDate(item.created_at)}</span>
                {item.type === 'coupon_limit_reached' && parseMeta(item).couponId && (
                  <div className="flex gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="small"
                      onClick={() => handleDeactivateCoupon(parseMeta(item).couponId, item.notification_id)}
                    >
                      Deactivate
                    </Button>
                    <Popconfirm
                      title="Delete this coupon?"
                      okText="Delete"
                      cancelText="Cancel"
                      onConfirm={() => handleDeleteCoupon(parseMeta(item).couponId, item.notification_id)}
                    >
                      <Button size="small" danger>Delete</Button>
                    </Popconfirm>
                  </div>
                )}
              </div>
            </div>
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
          <Badge count={notifications.filter(n => !n.is_read).length} size="small">
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
