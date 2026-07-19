import { useState, useEffect } from 'react';
import {
  Card, Form, Input, Tabs, Upload, message, Divider, Table, Space, Tag,
} from 'antd';
import {
  UploadOutlined, EditOutlined, PlusOutlined,
  HomeOutlined, LinkOutlined, InfoCircleOutlined, SettingOutlined,
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AdminLayout } from '../components/layout/AdminLayout';
import { siteSettingsApi, pagesApi } from '../services/api';
import { AppButton } from '../components/AppButton';

const { TextArea } = Input;

// Known page groups — keyed by slug
const ABOUT_US_SLUGS = ['our-history', 'legal-notice', 'privacy-policy', 'conditions-of-sale'];
const QUICK_LINK_SLUGS = ['exchange-return', 'delivery-time', 'payment-method'];

const HOMEPAGE_FIELDS = [
  'hero_eyebrow', 'hero_heading', 'hero_subheading', 'hero_cta_text', 'hero_cta_link',
  'intro_eyebrow', 'intro_heading', 'intro_text',
];
const FOOTER_FIELDS = [
  'footer_description', 'footer_need_help_text', 'footer_email', 'footer_phone',
  'footer_whatsapp', 'footer_instagram', 'footer_facebook', 'footer_linkedin', 'footer_copyright',
];

const pick = (obj, keys) => keys.reduce((acc, k) => ({ ...acc, [k]: obj?.[k] }), {});

