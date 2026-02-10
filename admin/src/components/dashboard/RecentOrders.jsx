import { useEffect, useState } from 'react';
import { Card, Table, Tag } from 'antd';
import { mockOrders } from '../../data/mockData';
import { ordersApi } from '../../services/api';
import { formatAdminDate } from '../../utils/date';

const statusColors = {
  pending: 'orange',
  processing: 'blue',
  shipped: 'cyan',
  delivered: 'green',
  cancelled: 'red',
};

const columns = [
  {
    title: 'Order ID',
    dataIndex: 'id',
    key: 'id',
    render: (id) => <span className="font-mono text-foreground">{id}</span>,
  },
  {
    title: 'Customer',
    dataIndex: 'customerName',
    key: 'customerName',
  },
  {
    title: 'Total',
    dataIndex: 'total',
    key: 'total',
    render: (total) => <span className="font-semibold">${total.toFixed(2)}</span>,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status) => (
      <Tag color={statusColors[status]} className="capitalize">
        {status}
      </Tag>
    ),
  },
  {
    title: 'Date',
    dataIndex: 'createdAt',
    key: 'createdAt',
    render: (val) => formatAdminDate(val),
  },
];

export const RecentOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRecentOrders = async () => {
      setLoading(true);
      try {
        const data = await ordersApi.getAll();
        const mapped = Array.isArray(data)
          ? data.map((o) => ({
              id: o.order_id,
              customerName: o.email,
              total: o.total_amount,
              status: o.status,
              createdAt: o.created_at,
            }))
          : [];
        setOrders(mapped.slice(0, 5));
      } catch {
        setOrders(mockOrders.slice(0, 5));
      } finally {
        setLoading(false);
      }
    };

    fetchRecentOrders();
  }, []);

  return (
    <Card
      title={<span className="text-foreground">Recent Orders</span>}
      className="border-border"
      style={{ background: '#111111' }}
      extra={<a className="text-muted-foreground hover:text-foreground transition-colors">View All</a>}
    >
      <Table
        columns={columns}
        dataSource={orders}
        rowKey="id"
        pagination={false}
        loading={loading}
        size="small"
        className="admin-table"
        scroll={{ x: 'max-content' }}
      />
    </Card>
  );
};
