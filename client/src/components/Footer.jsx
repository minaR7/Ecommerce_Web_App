import { Layout } from 'antd';
import { FaWhatsapp, FaEnvelope, FaPhone, FaInstagram, FaFacebook, FaLinkedin } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../hooks/useSiteSettings';

const { Footer } = Layout;

const FooterMenu = () => {
    const { settings } = useSiteSettings();

    const description    = settings.footer_description    || 'Our shop offers classy and modern Moroccan outfits made with passion in our workshops in Morocco.';
    const needHelpText   = settings.footer_need_help_text || 'Monday to Sunday from 9 a.m. to 6 p.m.';
    const email          = settings.footer_email          || 'support@jabador.com';
    const phone          = settings.footer_phone          || '';
    const whatsapp       = settings.footer_whatsapp       || '';
    const instagram      = settings.footer_instagram      || '#';
    const facebook       = settings.footer_facebook       || '#';
    const linkedin       = settings.footer_linkedin       || '#';
    const copyright      = settings.footer_copyright      || `© ${new Date().getFullYear()} Jabador - All rights reserved`;

    return (
        <Footer style={{ padding: 0, background: 'linear-gradient(180deg,rgba(52, 63, 77, 1) 0%, rgba(32, 40, 54, 1) 45%, rgba(14, 15, 17, 1) 100%)' }}>
            <div className="w-full text-white px-6 py-8">
                <div className="flex flex-col md:flex-row justify-between gap-8 pb-6">
                    {/* Column 1 — Brand */}
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-2">Elmaghrib</h2>
                        <p className="text-lg">{description}</p>
                    </div>

                    {/* Column 2 — Collections */}
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-2">Collections</h2>
                        <ul className="space-y-1">
                            <li><Link to="/store/Men/Djellaba"       className="hover:underline">Djellaba</Link></li>
                            <li><Link to="/store/Men/Jabador"        className="hover:underline">Jabador</Link></li>
                            <li><Link to="/store/Men/Moroccan Thobe" className="hover:underline">Moroccan Thobe</Link></li>
                            <li><Link to="/store/Men/Accessories"    className="hover:underline">Accessories</Link></li>
                        </ul>
                    </div>

                    {/* Column 3 — About Us */}
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-2">About Us</h2>
                        <ul className="space-y-1">
                            <li><Link to="/our-history"        className="hover:underline">Our History</Link></li>
                            <li><Link to="/legal-notice"       className="hover:underline">Legal Notice</Link></li>
                            <li><Link to="/privacy-policy"     className="hover:underline">Privacy Policy</Link></li>
                            <li><Link to="/conditions-of-sale" className="hover:underline">Conditions of Sale</Link></li>
                        </ul>
                    </div>

                    {/* Column 4 — Quick Links */}
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-2">Quick Links</h2>
                        <ul className="space-y-1">
                            <li><Link to="/exchange-return"  className="hover:underline">Exchange &amp; Return</Link></li>
                            <li><Link to="/delivery-time"    className="hover:underline">Delivery Time</Link></li>
                            <li><Link to="/payment-method"   className="hover:underline">Payment Method</Link></li>
                            <li><Link to="/blog"             className="hover:underline">Blog</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Row 2 */}
                <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-6">
                    {/* Contact */}
                    <div className="text-center md:text-left">
                        <p className="font-semibold text-lg">Need Help?</p>
                        <p>{needHelpText}</p>
                        <div className="flex justify-center md:justify-start gap-4 mt-2">
                            {whatsapp && (
                                <a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} aria-label="WhatsApp" className="hover:text-green-400" target="_blank" rel="noreferrer">
                                    <FaWhatsapp size={20} />
                                </a>
                            )}
                            {email && (
                                <a href={`mailto:${email}`} aria-label="Email" className="hover:text-yellow-400">
                                    <FaEnvelope size={20} />
                                </a>
                            )}
                            {phone && (
                                <a href={`tel:${phone}`} aria-label="Phone" className="hover:text-blue-300">
                                    <FaPhone size={20} />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Social */}
                    <div className="text-center md:text-left">
                        <p className="font-semibold text-lg">Follow us:</p>
                        <p>Stay informed of the latest news and promotions</p>
                        <div className="flex justify-center md:justify-start gap-4 mt-2">
                            <a href={instagram} aria-label="Instagram" className="hover:text-pink-400" target="_blank" rel="noreferrer">
                                <FaInstagram size={20} />
                            </a>
                            <a href={facebook} aria-label="Facebook" className="hover:text-blue-400" target="_blank" rel="noreferrer">
                                <FaFacebook size={20} />
                            </a>
                            <a href={linkedin} aria-label="LinkedIn" className="hover:text-blue-300" target="_blank" rel="noreferrer">
                                <FaLinkedin size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Copyright */}
                    <p className="text-lg self-center lg:self-end">{copyright}</p>
                </div>
            </div>
        </Footer>
    );
};

export default FooterMenu;
