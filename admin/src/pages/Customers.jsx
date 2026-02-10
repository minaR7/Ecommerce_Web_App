import { useEffect, useState } from 'react';
import { Table, Card, Input, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { AdminLayout } from '../components/layout/AdminLayout';
import { usersApi } from '../services/api';
import { formatAdminDate } from '../utils/date';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const data = await usersApi.getCustomers();
        setCustomers(Array.isArray(data) ? data : []);
      } catch {
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const filtered = customers.filter(
    (c) =>
      (c.first_name || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (c.last_name || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Customer',
      key: 'customer',
      render: (_, r) => (
        <div>
          <p className="text-foreground font-medium m-0">{r.first_name} {r.last_name}</p>
          <p className="text-muted-foreground text-sm m-0">{r.email}</p>
        </div>
      ),
    },
    {
      title: 'Since',
      dataIndex: 'since',
      key: 'since',
      render: (val) => formatAdminDate(val),
    },
    {
      title: 'Orders',
      dataIndex: 'orders_count',
      key: 'orders_count',
      render: (n) => <Tag>{n}</Tag>,
      sorter: (a, b) => (a.orders_count || 0) - (b.orders_count || 0),
    },
    {
      title: 'Total Spent',
      dataIndex: 'total_spent',
      key: 'total_spent',
      render: (t) => <span className="font-semibold">${Number(t || 0).toFixed(2)}</span>,
      sorter: (a, b) => Number(a.total_spent || 0) - Number(b.total_spent || 0),
    },
  ];

  return (
    <AdminLayout title="Customers">
      <Card className="border-border" style={{ background: '#111111' }}>
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <Input
            placeholder="Search customers..."
            prefix={<SearchOutlined className="text-muted-foreground" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="max-w-xs"
            allowClear
          />
        </div>
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="user_id"
          className="admin-table"
          pagination={{ pageSize: 10 }}
          loading={loading}
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </AdminLayout>
  );
};

export default Customers;
