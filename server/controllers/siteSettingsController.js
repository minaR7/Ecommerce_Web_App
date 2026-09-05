const path = require('path');
const fs = require('fs');

const SETTINGS_FILE = path.join(__dirname, '../data/site_settings.json');

const ensureDataDir = () => {
  const dir = path.dirname(SETTINGS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const defaultSettings = {
  logo_url: null,
  hero_image_url: null,
  intro_image_url: null,
  // Homepage hero (editable from admin)
  hero_eyebrow: 'Authentic Moroccan Craftsmanship',
  hero_heading: 'Jabador & Moroccan Thobes Online',
  hero_subheading: 'High-quality traditional fashion, handcrafted for every occasion.',
  hero_cta_text: 'Shop Collection',
  hero_cta_link: '/store',
  // Homepage introduction section (editable from admin)
  intro_eyebrow: 'Our Story',
  intro_heading: 'Tradition woven into every thread',
  intro_text: 'Since 2009, JABADOR offers you the sale of traditional Moroccan dress such as the Jabador, Djellaba and Gandoura at a price everyone can afford, working with experienced Moroccan craftsmen. Our challenge is to give you the opportunity to buy a wide range of Moroccan clothes for all occasions (Muslim religious holidays, weddings, Hlal) in quality fabrics, linen, Mlifa (cotton), Gabardine and Velvet.',
  footer_description: 'Our shop offers classy and modern Moroccan outfits made with passion in our workshops in Morocco.',
  footer_need_help_text: 'Monday to Sunday from 9 a.m. to 6 p.m.',
  footer_whatsapp: '',
  footer_email: 'support@jabador.com',
  footer_phone: '+1234567890',
  footer_instagram: '',
  footer_facebook: '',
  footer_linkedin: '',
  footer_copyright: `© ${new Date().getFullYear()} Jabador - All rights reserved`,
  // Product detail info block (editable from admin → Site Content → Product Details)
  product_shipping_charges: 'Free shipping on all orders.',
  product_collection: 'Click & Collect - Select store at checkout.',
  product_postage: 'Free delivery in 2-3 days',
  product_returns: '30 days return. Seller pays for return postage.',
  // Accepted payment methods shown as icons on the product page (managed from admin).
  // Each: { name, icon_url }. icon_url may be a bundled client asset ("/assets/...")
  // or a server-uploaded path ("assets/uploads/site/...").
  payment_methods: [
    { name: 'Visa', icon_url: '/assets/icons/visa-svgrepo-com (1).svg' },
    { name: 'Mastercard', icon_url: '/assets/icons/mastercard-svgrepo-com.svg' },
  ],
  // Fallback shipping fee (EUR) applied at checkout when no shipping_rates row
  // matches the destination country. Editable from admin.
  default_intl_shipping_fee: 35,
};

// Resolve a stored image path to something the browser can load:
//  - absolute URLs (http...) are returned unchanged
//  - root-relative paths ("/assets/...") are bundled client assets → unchanged
//  - anything else is a server-relative upload → prefixed with the API host
const resolveUrl = (baseUrl, val) => {
  if (!val) return null;
  if (/^https?:\/\//i.test(val)) return val;
  if (val.startsWith('/')) return val;
  return `${baseUrl}/${val.replace(/^\/+/, '')}`;
};

const loadSettings = () => {
  try {
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return { ...defaultSettings };
  }
};

const saveSettings = (data) => {
  ensureDataDir();
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2), 'utf8');
};

// Exposed so other controllers (e.g. checkout) can read settings like the
// default international shipping fee without going through the HTTP layer.
exports.loadSettings = loadSettings;

// Fields that are SAFE to expose publicly — the storefront needs these to
// render the homepage, product pages and footer.  Anything NOT on this list
// (default_intl_shipping_fee, future admin-only config) is returned ONLY via
// the protected (requireAdmin) GET /api/site-settings endpoint.
const PUBLIC_FIELDS = [
  'logo_url',
  'hero_image_url',
  'intro_image_url',
  'hero_eyebrow',
  'hero_heading',
  'hero_subheading',
  'hero_cta_text',
  'hero_cta_link',
  'intro_eyebrow',
  'intro_heading',
  'intro_text',
  'footer_description',
  'footer_need_help_text',
  'footer_whatsapp',
  'footer_email',
  'footer_phone',
  'footer_instagram',
  'footer_facebook',
  'footer_linkedin',
  'footer_copyright',
  'product_shipping_charges',
  'product_collection',
  'product_postage',
  'product_returns',
  'payment_methods',
];

const pickPublic = (settings) => {
  const out = {};
  for (const k of PUBLIC_FIELDS) if (settings[k] !== undefined) out[k] = settings[k];
  return out;
};

exports.getPublicSettings = (req, res) => {
  const settings = loadSettings();
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const resolved = pickPublic({ ...settings });
  if (resolved.logo_url) resolved.logo_url = `${baseUrl}/${resolved.logo_url.replace(/^\/+/, '')}`;
  if (resolved.hero_image_url) resolved.hero_image_url = `${baseUrl}/${resolved.hero_image_url.replace(/^\/+/, '')}`;
  if (resolved.intro_image_url) resolved.intro_image_url = `${baseUrl}/${resolved.intro_image_url.replace(/^\/+/, '')}`;
  resolved.payment_methods = Array.isArray(settings.payment_methods)
    ? settings.payment_methods.map((m) => ({
        name: m.name || '',
        icon_url: m.icon_url || '',
        icon_url_resolved: resolveUrl(baseUrl, m.icon_url),
      }))
    : [];
  res.json(resolved);
};

exports.getSettings = (req, res) => {
  const settings = loadSettings();
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  // Resolve relative image paths to full URLs
  const resolved = { ...settings };
  if (resolved.logo_url) resolved.logo_url = `${baseUrl}/${resolved.logo_url.replace(/^\/+/, '')}`;
  if (resolved.hero_image_url) resolved.hero_image_url = `${baseUrl}/${resolved.hero_image_url.replace(/^\/+/, '')}`;
  if (resolved.intro_image_url) resolved.intro_image_url = `${baseUrl}/${resolved.intro_image_url.replace(/^\/+/, '')}`;
  // Payment methods: keep the raw icon_url (for round-tripping saves) and add a
  // browser-loadable icon_url_resolved alongside it.
  resolved.payment_methods = Array.isArray(settings.payment_methods)
    ? settings.payment_methods.map((m) => ({
        name: m.name || '',
        icon_url: m.icon_url || '',
        icon_url_resolved: resolveUrl(baseUrl, m.icon_url),
      }))
    : [];
  res.json(resolved);
};

exports.updateSettings = (req, res) => {
  try {
    const current = loadSettings();
    const allowed = [
      'hero_eyebrow',
      'hero_heading',
      'hero_subheading',
      'hero_cta_text',
      'hero_cta_link',
      'intro_eyebrow',
      'intro_heading',
      'intro_text',
      'footer_description',
      'footer_need_help_text',
      'footer_whatsapp',
      'footer_email',
      'footer_phone',
      'footer_instagram',
      'footer_facebook',
      'footer_linkedin',
      'footer_copyright',
      'product_shipping_charges',
      'product_collection',
      'product_postage',
      'product_returns',
    ];
    const updated = { ...current };
    for (const key of allowed) {
      if (req.body[key] !== undefined) updated[key] = req.body[key];
    }
    // Payment methods is an array of { name, icon_url }. Sanitize and persist only
    // the raw fields (drop any resolved URL and entries without an icon).
    if (Array.isArray(req.body.payment_methods)) {
      updated.payment_methods = req.body.payment_methods
        .map((m) => ({
          name: String(m?.name || '').trim(),
          icon_url: String(m?.icon_url || '').trim(),
        }))
        .filter((m) => m.icon_url);
    }
    // Default international shipping fee — coerce to a non-negative number.
    if (req.body.default_intl_shipping_fee !== undefined) {
      const fee = Number(req.body.default_intl_shipping_fee);
      if (Number.isFinite(fee) && fee >= 0) updated.default_intl_shipping_fee = fee;
    }
    saveSettings(updated);
    res.json({ message: 'Settings saved', settings: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save settings: ' + err.message });
  }
};

const deleteFileSafe = (relPath) => {
  try {
    if (!relPath) return;
    const abs = path.join(__dirname, '..', relPath);
    if (fs.existsSync(abs)) fs.unlinkSync(abs);
  } catch {}
};

exports.uploadLogo = (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const current = loadSettings();
    deleteFileSafe(current.logo_url);
    const newPath = `assets/uploads/site/${req.file.filename}`;
    current.logo_url = newPath;
    saveSettings(current);
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    res.json({ message: 'Logo uploaded', logo_url: `${baseUrl}/${newPath}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.uploadHero = (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const current = loadSettings();
    deleteFileSafe(current.hero_image_url);
    const newPath = `assets/uploads/site/${req.file.filename}`;
    current.hero_image_url = newPath;
    saveSettings(current);
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    res.json({ message: 'Hero image uploaded', hero_image_url: `${baseUrl}/${newPath}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.uploadIntroImage = (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const current = loadSettings();
    deleteFileSafe(current.intro_image_url);
    const newPath = `assets/uploads/site/${req.file.filename}`;
    current.intro_image_url = newPath;
    saveSettings(current);
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    res.json({ message: 'Intro image uploaded', intro_image_url: `${baseUrl}/${newPath}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Upload a single payment-method icon. Unlike the logo/hero uploads this does NOT
// mutate settings — the admin puts the returned icon_url into a payment_methods
// entry and saves the whole array via updateSettings.
exports.uploadPaymentIcon = (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const newPath = `assets/uploads/site/${req.file.filename}`;
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    res.json({ icon_url: newPath, icon_url_resolved: `${baseUrl}/${newPath}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