const uploadBtn = (
  <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-600 rounded-lg hover:border-gray-400 transition-colors cursor-pointer">
    <UploadOutlined className="text-2xl text-gray-400" />
    <div className="mt-2 text-gray-400 text-sm">Click to upload</div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Pages sub-tab (shared by About Us & Quick Links)
// ─────────────────────────────────────────────────────────────────────────────
const PagesTab = ({ pages, loading, knownSlugs, section }) => {
  const navigate = useNavigate();

  const existing = pages.filter((p) => knownSlugs.includes(p.slug));
  const missing  = knownSlugs.filter((s) => !pages.find((p) => p.slug === s));

  const cols = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (title) => <span className="text-foreground font-medium">{title}</span>,
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      render: (slug) => <Tag>{slug}</Tag>,
    },
    {
      title: 'Last Updated',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (v) => v ? new Date(v).toLocaleDateString() : '—',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <AppButton
          type="text"
          icon={<EditOutlined />}
          onClick={() => navigate(`/pages/edit/${record.slug}?section=${section}`)}
        >
          Edit Content
        </AppButton>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Table
        columns={cols}
        dataSource={existing}
        rowKey="page_id"
        loading={loading}
        className="admin-table"
        pagination={false}
      />
      {missing.length > 0 && (
        <div>
          <p className="text-muted-foreground text-sm mb-2">
            The following pages don&apos;t exist yet. Create them so their content appears on the site:
          </p>
          <Space wrap>
            {missing.map((slug) => (
              <AppButton
                key={slug}
                icon={<PlusOutlined />}
                onClick={() => navigate(`/pages/create?slug=${slug}&section=${section}`)}
              >
                Create «{slug}»
              </AppButton>
            ))}
          </Space>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
const SiteContent = () => {
  const [settings, setSettings]     = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [pagesData, setPagesData]   = useState([]);
  const [pagesLoading, setPagesLoading] = useState(true);
  const [saving, setSaving]         = useState(false);

  // Each image holds a { preview, file } — file is a not-yet-uploaded File that is
  // only sent to the server on Save. preview is either the saved URL or a local blob.
  const [logo,  setLogo]  = useState({ preview: null, file: null });
  const [hero,  setHero]  = useState({ preview: null, file: null });
  const [intro, setIntro] = useState({ preview: null, file: null });

  const [homepageDirty, setHomepageDirty] = useState(false);
  const [footerDirty, setFooterDirty]     = useState(false);

  const [homepageForm] = Form.useForm();
  const [footerForm]   = Form.useForm();

  // Active tab is driven by the ?tab= query param so other pages (e.g. the
  // page editor) can deep-link back into the right section.
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'homepage';
  const onTabChange = (key) =>
    setSearchParams(key === 'homepage' ? {} : { tab: key });

  // Reset both forms + image previews to a freshly-loaded settings object and
  // clear the dirty flags (used on load, after save, and on cancel).
  const applySettings = (data) => {
    setSettings(data);
    homepageForm.setFieldsValue(pick(data, HOMEPAGE_FIELDS));
    footerForm.setFieldsValue(pick(data, FOOTER_FIELDS));
    setLogo({ preview: data.logo_url || null, file: null });
    setHero({ preview: data.hero_image_url || null, file: null });
    setIntro({ preview: data.intro_image_url || null, file: null });
    setHomepageDirty(false);
    setFooterDirty(false);
  };

  // ── Load ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await siteSettingsApi.getAll();
        applySettings(data);
      } catch {
        message.error('Failed to load site settings');
      } finally {
        setSettingsLoading(false);
      }
    };

    const loadPages = async () => {
      try {
        const data = await pagesApi.getAll();
        setPagesData(data);
      } catch {
        message.error('Failed to load pages');
      } finally {
        setPagesLoading(false);
      }
    };

    loadSettings();
    loadPages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Image selection (deferred — nothing is uploaded until Save) ───────────────
  const selectImage = (file, type) => {
    const preview = URL.createObjectURL(file);
    const setters = { logo: setLogo, hero: setHero, intro: setIntro };
    setters[type]({ preview, file });
    setHomepageDirty(true);
    return false; // stop antd from auto-uploading
  };

  // Renders either the current/selected image with a "Change Image" button, or an
  // empty upload tile when there is no image yet.
  const renderImage = ({ preview, file }, type, whiteBg = false) => {
    const uploadProps = {
      showUploadList: false,
      beforeUpload: (f) => selectImage(f, type),
      maxCount: 1,
      accept: 'image/*',
    };
    if (!preview) {
      return <Upload {...uploadProps}>{uploadBtn}</Upload>;
    }
    return (
      <div className="space-y-2">
        <div className={`inline-block rounded-lg ${whiteBg ? 'bg-white p-3' : ''}`}>
          <img
            src={preview}
            alt={type}
            style={{ maxHeight: 150, maxWidth: '100%', borderRadius: 6, objectFit: 'contain', display: 'block' }}
          />
        </div>
        <div>
          <Upload {...uploadProps}>
            <AppButton icon={<UploadOutlined />}>Change Image</AppButton>
          </Upload>
          {file && <span className="text-yellow-400 text-xs ml-2">New image selected — click Save to apply</span>}
        </div>
      </div>
    );
  };

  // ── Save / Cancel ─────────────────────────────────────────────────────────────
  const saveHomepage = async () => {
    setSaving(true);
    try {
      // Upload only the images the user actually changed (these persist server-side).
      if (logo.file)  await siteSettingsApi.uploadLogo(logo.file);
      if (hero.file)  await siteSettingsApi.uploadHero(hero.file);
      if (intro.file) await siteSettingsApi.uploadIntroImage(intro.file);
      await siteSettingsApi.update(homepageForm.getFieldsValue());
      message.success('Homepage content saved');
      const data = await siteSettingsApi.getAll();
      applySettings(data);
    } catch (err) {
      message.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const cancelHomepage = () => {
    if (!settings) return;
    homepageForm.setFieldsValue(pick(settings, HOMEPAGE_FIELDS));
    setLogo({ preview: settings.logo_url || null, file: null });
    setHero({ preview: settings.hero_image_url || null, file: null });
    setIntro({ preview: settings.intro_image_url || null, file: null });
    setHomepageDirty(false);
  };

  const saveFooter = async () => {
    setSaving(true);
    try {
      await siteSettingsApi.update(footerForm.getFieldsValue());
      message.success('Footer settings saved');
      const data = await siteSettingsApi.getAll();
      applySettings(data);
    } catch (err) {
      message.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const cancelFooter = () => {
    if (!settings) return;
    footerForm.setFieldsValue(pick(settings, FOOTER_FIELDS));
    setFooterDirty(false);
  };

  // ── Tabs ─────────────────────────────────────────────────────────────────────
  const tabItems = [
    {
      key: 'homepage',
      label: <span><HomeOutlined className="mr-1" />Homepage</span>,
      children: (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Logo */}
            <div>
              <h3 className="text-foreground font-semibold text-base mb-1">Website Logo</h3>
              <p className="text-muted-foreground text-sm mb-3">Shown in the header of the storefront. Transparent PNG recommended.</p>
              {renderImage(logo, 'logo', true)}
            </div>

            {/* Hero / Cover */}
            <div>
              <h3 className="text-foreground font-semibold text-base mb-1">Cover / Hero Image</h3>
              <p className="text-muted-foreground text-sm mb-3">Full-width banner at the top of the homepage. Recommended 1920×600 px.</p>
              {renderImage(hero, 'hero')}
            </div>
          </div>

          <Divider />

          {/* Homepage text content (hero overlay + intro) */}
          <Form form={homepageForm} layout="vertical" onValuesChange={() => setHomepageDirty(true)}>
            {/* Hero overlay text */}
            <h3 className="text-foreground font-semibold text-base mb-1">Hero Banner Text</h3>
            <p className="text-muted-foreground text-sm mb-3">Text shown on top of the cover image.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item name="hero_eyebrow" label="Eyebrow (small label above heading)">
                <Input placeholder="Authentic Moroccan Craftsmanship" />
              </Form.Item>
              <Form.Item name="hero_heading" label="Heading">
                <Input placeholder="Jabador & Moroccan Thobes Online" />
              </Form.Item>
            </div>
            <Form.Item name="hero_subheading" label="Subheading">
              <TextArea rows={2} placeholder="High-quality traditional fashion, handcrafted for every occasion." />
            </Form.Item>
            <div className="grid grid-cols-2 gap-4">
              <Form.Item name="hero_cta_text" label="Button Text">
                <Input placeholder="Shop Collection" />
              </Form.Item>
              <Form.Item name="hero_cta_link" label="Button Link"
                extra="Where the button takes the visitor (e.g. /store).">
                <Input placeholder="/store" />
              </Form.Item>
            </div>

            <Divider />

            {/* Intro section */}
            <h3 className="text-foreground font-semibold text-base mb-1">Introduction Section</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Form.Item name="intro_eyebrow" label="Eyebrow (small label)">
                  <Input placeholder="Our Story" />
                </Form.Item>
                <Form.Item name="intro_heading" label="Heading">
                  <Input placeholder="Tradition woven into every thread" />
                </Form.Item>
                <Form.Item name="intro_text" label="Introduction Text"
                  extra="Displayed beside the intro image on the homepage.">
                  <TextArea rows={6} placeholder="Since 2009, JABADOR offers..." />
                </Form.Item>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-2">Intro Section Image (320×500 px)</p>
                {renderImage(intro, 'intro')}
              </div>
            </div>
          </Form>

          <div className="flex gap-2 mt-4">
            <AppButton type="primary" onClick={saveHomepage} loading={saving} disabled={!homepageDirty}
              style={homepageDirty ? { color: '#000', fontWeight: 500 } : { fontWeight: 500 }}>
              Save Homepage Content
            </AppButton>
            <AppButton onClick={cancelHomepage} disabled={!homepageDirty || saving}>
              Cancel
            </AppButton>
          </div>
        </div>
      ),
    },
    {
      key: 'footer',
      label: <span><SettingOutlined className="mr-1" />Footer</span>,
      children: (
        <div>
          <Form form={footerForm} layout="vertical" onValuesChange={() => setFooterDirty(true)}>
            <Form.Item name="footer_description" label="Brand Description"
              extra="Short description shown under the brand name in the footer.">
              <TextArea rows={3} placeholder="Our shop offers classy and modern Moroccan outfits..." />
            </Form.Item>

            <Divider orientation="left">Contact Info</Divider>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item name="footer_email" label="Email">
                <Input placeholder="support@example.com" />
              </Form.Item>
              <Form.Item name="footer_phone" label="Phone">
                <Input placeholder="+1234567890" />
              </Form.Item>
              <Form.Item name="footer_need_help_text" label="Opening Hours">
                <Input placeholder="Monday to Sunday from 9 a.m. to 6 p.m." />
              </Form.Item>
              <Form.Item name="footer_whatsapp" label="WhatsApp Number">
                <Input placeholder="+1234567890" />
              </Form.Item>
            </div>

            <Divider orientation="left">Social Media</Divider>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item name="footer_instagram" label="Instagram URL">
                <Input placeholder="https://instagram.com/yourpage" />
              </Form.Item>
              <Form.Item name="footer_facebook" label="Facebook URL">
                <Input placeholder="https://facebook.com/yourpage" />
              </Form.Item>
              <Form.Item name="footer_linkedin" label="LinkedIn URL">
                <Input placeholder="https://linkedin.com/in/yourpage" />
              </Form.Item>
            </div>

            <Divider orientation="left">Copyright</Divider>

            <Form.Item name="footer_copyright" label="Copyright Text">
              <Input placeholder="© 2025 Jabador - All rights reserved" />
            </Form.Item>
          </Form>

          <div className="flex gap-2">
            <AppButton type="primary" onClick={saveFooter} loading={saving} disabled={!footerDirty}
              style={footerDirty ? { color: '#000', fontWeight: 500 } : { fontWeight: 500 }}>
              Save Footer Settings
            </AppButton>
            <AppButton onClick={cancelFooter} disabled={!footerDirty || saving}>
              Cancel
            </AppButton>
          </div>
        </div>
      ),
    },
    {
      key: 'about-us',
      label: <span><InfoCircleOutlined className="mr-1" />About Us Pages</span>,
      children: (
        <PagesTab
          pages={pagesData}
          loading={pagesLoading}
          knownSlugs={ABOUT_US_SLUGS}
          section="about-us"
        />
      ),
    },
    {
      key: 'quick-links',
      label: <span><LinkOutlined className="mr-1" />Quick Links Pages</span>,
      children: (
        <PagesTab
          pages={pagesData}
          loading={pagesLoading}
          knownSlugs={QUICK_LINK_SLUGS}
          section="quick-links"
        />
      ),
    },
  ];

  return (
    <AdminLayout title="Site Content">
      <Card className="border-border" style={{ background: '#111111' }} loading={settingsLoading}>
        <Tabs activeKey={activeTab} onChange={onTabChange} items={tabItems} />
      </Card>
    </AdminLayout>
  );
};

export default SiteContent;
