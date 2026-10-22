import {
  ShoppingCartOutlined,
  SyncOutlined,
  UserAddOutlined,
  WarningOutlined,
  DeleteOutlined,
  GiftOutlined,
  BellOutlined,
} from '@ant-design/icons';

// Shared by the header bell and the Notifications page so both describe and
// link a notification the same way. Types come from the server's notifyAdmins calls.
export const NOTIFICATION_TYPES = {
  order_created: { label: 'New order', icon: ShoppingCartOutlined, color: '#22c55e' },
  order_status_changed: { label: 'Order update', icon: SyncOutlined, color: '#3b82f6' },
  user_registered: { label: 'New customer', icon: UserAddOutlined, color: '#a855f7' },
  stock_low: { label: 'Stock', icon: WarningOutlined, color: '#f59e0b' },
  coupon_limit_reached: { label: 'Coupon', icon: GiftOutlined, color: '#ec4899' },
  product_deleted: { label: 'Product removed', icon: DeleteOutlined, color: '#ef4444' },
};

export const notificationTypeInfo = (type) =>
  NOTIFICATION_TYPES[type] || { label: 'Notice', icon: BellOutlined, color: '#999999' };

export const parseNotificationMeta = (item) => {
  try {
    return item?.metadata_json ? JSON.parse(item.metadata_json) : (item?.meta || {});
  } catch {
    return {};
  }
};

// Where clicking a notification should take the admin (null = nowhere useful).
export const notificationLink = (item) => {
  const meta = parseNotificationMeta(item);
  switch (item?.type) {
    case 'order_created':
    case 'order_status_changed':
      return meta.orderId ? `/orders?order=${meta.orderId}` : '/orders';
    case 'user_registered':
      return '/customers';
    case 'stock_low':
      return '/products';
    case 'coupon_limit_reached':
      return '/coupons';
    default:
      return null;
  }
};

// Fired after any read/delete so the bell and the page stay in sync.
export const NOTIFICATIONS_CHANGED = 'admin-notifications-changed';
export const announceNotificationsChanged = () => window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED));
