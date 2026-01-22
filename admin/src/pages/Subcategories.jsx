import { useState, useEffect } from 'react';
import { Table, Modal, Form, Input, Select, Space, message, Popconfirm, Upload } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { AdminLayout } from '../components/layout/AdminLayout';
import { subcategoriesApi, categoriesApi } from '../services/api';
import { AppButton } from '../components/AppButton';
import { mockSubcategories, mockCategories } from '../data/mockData';

const Subcategories = () => {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const [subs, cats] = await Promise.all([subcategoriesApi.getAll(), categoriesApi.getAll()]);
      setSubcategories(subs);
      setCategories(cats);
    } catch {
      setCategories(mockCategories);
      setSubcategories(mockSubcategories);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (values) => {
    const imageUrl = fileList[0]?.url || fileList[0]?.response?.url || (fileList[0]?.originFileObj ? URL.createObjectURL(fileList[0].originFileObj) : undefined);
    const payload = { ...values, categoryName: categories.find(c => c.category_id === values.categoryId)?.name, cover_img: imageUrl };
    try {
      if (editingSubcategory) {
        await subcategoriesApi.update(editingSubcategory.subcategory_id, payload);
        message.success('Subcategory updated');
      } else {
        await subcategoriesApi.create(payload);
        message.success('Subcategory created');
      }
      await loadData();
      setIsModalOpen(false);
    } catch {
      if (editingSubcategory) {
        setSubcategories(subcategories.map(s => s.subcategory_id === editingSubcategory.subcategory_id ? { ...s, ...payload } : s));
      } else {
        setSubcategories([...subcategories, { subcategory_id: Date.now(), ...payload }]);
      }
      setIsModalOpen(false);
    }
  };
  
  const handleAdd = () => { setEditingSubcategory(null); form.resetFields(); setFileList([]); setIsModalOpen(true); };
  const handleEditOpen = (record) => { 
    setEditingSubcategory(record); 
    form.setFieldsValue(record); 
    if (record.cover_img) {
      setFileList([{
        uid: '-1',
        name: 'image.jpg',
        status: 'done',
        url: record.cover_img,
      }]);
    } else {
      setFileList([]);
    }
    setIsModalOpen(true); 
  };
  const handleUploadChange = ({ fileList: newFileList }) => {
    if (newFileList.length > 1) return;
    setFileList(newFileList);
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { 
      title: 'Category', 
      key: 'categoryName',
      render: (_, r) => categories.find(c => c.category_id === (r.categoryId || r.category_id))?.name || '-' 
    },
    { title: 'Created At', dataIndex: 'created_at', key: 'created_at' },
    { title: 'Updated At', dataIndex: 'updated_at', key: 'updated_at' },
    //{ title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <span className={`px-2 py-1 rounded-full text-xs ${s === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>{s}</span> },
    { title: 'Actions', key: 'actions', render: (_, r) => (
      <Space>
        <AppButton type="text" icon={<EditOutlined />} onClick={() => handleEditOpen(r)} />
        <Popconfirm title="Delete?" onConfirm={() => setSubcategories(subcategories.filter(s => s.subcategory_id !== (r.subcategory_id || r.id)))}>
          <AppButton type="text" icon={<DeleteOutlined />} className="text-red-400" />
        </Popconfirm>
      </Space>
    )}
  ];

  return (
    <AdminLayout title="Subcategories">
      <div className="space-y-6">
        <div className="flex justify-between"><h1 className="text-2xl font-bold text-foreground">Subcategories</h1>
          <AppButton
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            style={{ color: '#000', fontWeight: 500 }}
          >
            Add
          </AppButton>
        </div>
        <div className="bg-card rounded-xl border border-border p-6">
          <Input placeholder="Search..." prefix={<SearchOutlined />} value={searchText} onChange={(e) => setSearchText(e.target.value)} className="max-w-sm mb-4" />
          <Table columns={columns} dataSource={subcategories.filter(s => s.name.toLowerCase().includes(searchText.toLowerCase()))} rowKey="subcategory_id" loading={loading} />
        </div>
        <Modal title={editingSubcategory ? 'Edit' : 'Add'} open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null}>
          <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ status: 'active' }}>
            <Form.Item name="categoryId" label="Category" rules={[{ required: true }]}><Select>{categories.map(c => <Select.Option key={c.category_id} value={c.category_id}>{c.name}</Select.Option>)}</Select></Form.Item>
            <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item>
            {/* <Form.Item name="status" label="Status"><Select><Select.Option value="active">Active</Select.Option><Select.Option value="inactive">Inactive</Select.Option></Select></Form.Item> */}
            <Form.Item label="Subcategory Image">
              <Upload
                listType="picture-card"
                fileList={fileList}
                onChange={handleUploadChange}
                beforeUpload={() => false}
                maxCount={1}
                accept="image/*"
              >
                {fileList.length >= 1 ? null : (
                  <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-600 rounded-lg hover:border-gray-400 transition-colors cursor-pointer">
                    <PlusOutlined className="text-2xl text-gray-400" />
                    <div className="mt-2 text-gray-400 text-sm">Upload</div>
                  </div>
                )}
              </Upload>
            </Form.Item>
            <Space>
              <AppButton onClick={() => setIsModalOpen(false)}>Cancel</AppButton>
              <AppButton type="primary" htmlType="submit" style={{ color: '#000', fontWeight: 500 }}>
                {editingSubcategory ? 'Update' : 'Create'}
              </AppButton>
            </Space>
          </Form>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default Subcategories;
