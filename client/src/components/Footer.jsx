// components/Footer.jsx
import { Layout } from 'antd';
import { FaWhatsapp, FaEnvelope, FaPhone, FaInstagram, FaFacebook, FaLinkedin } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const { Footer } = Layout;

const FooterMenu = () => {
    return (
        <Footer style={{ padding: 0, background: 'linear-gradient(180deg,rgba(52, 63, 77, 1) 0%, rgba(32, 40, 54, 1) 45%, rgba(14, 15, 17, 1) 100%)' }}>
            <div className="w-full text-white px-6 py-8">
                {/* {bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 } */}
                {/* Row 1  border-b border-blue-300*/} 
                {/* position: absolute;position: absolute;width: 100%;
                bottom: 0px; */}
                <div className="flex flex-col md:flex-row justify-between gap-8 pb-6">
                    {/* Column 1 */}
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-2">Jabador Shop</h2>
                        <p className="text-lg">
                            Our shop offers classy and modern Moroccan outfits made with passion in our workshops in Morocco.
                        </p>
                    </div>

                    {/* Column 2 */}
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-2">Collections</h2>
                        <ul className="space-y-1">
                            <li><Link to={"/Men/Djellaba"} className="hover:underline">Djellaba</Link></li>
                             <li><Link to={"/Men/jabador"} className="hover:underline">Jabador</Link></li>
                            <li><Link to={"/Men/moroccan-thobe"} className="hover:underline">Moroccan Thobe</Link></li>
                            <li><Link to={"/Men/accessories"} className="hover:underline">Accessories</Link></li>
                            {/* <li><a href="/men/jabador" className="hover:underline">Jabador</a></li>
                            <li><a href="/men/moroccan-thobe" className="hover:underline">Moroccan Thobe</a></li>
                            <li><a href="/men/accessories" className="hover:underline">Accessories</a></li> */}
                        </ul>
                    </div>

                    {/* Column 3 */}
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-2">About Us</h2>
                        <ul className="space-y-1">
                            <li><Link to="/our-history" className="hover:underline">Our History</Link></li>
                            <li><Link to="/legal-notice" className="hover:underline">Legal Notice</Link></li>
                            <li><Link to="/privacy-policy" className="hover:underline">Privacy Policy</Link></li>
                            <li><Link to="/conditions-of-sale" className="hover:underline">Conditions of Sale</Link></li>
                        </ul>
                    </div>

                    {/* Column 4 */}
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-2">Quick Links</h2>
                        <ul className="space-y-1">
                            <li><Link to="/exchange-return" className="hover:underline">Exchange & Return</Link></li>
                            <li><Link to="/delivery-time" className="hover:underline">Delivery Time</Link></li>
                            <li><Link to="/payment-method" className="hover:underline">Payment Method</Link></li>
                            <li><Link to="/blog" className="hover:underline">Blog</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Row 2 */}
                <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-6">

                    {/* Column 1 */}
                    <div className="text-center md:text-left">
                        <p className="font-semibold text-lg">Need Help?</p>
                        <p>Monday to Sunday from 9 a.m. to 6 p.m.</p>
                        <div className="flex justify-center md:justify-start gap-4 mt-2">
                            <a href="#" aria-label="WhatsApp" className="hover:text-green-400">
                                <FaWhatsapp size={20} />
                            </a>
                            <a href="mailto:support@jabador.com" aria-label="Email" className="hover:text-yellow-400">
                                <FaEnvelope size={20} />
                            </a>
                            <a href="tel:+1234567890" aria-label="Phone" className="hover:text-blue-300">
                                <FaPhone size={20} />
                            </a>
                        </div>
                    </div>

                    <div className="text-center md:text-left">
                        <p className="font-semibold text-lg">Follow us:</p>
                        <p>Stay informed of the latest news and promotions</p>
                        <div className="flex justify-center md:justify-start gap-4 mt-2">
                    {/* <div className="flex gap-4"> */}
                        <a href="#" aria-label="Instagram" className="hover:text-pink-400">
                            <FaInstagram size={20} />
                        </a>
                        <a href="#" aria-label="Facebook" className="hover:text-blue-400">
                            <FaFacebook size={20} />
                        </a>
                        <a href="#" aria-label="LinkedIn" className="hover:text-blue-300">
                            <FaLinkedin size={20} />
                        </a>
                        {/* <a>
    <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    className="fill-current">
    <path
        d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
    </svg>
                        </a>
                        <a>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            className="fill-current">
                            <path
                            d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path>
                        </svg>
                        </a>
                        <a>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            className="fill-current">
                            <path
                            d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path>
                        </svg>
                        </a> */}
                        </div>
                    </div>

                      {/* Column CopyRight*/}
                      <p className='text-lg self-center lg:self-end'>© {new Date().getFullYear()} Jabador - All rights reserved</p>
                </div>
            </div>
        </Footer>
    );
};

export default FooterMenu;
