import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Select,
  message,
  Card,
  Descriptions,
  Input,
} from 'antd';
import {
  EyeOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { AdminLayout } from '../components/layout/AdminLayout';
import { mockOrders } from '../data/mockData';
import { ordersApi } from '../services/api';

const statusColors = {
  pending: 'orange',
  processing: 'blue',
  shipped: 'cyan',
  delivered: 'green',
  cancelled: 'red',
};

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await ordersApi.getAll();
      setOrders(data);
    } catch (error) {
      message.error('Failed to fetch orders');
      // Transform existing mockOrders into API-like shape as fallback
      setOrders(
        mockOrders.map((m, idx) => ({
          order_id: idx + 1000,
          user_id: idx + 1,
          email: m.customerEmail,
          total_amount: m.total,
          status: m.status,
          payment_status: m.status === 'delivered' ? 'paid' : 'pending',
          created_at: m.createdAt,
          items_count: m.products?.length || 0,
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      String(o.order_id).toLowerCase().includes(searchText.toLowerCase()) ||
      (o.email || '').toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = !statusFilter || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = (orderId, newStatus) => {
    setOrders(
      orders.map((o) => (o.order_id === orderId ? { ...o, status: newStatus } : o))
    );
    if (selectedOrder?.order_id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
    message.success(`Order status updated to ${newStatus}`);
  };

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'order_id',
      key: 'order_id',
      render: (id) => <span className="font-mono text-foreground">{id}</span>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Items',
      dataIndex: 'items_count',
      key: 'items_count',
    },
    {
      title: 'Total',
      dataIndex: 'total_amount',
      key: 'total_amount',
      sorter: (a, b) => a.total_amount - b.total_amount,
      render: (total) => <span className="font-semibold">${Number(total || 0).toFixed(2)}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Select
          value={status}
          onChange={(value) => handleUpdateStatus(record.order_id, value)}
          style={{ width: 130 }}
          size="small"
        >
          {statusOptions.map((opt) => (
            <Select.Option key={opt.value} value={opt.value}>
              <Tag color={statusColors[opt.value]} className="m-0">
                {opt.label}
              </Tag>
            </Select.Option>
          ))}
        </Select>
      ),
    },
    // {
    //   title: 'Payment',
    //   dataIndex: 'payment_status',
    //   key: 'payment_status',
    // },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => handleViewOrder(record)}
          className="text-muted-foreground hover:text-foreground"
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <AdminLayout title="Orders">
      <Card className="border-border" style={{ background: '#111111' }}>
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="flex gap-4">
            <Input
              placeholder="Search orders..."
              prefix={<SearchOutlined className="text-muted-foreground" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="max-w-xs"
              allowClear
            />
            <Select
              placeholder="Filter by status"
              allowClear
              onChange={setStatusFilter}
              style={{ width: 150 }}
            >
              {statusOptions.map((opt) => (
                <Select.Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="order_id"
          className="admin-table"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={`Order ${selectedOrder?.order_id}`}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalOpen(false)}>
            Close
          </Button>,
        ]}
        width={700}
      >
        {selectedOrder && (
          <div className="space-y-6">
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="User ID">{selectedOrder.user_id}</Descriptions.Item>
              <Descriptions.Item label="Email">{selectedOrder.email}</Descriptions.Item>
              <Descriptions.Item label="Status" span={2}>
                <Tag color={statusColors[selectedOrder.status]} className="capitalize">
                  {selectedOrder.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Payment Status">{selectedOrder.payment_status}</Descriptions.Item>
              <Descriptions.Item label="Order Date">{selectedOrder.created_at}</Descriptions.Item>
              <Descriptions.Item label="Total">
                <span className="font-bold text-lg">${Number(selectedOrder.total_amount || 0).toFixed(2)}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Items Count">{selectedOrder.items_count}</Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
};

export default Orders;
