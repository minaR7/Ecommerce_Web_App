
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, Button, Card, Typography, Space } from 'antd';
import { EditOutlined, FileTextOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import { pagesApi } from '../services/api';

const { Title } = Typography;

const Pages = () => {
  const navigate = useNavigate();

  const { data: pages, isLoading } = useQuery({
    queryKey: ['pages'],
    queryFn: async () => {
      return await pagesApi.getAll();
    },
  });

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
    },
    {
      title: 'Last Updated',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<EditOutlined />} 
          onClick={() => navigate(`/pages/edit/${record.slug}`)}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Title level={2}>Site Content</Title>
            <p className="text-gray-400">Manage static page content</p>
          </div>
        </div>

        <Card className="bg-[#141414] border-gray-800">
          <Table
            columns={columns}
            dataSource={pages}
            rowKey="id"
            loading={isLoading}
            pagination={false}
            scroll={{ x: 'max-content' }}
          />
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Pages;
