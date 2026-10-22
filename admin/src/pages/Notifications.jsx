import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Segmented, Select, Pagination, Button, Popconfirm, Spin, Empty, Tooltip, message } from 'antd';
import { CheckOutlined, DeleteOutlined, ReloadOutlined, RightOutlined } from '@ant-design/icons';
import { AdminLayout } from '../components/layout/AdminLayout';
import { notificationsApi } from '../services/api';
import { formatAdminDate } from '../utils/date';
import {
  NOTIFICATION_TYPES,
  NOTIFICATIONS_CHANGED,
  announceNotificationsChanged,
  notificationLink,
  notificationTypeInfo,
} from '../utils/notifications';

const PAGE_SIZE = 20;

const Notifications = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('all');
  const [type, setType] = useState(null);
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0, unread: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await notificationsApi.list({ status, type, page, pageSize: PAGE_SIZE });
      setData({ items: res.items || [], total: res.total || 0, unread: res.unread || 0 });
    } catch (err) {
      setError(err.message || 'Could not load notifications');
    } finally {
      setLoading(false);
    }
  }, [status, type, page]);

  useEffect(() => { load(); }, [load]);

  // New notifications or changes made from the header bell.
  useEffect(() => {
    window.addEventListener(NOTIFICATIONS_CHANGED, load);
    return () => window.removeEventListener(NOTIFICATIONS_CHANGED, load);
  }, [load]);

  const changeFilter = (setter) => (value) => { setter(value); setPage(1); };

  const markRead = async (item) => {
    if (item.is_read) return;
    try {
      await notificationsApi.markAsRead(item.notification_id);
      setData((d) => ({
        ...d,
        unread: Math.max(0, d.unread - 1),
        items: status === 'unread'
          ? d.items.filter((n) => n.notification_id !== item.notification_id)
          : d.items.map((n) => (n.notification_id === item.notification_id ? { ...n, is_read: true } : n)),
      }));
      announceNotificationsChanged();
    } catch (err) {
      message.error(err.message || 'Could not mark as read');
    }
  };

  const open = async (item) => {
    await markRead(item);
    const link = notificationLink(item);
    if (link) navigate(link);
  };

  const markAll = async () => {
    try {
      await notificationsApi.markAllAsRead();
      message.success('All notifications marked as read');
      announceNotificationsChanged();
      await load();
    } catch (err) {
      message.error(err.message || 'Could not mark all as read');
    }
  };

  const remove = async (item) => {
    try {
      await notificationsApi.remove(item.notification_id);
      message.success('Notification deleted');
      announceNotificationsChanged();
      // Step back a page if this was the last item on it.
      if (data.items.length === 1 && page > 1) setPage(page - 1);
      else await load();
    } catch (err) {
      message.error(err.message || 'Could not delete notification');
    }
  };

  const typeOptions = [
    { value: null, label: 'All types' },
    ...Object.entries(NOTIFICATION_TYPES).map(([value, t]) => ({ value, label: t.label })),
  ];

  return (
    <AdminLayout title="Notifications">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground m-0">Notifications</h1>
            <p className="text-muted-foreground text-sm m-0 mt-1">
              {data.unread > 0 ? `${data.unread} unread` : 'You’re all caught up'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>Refresh</Button>
            <Button icon={<CheckOutlined />} onClick={markAll} disabled={data.unread === 0}>Mark all as read</Button>
          </div>
        </div>

        <Card className="border-border" style={{ background: 'hsl(var(--card))' }}>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Segmented
              value={status}
              onChange={changeFilter(setStatus)}
              options={[
                { value: 'all', label: 'All' },
                { value: 'unread', label: `Unread${data.unread ? ` (${data.unread})` : ''}` },
                { value: 'read', label: 'Read' },
              ]}
            />
            <Select value={type} onChange={changeFilter(setType)} options={typeOptions} style={{ minWidth: 180 }} />
          </div>

          {error ? (
            <div className="py-10 text-center">
              <p className="text-red-400 mb-3">{error}</p>
              <Button onClick={load}>Try again</Button>
            </div>
          ) : (
            <Spin spinning={loading}>
              {data.items.length === 0 && !loading ? (
                <Empty
                  className="py-10"
                  description={<span className="text-muted-foreground">
                    {status === 'unread' ? 'No unread notifications' : 'No notifications match these filters'}
                  </span>}
                />
              ) : (
                <ul className="m-0 p-0 list-none divide-y divide-border">
                  {data.items.map((item) => {
                    const info = notificationTypeInfo(item.type);
                    const Icon = info.icon;
                    const link = notificationLink(item);
                    return (
                      <li
                        key={item.notification_id}
                        className={`flex items-start gap-3 py-3 px-2 rounded-md ${link ? 'cursor-pointer hover:bg-accent' : ''} ${!item.is_read ? 'bg-accent/50' : ''}`}
                        onClick={() => link && open(item)}
                      >
                        <span
                          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                          style={{ background: `${info.color}22`, color: info.color }}
                        >
                          <Icon />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            {!item.is_read && <span className="h-2 w-2 rounded-full bg-primary" aria-label="Unread" />}
                            <span className={`text-sm text-foreground ${!item.is_read ? 'font-semibold' : 'font-medium'}`}>{item.title}</span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: `${info.color}22`, color: info.color }}>
                              {info.label}
                            </span>
                          </div>
                          <p className="text-muted-foreground text-sm m-0 mt-0.5 break-words">{item.message}</p>
                          <span className="text-muted-foreground text-xs">{formatAdminDate(item.created_at)}</span>
                        </div>
                        <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          {!item.is_read && (
                            <Tooltip title="Mark as read">
                              <Button type="text" size="small" icon={<CheckOutlined />} onClick={() => markRead(item)} aria-label="Mark as read" />
                            </Tooltip>
                          )}
                          <Popconfirm title="Delete this notification?" okText="Delete" cancelText="Cancel" okButtonProps={{ danger: true }} onConfirm={() => remove(item)}>
                            <Button type="text" size="small" icon={<DeleteOutlined />} aria-label="Delete" className="text-muted-foreground" />
                          </Popconfirm>
                          {link && (
                            <Tooltip title="Open">
                              <Button type="text" size="small" icon={<RightOutlined />} onClick={() => open(item)} aria-label="Open" />
                            </Tooltip>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Spin>
          )}

          {data.total > PAGE_SIZE && (
            <div className="flex justify-end mt-4">
              <Pagination current={page} pageSize={PAGE_SIZE} total={data.total} onChange={setPage} showSizeChanger={false} />
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Notifications;
