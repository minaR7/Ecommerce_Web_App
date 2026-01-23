import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Card,
  Avatar,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { AdminLayout } from '../components/layout/AdminLayout';
import { mockUsers } from '../data/mockData';
import { usersApi } from '../services/api';
import { AppButton } from '../components/AppButton';
import { formatAdminDate } from '../utils/date';

const roleColors = {
  admin: 'purple',
  moderator: 'blue',
  customer: 'default',
};

const statusColors = {
  active: 'green',
  inactive: 'default',
  banned: 'red',
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await usersApi.getAdmins();
      setUsers(data);
    } catch (error) {
      message.error('Failed to fetch users');
      // Fallback: map existing mockUsers into API-like shape
      setUsers(
        mockUsers.filter((u) => u.role === 'admin').map((u) => {
          const [firstName, ...rest] = (u.name || '').split(' ');
          return {
            user_id: Number(u.id),
            first_name: firstName || u.name || '',
            last_name: rest.join(' '),
            email: u.email,
            address: '',
            created_at: u.createdAt || '',
            is_registered: true,
            username: u.email?.split('@')[0] || u.name || '',
            is_admin: true,
          };
        })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filteredUsers = users.filter(
    (u) =>
      (u.first_name || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (u.last_name || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchText.toLowerCase())
  );

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setUsers(users.filter((u) => u.user_id !== id));
    message.success('User deleted successfully');
  };

  const handleSubmit = (values) => {
    if (editingUser) {
      setUsers(
        users.map((u) =>
          u.user_id === editingUser.user_id ? { ...u, ...values } : u
        )
      );
      message.success('User updated successfully');
    } else {
      const newUser = {
        ...values,
        user_id: Date.now(),
        created_at: new Date().toISOString(),
        is_registered: true,
      };
      setUsers([newUser, ...users]);
      message.success('User added successfully');
    }
    setIsModalOpen(false);
    form.resetFields();
  };

  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            icon={<UserOutlined />}
            style={{
              background:
                record.is_admin
                  ? '#722ed1'
                  : '#1890ff'
            }}
          />
          <div>
            <p className="text-foreground font-medium m-0">{record.first_name} {record.last_name}</p>
            <p className="text-foreground font-medium m-0">{}</p>
            <p className="text-muted-foreground text-sm m-0">{record.email}</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'is_admin',
      key: 'is_admin',
      filters: [
        { text: 'Admin', value: true },
        { text: 'Customer', value: false },
      ],
      onFilter: (value, record) => record.is_admin === value,
      render: (isAdmin) => {
        const label = isAdmin ? 'admin' : 'customer';
        return (
          <Tag
            color={isAdmin ? roleColors.admin : roleColors.customer}
            className="capitalize"
          >
            {label}
          </Tag>
        );
      },
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Registered',
      dataIndex: 'is_registered',
      key: 'is_registered',
      render: (val) => (val ? 'Yes' : 'No'),
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (val) => formatAdminDate(val),
    },
    // {
    //   title: 'Status',
    //   dataIndex: 'status',
    //   key: 'status',
    //   render: (status) => (
    //     <Tag color={statusColors[status]} className="capitalize">
    //       {status}
    //     </Tag>
    //   ),
    // },
    // {
    //   title: 'Orders',
    //   dataIndex: 'totalOrders',
    //   key: 'totalOrders',
    //   sorter: (a, b) => a.totalOrders - b.totalOrders,
    // },
    // {
    //   title: 'Last Login',
    //   dataIndex: 'lastLogin',
    //   key: 'lastLogin',
    // },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            className="text-muted-foreground hover:text-foreground"
          />
          <Popconfirm
            title="Delete user?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record.user_id)}
            okText="Delete"
            cancelText="Cancel"
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              className="text-muted-foreground hover:text-destructive"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout title="Users">
      <Card className="border-border" style={{ background: '#111111' }}>
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <Input
            placeholder="Search users..."
            prefix={<SearchOutlined className="text-muted-foreground" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="max-w-xs"
            allowClear
          />
          <AppButton
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            style={{ color: '#000', fontWeight: 500 }}
          >
            Add User
          </AppButton>
        </div>

        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="user_id"
          className="admin-table"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingUser ? 'Edit User' : 'Add User'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">
          <Form.Item
            name="first_name"
            label="First Name"
            rules={[{ required: true, message: 'Please enter first name' }]}
          >
            <Input placeholder="Enter first name" />
          </Form.Item>

          <Form.Item
            name="last_name"
            label="Last Name"
            rules={[{ required: true, message: 'Please enter last name' }]}
          >
            <Input placeholder="Enter last name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>

          <Form.Item
            name="address"
            label="Address"
          >
            <Input placeholder="Enter address" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="is_admin"
              label="Role"
              rules={[{ required: true, message: 'Please select role' }]}
            >
              <Select placeholder="Select role">
                <Select.Option value={false}>Customer</Select.Option>
                <Select.Option value={true}>Admin</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <AppButton onClick={() => setIsModalOpen(false)}>Cancel</AppButton>
            <AppButton type="primary" htmlType="submit" style={{ color: '#000', fontWeight: 500 }}>
              {editingUser ? 'Update' : 'Add'} User
            </AppButton>
          </div>
        </Form>
      </Modal>
    </AdminLayout>
  );
};

export default Users;
