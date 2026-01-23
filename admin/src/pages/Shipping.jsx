import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, GlobalOutlined } from '@ant-design/icons';
import { AdminLayout } from '../components/layout/AdminLayout';
import { shippingApi } from '../services/api';
import { AppButton } from '../components/AppButton';

const COUNTRIES = [{ code: 'US', name: 'United States' }, { code: 'CA', name: 'Canada' }, { code: 'GB', name: 'United Kingdom' }, { code: 'DE', name: 'Germany' }, { code: 'FR', name: 'France' }];

const Shipping = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    setLoading(true);
    shippingApi.getAll().then(setFees).catch(() => setFees([
      { id: '1', country: 'United States', countryCode: 'US', fee: 9.99, estimatedDays: '5-7 days', status: 'active' }
    ])).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (values) => {
    const payload = { ...values, country: COUNTRIES.find(c => c.code === values.countryCode)?.name };
    try {
      if (editingFee) await shippingApi.update(editingFee.id, payload);
      else await shippingApi.create(payload);
      setIsModalOpen(false);
    } catch {
      if (editingFee) setFees(fees.map(f => f.id === editingFee.id ? { ...f, ...payload } : f));
      else setFees([...fees, { id: Date.now().toString(), ...payload }]);
      setIsModalOpen(false);
    }
  };

  const columns = [
    { title: 'Country', key: 'country', render: (_, r) => <div className="flex items-center gap-2"><GlobalOutlined />{r.country}</div> },
    { title: 'Fee', dataIndex: 'fee', key: 'fee', render: (f) => `$${f.toFixed(2)}` },
    { title: 'Delivery', dataIndex: 'estimatedDays', key: 'estimatedDays' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <span className={`px-2 py-1 rounded-full text-xs ${s === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>{s}</span> },
    { title: 'Actions', key: 'actions', render: (_, r) => (
      <Space>
        <Button type="text" icon={<EditOutlined />} onClick={() => { setEditingFee(r); form.setFieldsValue(r); setIsModalOpen(true); }} />
        <Popconfirm title="Delete?" onConfirm={() => setFees(fees.filter(f => f.id !== r.id))}><Button type="text" icon={<DeleteOutlined />} className="text-red-400" /></Popconfirm>
      </Space>
    )}
  ];

  return (
    <AdminLayout title="Shipping">
      <div className="space-y-6">
        <div className="flex justify-between"><h1 className="text-2xl font-bold text-foreground">Shipping Fees</h1>
          <AppButton
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => { setEditingFee(null); form.resetFields(); setIsModalOpen(true); }}
            style={{ color: '#000', fontWeight: 500 }}
          >
            Add
          </AppButton>
        </div>
        <div className="bg-card rounded-xl border border-border p-6">
          <Input placeholder="Search..." prefix={<SearchOutlined />} value={searchText} onChange={(e) => setSearchText(e.target.value)} className="max-w-sm mb-4" />
          <Table columns={columns} dataSource={fees.filter(f => f.country.toLowerCase().includes(searchText.toLowerCase()))} rowKey="id" loading={loading} />
        </div>
        <Modal title={editingFee ? 'Edit' : 'Add'} open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null}>
          <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ status: 'active' }}>
            <Form.Item name="countryCode" label="Country" rules={[{ required: true }]}><Select disabled={!!editingFee}>{COUNTRIES.map(c => <Select.Option key={c.code} value={c.code}>{c.name}</Select.Option>)}</Select></Form.Item>
            <Form.Item name="fee" label="Fee (USD)" rules={[{ required: true }]}><InputNumber className="w-full" min={0} precision={2} /></Form.Item>
            <Form.Item name="estimatedDays" label="Delivery Time" rules={[{ required: true }]}><Input placeholder="e.g., 5-7 days" /></Form.Item>
            <Form.Item name="status" label="Status"><Select><Select.Option value="active">Active</Select.Option><Select.Option value="inactive">Inactive</Select.Option></Select></Form.Item>
            <Space>
              <AppButton onClick={() => setIsModalOpen(false)}>Cancel</AppButton>
              <AppButton type="primary" htmlType="submit" style={{ color: '#000', fontWeight: 500 }}>
                {editingFee ? 'Update' : 'Create'}
              </AppButton>
            </Space>
          </Form>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default Shipping;
