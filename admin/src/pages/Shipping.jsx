import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, GlobalOutlined } from '@ant-design/icons';
import { AdminLayout } from '../components/layout/AdminLayout';
import { shippingApi } from '../services/api';
import { AppButton } from '../components/AppButton';
import countries from 'world-countries';

const COUNTRY_OPTIONS = countries
  .map((country) => ({
    code: country.cca2,
    name: country.name.common,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

const Shipping = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  const loadFees = () => {
    setLoading(true);
    return shippingApi.getAll().then(setFees).catch(() => setFees([])).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadFees();
  }, []);

  const handleSubmit = async (values) => {
    const payload = {
      ...values,
      country: COUNTRY_OPTIONS.find((c) => c.code === values.countryCode)?.name,
    };
    try {
      if (editingFee) await shippingApi.update(editingFee.id, payload);
      else await shippingApi.create(payload);
      message.success(editingFee ? 'Shipping rate updated' : 'Shipping rate added');
      await loadFees();
      setIsModalOpen(false);
      form.resetFields();
    } catch (err) {
      message.error(err.message || 'Could not save shipping rate');
    }
  };

  const handleDelete = async (id) => {
    try {
      await shippingApi.delete(id);
      message.success('Deleted');
      await loadFees();
    } catch (err) {
      message.error(err.message || 'Could not delete shipping rate');
    }
  };

  const columns = [
    { title: 'Country', key: 'country', render: (_, r) => <div className="flex items-center gap-2"><GlobalOutlined />{r.country}</div> },
    { title: 'Fee', dataIndex: 'fee', key: 'fee', render: (f) => `$${Number(f).toFixed(2)}` },
    { title: 'Delivery', dataIndex: 'estimatedDays', key: 'estimatedDays' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <span className={`px-2 py-1 rounded-full text-xs ${s === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>{s}</span> },
    { title: 'Actions', key: 'actions', render: (_, r) => (
      <Space>
        <Button type="text" icon={<EditOutlined />} onClick={() => { setEditingFee(r); form.setFieldsValue(r); setIsModalOpen(true); }}   className="text-muted-foreground hover:text-foreground"/>
        <Popconfirm title="Delete?" okText="Delete" cancelText="Cancel"  okButtonProps={{ style: { backgroundColor: '#fff', color: '#000' } }}
         onConfirm={() => handleDelete(r.id)}><Button type="text" icon={<DeleteOutlined />}  className="text-muted-foreground hover:text-destructive"/></Popconfirm>
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
          <Table columns={columns} dataSource={fees.filter(f => (f.country || '').toLowerCase().includes(searchText.toLowerCase()))} rowKey="id" loading={loading} scroll={{ x: 'max-content' }} />
        </div>
        <Modal title={editingFee ? 'Edit' : 'Add'} open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} width={600}>
          <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ status: 'active' }}>
            <div className="grid grid-cols-2 gap-4">
              <Form.Item name="countryCode" label="Country" rules={[{ required: true }]}>
                <Select
                  disabled={!!editingFee}
                  showSearch
                  placeholder="Select a country"
                  optionFilterProp="children"
                >
                  {COUNTRY_OPTIONS.map((c) => (
                    <Select.Option key={c.code} value={c.code}>
                      {c.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="fee" label="Fee (USD)" rules={[{ required: true }]}><InputNumber className="w-full" min={0} precision={2}  style={{ width: '100%' }} /></Form.Item>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Form.Item name="estimatedDays" label="Delivery Time" rules={[{ required: true }]}><Input placeholder="e.g., 5-7 days" /></Form.Item>
              <Form.Item name="status" label="Status"><Select><Select.Option value="active">Active</Select.Option><Select.Option value="inactive">Inactive</Select.Option></Select></Form.Item>
            </div>
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
