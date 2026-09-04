
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Form, Input, Button, Card, Typography, message, Space, Tabs } from 'antd';
import { SaveOutlined, ArrowLeftOutlined, EyeOutlined, CodeOutlined, EditOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import AdminLayout from '../components/layout/AdminLayout';
import { pagesApi } from '../services/api';

const { Title } = Typography;
const { TextArea } = Input;

// Slug → Site Content tab section, so we can return to the right place.
const ABOUT_US_SLUGS  = ['our-history', 'legal-notice', 'privacy-policy', 'conditions-of-sale'];
const QUICK_LINK_SLUGS = ['exchange-return', 'delivery-time', 'payment-method'];
const sectionForSlug = (s) =>
  ABOUT_US_SLUGS.includes(s) ? 'about-us'
  : QUICK_LINK_SLUGS.includes(s) ? 'quick-links'
  : null;

const humanize = (s = '') =>
  s.split('-').filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

const PageEditor = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const isEditing = !!slug;
  const [isPreview, setIsPreview] = useState(false);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [content, setContent] = useState('');

  // For "create" the target slug arrives via ?slug=. Determine which Site
  // Content section to return to (explicit ?section= wins, else derive it).
  const querySlug    = searchParams.get('slug');
  const effectiveSlug = slug || querySlug;
  const section      = searchParams.get('section') || sectionForSlug(effectiveSlug);
  const backTo       = section ? `/site-content?tab=${section}` : '/site-content';

  const { data: page, isLoading } = useQuery({
    queryKey: ['page', slug],
    queryFn: () => pagesApi.getBySlug(slug),
    enabled: isEditing,
  });

  const mutation = useMutation({
    mutationFn: (data) => isEditing ? pagesApi.update(slug, data) : pagesApi.create(data),
    onSuccess: () => {
      message.success(`Page ${isEditing ? 'updated' : 'created'} successfully`);
      queryClient.invalidateQueries(['pages']);
      navigate(backTo);
    },
    onError: (error) => {
      message.error(`Failed to save page: ${error.message}`);
    },
  });

  useEffect(() => {
    if (page) {
      form.setFieldsValue({
        title: page.title,
        slug: page.slug,
        content: page.content,
      });
      setContent(page.content);
    }
  }, [page, form]);

  // Pre-fill slug (and a humanized title) when creating from a known section.
  useEffect(() => {
    if (!isEditing && querySlug) {
      form.setFieldsValue({ slug: querySlug, title: humanize(querySlug) });
    }
  }, [isEditing, querySlug, form]);

  const onFinish = (values) => {
    mutation.mutate({ ...values, content });
  };

  const handleContentChange = (value) => {
    setContent(value);
    form.setFieldsValue({ content: value });
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image'
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(backTo)}
              type="text"
            />
            <div>
              <Title level={2}>{isEditing ? 'Edit Page' : 'Create Page'}</Title>
              <p className="text-gray-400">{isEditing ? `Editing: ${page?.title || slug}` : 'Create a new static page'}</p>
            </div>
          </div>
          <Space>
            <Button 
              icon={isPreview ? <EditOutlined /> : <EyeOutlined />} 
              onClick={() => setIsPreview(!isPreview)}
            >
              {isPreview ? 'Back to Edit' : 'Preview'}
            </Button>
            <Button 
              type="primary" 
              icon={<SaveOutlined />} 
              onClick={() => form.submit()}
              loading={mutation.isPending}
              style={{ color: '#000', fontWeight: 500 }}
            >
              Save Changes
            </Button>
          </Space>
        </div>

        <Card className="bg-[#141414] border-gray-800" loading={isLoading}>
          {isPreview ? (
            <div className="bg-white text-black p-8 rounded-md min-h-[500px] overflow-auto prose max-w-none">
              <Title level={1}>{form.getFieldValue('title')}</Title>
              <div dangerouslySetInnerHTML={{ __html: content }} />
            </div>
          ) : (
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
                name="slug"
                label="Slug"
                rules={[{ required: true, message: 'Please enter page slug' }]}
                help="The URL-friendly identifier for this page (e.g., delivery-time)"
              >
                <Input placeholder="e.g., delivery-time" disabled={isEditing} />
              </Form.Item>

              <div className="flex justify-between items-center mb-2">
                <label className="text-foreground">Content</label>
                <Button 
                  size="small" 
                  icon={<CodeOutlined />} 
                  onClick={() => setIsHtmlMode(!isHtmlMode)}
                >
                  {isHtmlMode ? 'Rich Text Editor' : 'Edit HTML'}
                </Button>
              </div>

              <Form.Item
                name="content"
                rules={[{ required: true, message: 'Please enter page content' }]}
              >
                {isHtmlMode ? (
                  <TextArea
                    value={content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    rows={15}
                    className="bg-[#1a1a1a] text-foreground border-gray-800 font-mono"
                  />
                ) : (
                  <ReactQuill 
                    theme="snow"
                    value={content}
                    onChange={handleContentChange}
                    modules={modules}
                    formats={formats}
                    className="bg-white text-black rounded-md min-h-[300px]"
                  />
                )}
              </Form.Item>
            </Form>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
};

export default PageEditor;
