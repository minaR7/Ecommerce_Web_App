
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import AdminLayout from '../components/layout/AdminLayout';
import { pagesApi } from '../services/api';

const { Title } = Typography;
const { TextArea } = Input;

const PageEditor = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  const { data: page, isLoading } = useQuery({
    queryKey: ['page', slug],
    queryFn: () => pagesApi.getBySlug(slug),
    enabled: !!slug,
  });

  const updateMutation = useMutation({
    mutationFn: (data) => pagesApi.update(slug, data),
    onSuccess: () => {
      message.success('Page updated successfully');
      queryClient.invalidateQueries(['pages']);
      navigate('/pages');
    },
    onError: (error) => {
      message.error(`Failed to update page: ${error.message}`);
    },
  });

  useEffect(() => {
    if (page) {
      form.setFieldsValue({
        title: page.title,
        content: page.content,
      });
    }
  }, [page, form]);

  const onFinish = (values) => {
    updateMutation.mutate(values);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/pages')}
              type="text"
            />
            <div>
              <Title level={2}>Edit Page</Title>
              <p className="text-gray-400">Editing: {page?.title || slug}</p>
            </div>
          </div>
          <Button 
            type="primary" 
            icon={<SaveOutlined />} 
            onClick={() => form.submit()}
            loading={updateMutation.isPending}
          >
            Save Changes
          </Button>
        </div>

        <Card className="bg-[#141414] border-gray-800" loading={isLoading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
          >
            <Form.Item
              name="title"
              label="Page Title"
              rules={[{ required: true, message: 'Please enter page title' }]}
            >
              <Input placeholder="Page Title" />
            </Form.Item>

            <Form.Item
              name="content"
              label="Content"
              rules={[{ required: true, message: 'Please enter page content' }]}
            >
              <TextArea 
                rows={20} 
                placeholder="Enter page content (HTML supported if rendered on client)" 
                className="font-mono"
              />
            </Form.Item>
          </Form>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default PageEditor;
