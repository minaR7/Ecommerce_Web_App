import { useState, useEffect } from 'react';
import {
  Table,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Avatar,
  message,
  Popconfirm,
  Card,
  Upload,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { AdminLayout } from '../components/layout/AdminLayout';
import { mockProducts } from '../data/mockData';
import { categoriesApi, subcategoriesApi, productsApi, colorsApi, sizesApi } from '../services/api';
import { AppButton } from '../components/AppButton';

const statusColors = {
  active: 'green',
  inactive: 'default',
  out_of_stock: 'red',
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [fileList, setFileList] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  
  const [sizeChartUpload, setSizeChartUpload] = useState([]);

  const [form] = Form.useForm();

  // Fetch data function
  const fetchData = async () => {
    try {
      const [prodData, catData, subData, colData, sizeData] = await Promise.all([
        productsApi.getAll(),
        categoriesApi.getAll(),
        subcategoriesApi.getAll(),
        colorsApi.getAll(),
        sizesApi.getAll(),
      ]);
      setProducts(prodData)
      setCategories(catData);
      setSubcategories(subData);
      setColors(colData);
      setSizes(sizeData);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      // Use mock data for demo if API fails
      setProducts(mockProducts)
      setCategories([
        { id: '1', name: 'Electronics', status: 'active' },
        { id: '2', name: 'Clothing', status: 'active' },
        { id: '3', name: 'Home & Garden', status: 'active' },
        { id: '4', name: 'Accessories', status: 'active' },
        { id: '5', name: 'Bags', status: 'active' },
      ]);
      setSubcategories([
        { id: '1', categoryId: '1', name: 'Smartphones', status: 'active' },
        { id: '2', categoryId: '1', name: 'Laptops', status: 'active' },
        { id: '3', categoryId: '1', name: 'Audio', status: 'active' },
        { id: '4', categoryId: '2', name: 'Men', status: 'active' },
        { id: '5', categoryId: '2', name: 'Women', status: 'active' },
        { id: '6', categoryId: '3', name: 'Furniture', status: 'active' },
        { id: '7', categoryId: '4', name: 'Watches', status: 'active' },
        { id: '8', categoryId: '4', name: 'Sunglasses', status: 'active' },
        { id: '9', categoryId: '5', name: 'Backpacks', status: 'active' },
      ]);
      setColors([
        { color_id: '1', name: 'Red' },
        { color_id: '2', name: 'Blue' },
        { color_id: '3', name: 'Green' },
        { color_id: '4', name: 'Black' },
        { color_id: '5', name: 'White' },
      ]);
      setSizes([
          { size_id: '1', name: 'S' },
          { size_id: '2', name: 'M' },
          { size_id: '3', name: 'L' },
          { size_id: '4', name: 'XL' },
      ]);
    }
  };

  // Fetch categories, subcategories, and colors on mount
  useEffect(() => {
    fetchData();
  }, []);

  // Filter subcategories when category changes
  const handleCategoryChange = (categoryId) => {
    setSelectedCategoryId(categoryId);
    const filtered = subcategories.filter(sub =>
      (sub.category_id || sub.categoryId) === categoryId
    );
    setFilteredSubcategories(filtered);
    // Reset subcategory field when category changes
    form.setFieldValue('subcategoryId', undefined);
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchText.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleAdd = () => {
    setEditingProduct(null);
    setSelectedCategoryId(null);
    setFilteredSubcategories([]);
    setFileList([]);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    
    if (product.category_id) {
      setSelectedCategoryId(product.category_id);
      const filtered = subcategories.filter(sub => (sub.category_id) === product.category_id);
      setFilteredSubcategories(filtered);
    }
    
    if (product.slide_images && product.slide_images.length > 0) {
      setFileList(product.slide_images.map((url, index) => ({
        uid: `-${index}`,
        name: `image-${index}.jpg`,
        status: 'done',
        url,
      })));
    } else if (product.cover_img) {
      setFileList([{
        uid: '-1',
        name: 'image.jpg',
        status: 'done',
        url: product.cover_img,
      }]);
    } else {
      setFileList([]);
    }
    
    form.setFieldsValue({
      categoryId: product.category_id,
      subcategoryId: product.subcategory_id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock_quantity: product.stock_quantity,
      discount_percentage: product.discount_percentage,
      colors: Array.isArray(product.colors) ? product.colors : [],
      sizes: Array.isArray(product.sizes) ? product.sizes : [],
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await productsApi.delete(id);
      message.success('Product deleted successfully');
      await fetchData();
    } catch (error) {
      console.error('Failed to delete product:', error);
      message.error(error.message || 'Failed to delete product');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingProduct) {
          const needsFileUpload = sizeChartUpload.length > 0 || fileList.some(f => f.originFileObj);
          if (needsFileUpload) {
            const formData = new FormData();
            formData.append('category_id', values.categoryId);
            if (values.subcategoryId) formData.append('subcategory_id', values.subcategoryId);
            formData.append('name', values.name);
            formData.append('description', values.description);
            formData.append('price', values.price);
            formData.append('stock_quantity', values.stock_quantity);
            formData.append('discount_percentage', values.discount_percentage || 0);
            if (values.sizes) formData.append('sizes', JSON.stringify(values.sizes));
            if (values.colors) formData.append('colors', JSON.stringify(values.colors));
            fileList.forEach(file => {
              if (file.originFileObj) {
                formData.append('images', file.originFileObj);
              }
            });
            if (sizeChartUpload[0]?.originFileObj) {
              formData.append('size_chart', sizeChartUpload[0].originFileObj);
            }
            await productsApi.update(editingProduct.product_id || editingProduct.id, formData);
          } else {
            const payload = {
              category_id: values.categoryId,
              subcategory_id: values.subcategoryId,
              name: values.name,
              description: values.description,
              price: values.price,
              stock_quantity: values.stock_quantity,
              discount_percentage: values.discount_percentage,
              colors: values.colors,
              sizes: values.sizes,
            };
            await productsApi.update(editingProduct.product_id || editingProduct.id, payload);
          }
        message.success('Product updated successfully');
      } else {
          // Create with FormData
          const formData = new FormData();
          formData.append('category_id', values.categoryId);
          if (values.subcategoryId) formData.append('subcategory_id', values.subcategoryId);
          formData.append('name', values.name);
          formData.append('description', values.description);
          formData.append('price', values.price);
          formData.append('stock_quantity', values.stock_quantity);
          formData.append('discount_percentage', values.discount_percentage || 0);

          if (values.sizes) formData.append('sizes', JSON.stringify(values.sizes));
          if (values.colors) formData.append('colors', JSON.stringify(values.colors));

          // Append images
          fileList.forEach(file => {
              if (file.originFileObj) {
                  formData.append('images', file.originFileObj);
              }
          });
          if (sizeChartUpload[0]?.originFileObj) {
            formData.append('size_chart', sizeChartUpload[0].originFileObj);
          }
          
        await productsApi.create(formData);
        message.success('Product added successfully');
      }
      
      // Refresh data from server
      await fetchData();
      
      setIsModalOpen(false);
      form.resetFields();
      setFileList([]);
      setSizeChartUpload([]);
    } catch (error) {
      console.error('Failed to save product:', error);
      message.error('Failed to save product: ' + error.message);
    }
  };

  // Handle image upload
  const handleUploadChange = ({ fileList: newFileList }) => {
    // Limit to 10 images
    if (newFileList.length > 10) {
      message.warning('Maximum 10 images allowed');
      return;
    }
    setFileList(newFileList);
  };
  
 

  const uploadButton = (
    <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-600 rounded-lg hover:border-gray-400 transition-colors cursor-pointer">
      <PlusOutlined className="text-2xl text-gray-400" />
      <div className="mt-2 text-gray-400 text-sm">Upload</div>
    </div>
  );

  const columns = [
    {
      title: 'Product',
      key: 'product',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          {(record.cover_img || record.image) ? (
            <Avatar shape="square" size={48} src={record.cover_img || record.image} className="rounded-lg" />
          ) : (
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #1c1c1c 0%, #2a2a2a 100%)',
                border: '1px solid #333',
              }}
            />
          )}
          <div>
            <p className="text-foreground font-medium m-0">{record.name}</p>
            <p className="text-muted-foreground text-sm m-0 truncate max-w-xs">
              {record.description}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'Category',
      key: 'category',
      render: (_, record) => (
        <div>
          <p className="text-foreground m-0">{record.category || record.categoryName}</p>
          {(record.subcategory || record.subcategoryName) && (
            <p className="text-muted-foreground text-xs m-0">{record.subcategory || record.subcategoryName}</p>
          )}
        </div>
      ),
    },
    {
      title: 'Colors',
      key: 'colors',
      render: (_, record) => (
        <div className="flex flex-wrap gap-1">
          {Array.isArray(record.colors) && record.colors.length > 0
            ? Array.from(new Set(record.colors)).map((c, idx) => {
                const isWhite = String(c).toLowerCase() === 'white' || String(c).toLowerCase() === '#ffffff' || String(c).toLowerCase() === 'yellow';
                return (
                  <Tag
                    key={`${c}-${idx}`}
                    className="text-xs"
                    style={{
                      backgroundColor: c,
                      color: isWhite ? '#000' : '#fff',
                      borderColor: c,
                    }}
                  >
                    {c}
                  </Tag>
                );
              })
            : <span className="text-muted-foreground">-</span>}
        </div>
      ),
    },
    {
      title: 'Discount (%)',
      dataIndex: 'discount_percentage',
      key: 'discount_percentage',
      sorter: (a, b) => (a.discount_percentage || 0) - (b.discount_percentage || 0),
      render: (val) => (val !== undefined && val !== null) ? `${val}%` : '-',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      sorter: (a, b) => a.price - b.price,
      render: (price) => <span className="font-semibold">${price?.toFixed(2)}</span>,
    },
    {
      title: 'Stock',
      dataIndex: 'stock_quantity',
      key: 'stock_quantity',
      sorter: (a, b) => (a.stock_quantity || 0) - (b.stock_quantity || 0),
      render: (stock) => (
        <span className={stock === 0 ? 'text-red-400' : 'text-foreground'}>
          {stock}
        </span>
      ),
    },
    // {
    //   title: 'Images',
    //   key: 'images',
    //   render: (_, record) => (
    //     <span className="text-muted-foreground">
    //       {Array.isArray(record.slide_images)
    //         ? record.slide_images.length
    //         : (() => {
    //             try {
    //               const arr = JSON.parse(record.images || '[]');
    //               return arr.length || 1;
    //             } catch {
    //               return 1;
    //             }
    //           })()
    //       } image{((Array.isArray(record.slide_images) ? record.slide_images.length : (() => { try { const arr = JSON.parse(record.images || '[]'); return arr.length || 1; } catch { return 1; } })())) > 1 ? 's' : ''}
    //     </span>
    //   ),
    // },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <AppButton
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            className="text-muted-foreground hover:text-foreground"
          />
          <Popconfirm
            title="Delete product?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record.product_id || record.id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ style: { backgroundColor: '#fff', color: '#000' } }}
          >
            <AppButton
              type="text"
              icon={<DeleteOutlined />}
              className="text-muted-foreground hover:text-red-400"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];
  return (
    <AdminLayout title="Products">
      <Card className="border-border" style={{ background: '#111111' }}>
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <Input
            placeholder="Search products..."
            prefix={<SearchOutlined className="text-muted-foreground" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="max-w-xs"
            allowClear
          />
          <div className="flex gap-2">
            <AppButton
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              style={{ color: '#000', fontWeight: 500 }}
            >
              Add Product
            </AppButton>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredProducts}
          rowKey={(record) => record.product_id || record.id}
          className="admin-table"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      <Modal
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">
          {/* Category Selection */}
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="categoryId"
              label="Category"
              rules={[{ required: true, message: 'Please select a category' }]}
            >
              <Select 
                placeholder="Select category first"
                onChange={handleCategoryChange}
                showSearch
                optionFilterProp="children"
              >
                {categories.map((cat) => (
                  <Select.Option key={cat.category_id || cat.id} value={cat.category_id || cat.id}>
                    {cat.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="subcategoryId"
              label="Subcategory"
              rules={[{ required: true, message: 'Please select a subcategory' }]}
            >
              <Select 
                placeholder={selectedCategoryId ? "Select subcategory" : "Select category first"}
                disabled={!selectedCategoryId}
                showSearch
                optionFilterProp="children"
              >
                {filteredSubcategories.map((sub) => (
                  <Select.Option key={sub.subcategory_id || sub.id} value={sub.subcategory_id || sub.id}>
                    {sub.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          {/* Product Details */}
          <Form.Item
            name="name"
            label="Product Name"
            rules={[{ required: true, message: 'Please enter product name' }]}
          >
            <Input placeholder="Enter product name" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <Input.TextArea rows={3} placeholder="Enter product description" />
          </Form.Item>

          {/* Colors Selection */}
          <Form.Item
            name="colors"
            label="Colors"
            rules={[{ required: true, message: 'Please select at least one color' }]}
          >
            <Select 
              mode="multiple"
              placeholder="Select colors"
              showSearch
              optionFilterProp="children"
              allowClear
            >
              {colors.map((color) => (
                <Select.Option key={color.name} value={color.name}>
                  {color.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="sizes"
            label="Sizes"
            rules={[{ required: true, message: 'Please select at least one size' }]}
          >
            <Select 
              mode="multiple"
              placeholder="Select sizes"
              showSearch
              optionFilterProp="children"
              allowClear
            >
              {sizes.map((size) => (
                <Select.Option key={size.name} value={size.name}>
                  {size.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <div className="grid grid-cols-3 gap-4">
            <Form.Item
              name="price"
              label="Price ($)"
              rules={[{ required: true, message: 'Please enter price' }]}
            >
              <InputNumber
                min={0}
                precision={2}
                className="w-full"
                placeholder="0.00"
              />
            </Form.Item>

            <Form.Item
              name="stock_quantity"
              label="Stock"
              rules={[{ required: true, message: 'Please enter stock' }]}
            >
              <InputNumber min={0} className="w-full" placeholder="0" />
            </Form.Item>

            <Form.Item
              name="discount_percentage"
              label="Discount (%)"
              rules={[{ required: true, message: 'Please enter discount percentage' }]}
            >
              <InputNumber min={0} max={100} className="w-full" placeholder="0" />
            </Form.Item>
          </div>

          {/* Image Upload */}
          <Form.Item
            label={
              <div className="flex items-center gap-2">
                <span>Product Images</span>
                <span className="text-muted-foreground text-xs">({fileList.length}/10 max)</span>
              </div>
            }
          >
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleUploadChange}
              beforeUpload={() => false}
              multiple
              maxCount={10}
              accept="image/*"
              className="product-upload"
            >
              {fileList.length >= 10 ? null : uploadButton}
            </Upload>
            <p className="text-muted-foreground text-xs mt-2">
              Upload up to 10 product images. First image will be used as the main product image.
            </p>
          </Form.Item>

          <Form.Item
            label="Size Chart (optional)"
          >
            <Upload
              listType="picture-card"
              fileList={sizeChartUpload}
              onChange={({ fileList }) => setSizeChartUpload(fileList)}
              beforeUpload={() => false}
              maxCount={1}
              accept="image/*"
              className="size-chart-upload"
            >
              {sizeChartUpload.length >= 1 ? null : uploadButton}
            </Upload>
          </Form.Item>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
            <AppButton onClick={() => setIsModalOpen(false)}>Cancel</AppButton>
            <AppButton type="primary" htmlType="submit" style={{ color: '#000', fontWeight: 500 }}>
              {editingProduct ? 'Update' : 'Add'} Product
            </AppButton>
          </div>
        </Form>
      </Modal>

    </AdminLayout>
  );
};

export default Products;
