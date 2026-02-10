import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm, InputNumber, DatePicker } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, CopyOutlined } from '@ant-design/icons';
import { AdminLayout } from '../components/layout/AdminLayout';
import { couponsApi } from '../services/api';
import dayjs from 'dayjs';
import { AppButton } from '../components/AppButton';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const data = await couponsApi.getAll();
      setCoupons(data);
    } catch {
      setCoupons([
        { id: '1', code: 'SUMMER20', discountType: 'percentage', discountValue: 20, usedCount: 45, validFrom: '2024-06-01', validUntil: '2024-08-31', status: 'active' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleSubmit = async (values) => {
    const payload = { 
      ...values, 
      discountType: 'percentage',
      validFrom: values.validFrom.format('YYYY-MM-DD'), 
      validUntil: values.validUntil.format('YYYY-MM-DD') 
    };
    try {
      if (editingCoupon) {
        await couponsApi.update(editingCoupon.id, payload);
        message.success('Coupon updated');
      } else {
        await couponsApi.create({ ...payload, usedCount: 0 });
        message.success('Coupon created');
      }
      await loadCoupons();
      setIsModalOpen(false);
    } catch {
      if (editingCoupon) {
        setCoupons(coupons.map(c => c.id === editingCoupon.id ? { ...c, ...payload } : c));
      } else {
        setCoupons([...coupons, { id: Date.now().toString(), ...payload, usedCount: 0 }]);
      }
      setIsModalOpen(false);
    }
  };

  const columns = [
    { title: 'Code', dataIndex: 'code', key: 'code', render: (c) => <span className="font-mono font-bold">{c}</span> },
    { title: 'Discount', key: 'discount', render: (_, r) => <span className="text-green-400">{r.discountType === 'percentage' ? `${r.discountValue}%` : `$${r.discountValue}`}</span> },
    { title: 'Usage', key: 'usage', render: (_, r) => `${r.usedCount} / ${r.usageLimit || '∞'}` },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <span className={`px-2 py-1 rounded-full text-xs ${s === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>{s}</span> },
    { title: 'Actions', key: 'actions', render: (_, r) => (
      <Space>
        <Button type="text" icon={<EditOutlined />} onClick={() => { setEditingCoupon(r); form.setFieldsValue({ ...r, validFrom: dayjs(r.validFrom), validUntil: dayjs(r.validUntil) }); setIsModalOpen(true); }} />
        <Popconfirm title="Delete?" onConfirm={() => setCoupons(coupons.filter(c => c.id !== r.id))}><Button type="text" icon={<DeleteOutlined />} className="text-red-400" /></Popconfirm>
      </Space>
    )}
  ];

  return (
    <AdminLayout title="Coupons">
      <div className="space-y-6">
        <div className="flex justify-between"><h1 className="text-2xl font-bold text-foreground">Coupons</h1>
          <AppButton
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => { setEditingCoupon(null); form.resetFields(); setIsModalOpen(true); }}
            style={{ color: '#000', fontWeight: 500 }}
          >
            Add
          </AppButton>
        </div>
        <div className="bg-card rounded-xl border border-border p-6">
          <Input placeholder="Search..." prefix={<SearchOutlined />} value={searchText} onChange={(e) => setSearchText(e.target.value)} className="max-w-sm mb-4" />
          <Table columns={columns} dataSource={coupons.filter(c => c.code.toLowerCase().includes(searchText.toLowerCase()))} rowKey="id" loading={loading} scroll={{ x: 'max-content' }} />
        </div>
        <Modal title={editingCoupon ? 'Edit' : 'Add'} open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} width={600}>
          <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ status: 'active' }}>
            <Form.Item name="code" label="Code" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="validFrom" label="From" rules={[{ required: true }]}><DatePicker className="w-full" /></Form.Item>
            <Form.Item name="validUntil" label="Until" rules={[{ required: true }]}><DatePicker className="w-full" /></Form.Item>
            <div className="grid grid-cols-3 gap-4">
              <Form.Item name="discountValue" label="Value" rules={[{ required: true }]}><InputNumber className="w-full" /></Form.Item>
              <Form.Item name="usageLimit" label="Usage Limit" rules={[{ required: false }]}><InputNumber className="w-full" /></Form.Item>
              <Form.Item name="status" label="Status">
                <Select>
                  <Select.Option value="active">Active</Select.Option>
                  <Select.Option value="inactive">Inactive</Select.Option>
                </Select>
              </Form.Item>
            </div>
            <Space>
              <AppButton onClick={() => setIsModalOpen(false)}>Cancel</AppButton>
              <AppButton type="primary" htmlType="submit" style={{ color: '#000', fontWeight: 500 }}>
                {editingCoupon ? 'Update' : 'Create'}
              </AppButton>
            </Space>
          </Form>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default Coupons;
