import { useState, useEffect } from 'react';
import { Table, Modal, Form, Input, Select, Space, message, Popconfirm, Upload } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { AdminLayout } from '../components/layout/AdminLayout';
import { categoriesApi } from '../services/api';
import { AppButton } from '../components/AppButton';
import { mockCategories } from '../data/mockData';
import { formatAdminDate } from '../utils/date';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoriesApi.getAll();
      setCategories(data);
    } catch (error) {
      message.error('Failed to fetch categories');
      // setCategories(mockCategories);
      setCategories();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleAdd = () => { setEditingCategory(null); form.resetFields(); setFileList([]); setIsModalOpen(true); };
  const handleEdit = (record) => { 
    setEditingCategory(record); 
    console.log(record)
    form.setFieldsValue(record); 

    const imageUrl =
      record.cover_img ||
      (record.img
        ? `${import.meta.env.VITE_API_URL}/${record.img}`
        : null);

    if (imageUrl) {
      setFileList([{
        uid: '-1',
        name: 'image.jpg',
        status: 'done',
        url: imageUrl,
      }]);
    } else {
      setFileList([]);
    }
    
    setIsModalOpen(true); 
  };
  const handleDelete = async (id) => {
    try { await categoriesApi.delete(id); message.success('Deleted'); fetchCategories(); }
    catch { setCategories(categories?.filter(c => c.category_id !== id)); }
  };

  const handleSubmit = async (values) => {
    // const imageUrl = fileList[0]?.url || fileList[0]?.response?.url || (fileList[0]?.originFileObj ? URL.createObjectURL(fileList[0].originFileObj) : undefined);
    // const payload = { ...values, img: imageUrl };
    try {
      // if (editingCategory) await categoriesApi.update(editingCategory.category_id, payload);
      // else await categoriesApi.create(payload);
      // setIsModalOpen(false); fetchCategories();
      const hasNewFile = !!fileList[0]?.originFileObj;
      if (editingCategory) {
        if (hasNewFile) {
          const formData = new FormData();
          console.log(values)
          formData.append('name', values.name);
          formData.append('description', values.description || '');
          formData.append('image', fileList[0].originFileObj);
          await categoriesApi.update(editingCategory.category_id, formData);
        } else {
          const payload = {
            name: values.name,
            description: values.description || '',
            img: fileList[0]?.url || null,
          };
          await categoriesApi.update(editingCategory.category_id, payload);
        }
      } else {
        if (!hasNewFile) {
          message.error('Please upload a category image');
          return;
        }
        const formData = new FormData();
        console.log(values)
        formData.append('name', values.name);
        formData.append('description', values.description || '');
        formData.append('image', fileList[0].originFileObj);
        await categoriesApi.create(formData);
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      // if (editingCategory) setCategories(categories.map(c => c.category_id === editingCategory.category_id ? { ...c, ...payload } : c));
      // else setCategories([...categories, { category_id: Date.now(), ...payload, created_at: new Date().toISOString() }]);
      setIsModalOpen(false);
      message.error(err.message || 'Failed to save category');
    }
  };
  
  const handleUploadChange = async ({ file, fileList: newFileList }) => {
    if (newFileList.length > 1) return;
    setFileList(newFileList);
    // if (file && file.status === 'done' && file.response?.url) {
    //   return;
    // }
    // if (file && file.originFileObj) {
    //   try {
    //     const res = await categoriesApi.upload(file.originFileObj);
    //     const updated = [{
    //       uid: file.uid,
    //       name: file.name,
    //       status: 'done',
    //       url: `${import.meta.env.VITE_API_URL}/${res.url}`,
    //     }];
    //     setFileList(updated);
    //   } catch {
    //     message.error('Upload failed');
    //   }
    // }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: 'Created At', dataIndex: 'created_at', key: 'created_at', render: (v) => formatAdminDate(v) },
    { title: 'Updated At', dataIndex: 'updated_at', key: 'updated_at', render: (v) => formatAdminDate(v) },
    // { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <span className={`px-2 py-1 rounded-full text-xs ${s === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>{s}</span> },
    { title: 'Actions', key: 'actions', render: (_, r) => (
      <Space>
        <AppButton type="text" icon={<EditOutlined />} onClick={() => handleEdit(r)} />
        <Popconfirm title="Delete?" onConfirm={() => handleDelete(r.category_id)} okButtonProps={{ style: { backgroundColor: '#fff', color: '#000' } }}>
          <AppButton type="text" icon={<DeleteOutlined />} className="text-red-400" />
        </Popconfirm>
      </Space>
    )}
  ];

  return (
    <AdminLayout title="Categories">
      <div className="space-y-6">
        <div className="flex justify-between"><div><h1 className="text-2xl font-bold text-foreground">Categories</h1></div>
          <AppButton
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            style={{ color: '#000', fontWeight: 500 }}
          >
            Add Category
          </AppButton>
        </div>
        <div className="bg-card rounded-xl border border-border p-6">
          <Input placeholder="Search..." prefix={<SearchOutlined />} value={searchText} onChange={(e) => setSearchText(e.target.value)} className="max-w-sm mb-4" />
          <Table columns={columns} dataSource={categories?.filter(c => c.name.toLowerCase().includes(searchText.toLowerCase()))} rowKey="category_id" loading={loading} scroll={{ x: 'max-content' }} />
        </div>
        <Modal title={editingCategory ? 'Edit' : 'Add'} open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null}>
          <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ status: 'active' }}>
            <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="description" label="Description"><Input.TextArea rows={3} /></Form.Item>
            <Form.Item label="Cover Image">
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
            {/* <Form.Item name="status" label="Status"><Select><Select.Option value="active">Active</Select.Option><Select.Option value="inactive">Inactive</Select.Option></Select></Form.Item> */}
            <Space>
              <AppButton onClick={() => setIsModalOpen(false)}>Cancel</AppButton>
              <AppButton type="primary" htmlType="submit" style={{ color: '#000', fontWeight: 500 }}>
                {editingCategory ? 'Update' : 'Create'}
              </AppButton>
            </Space>
          </Form>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default Categories;
