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

exports.getSettings = (req, res) => {
  const settings = loadSettings();
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  // Resolve relative image paths to full URLs
  const resolved = { ...settings };
  if (resolved.logo_url) resolved.logo_url = `${baseUrl}/${resolved.logo_url.replace(/^\/+/, '')}`;
  if (resolved.hero_image_url) resolved.hero_image_url = `${baseUrl}/${resolved.hero_image_url.replace(/^\/+/, '')}`;
  if (resolved.intro_image_url) resolved.intro_image_url = `${baseUrl}/${resolved.intro_image_url.replace(/^\/+/, '')}`;
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
    ];
    const updated = { ...current };
    for (const key of allowed) {
      if (req.body[key] !== undefined) updated[key] = req.body[key];
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
