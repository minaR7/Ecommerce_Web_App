import React, { useState } from 'react';
import { Layout, Menu, Drawer, Button, Card, Row, Col } from 'antd';
import CustomCarousel from './components/Carousel';
import { Link } from 'react-router-dom';

const Home = () => {
  const [visible, setVisible] = useState(false);

  const showDrawer = () => setVisible(true);
  const closeDrawer = () => setVisible(false);
  const subcategories = [
    { key: 'djellaba', label: 'Djellaba', img: '/assets/men/djellaba-man.jpg.webp', items: 12 },
    { key: 'jabador', label: 'Jabador', img: '/assets/men/jabador-man.jpg.webp', items: 6 },
    { key: 'moroccan-thobe', label: 'Moroccan Thobe', img: '/assets/men/moroccan-thobes.jpg.webp', items: 7 },
  ];

  return (
    <>
        <section className="relative w-full h-[400px] md:h-[600px] overflow-hidden">
            <img
                src="/assets/slide-hero.jpg" 
                alt="Hero"
                className="w-full h-full object-cover"
            />
            <div className="flex flex-col justify-center items-center text-center px-4">
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                    Jabador and Moroccan Thobes online
                </h1>
                <p className="text-lg md:text-2xl text-white">
                    High Quality Moroccan Fashion
                </p>
            </div>
        </section>
        <section className="w-full bg-[#f5f5f5]">
        {/* h-[400px] md:h-[600px]  */}
            <div className="flex flex-col justify-center items-center text-center px-4"  style={{paddingTop: "2rem", color: "#111226"}}>
                <h1 className="text-3xl md:text-5xl font-bold mb-2">
                Men's Collection.
                </h1>
                <p className="text-lg md:text-2xl font-bold">
                The MUST-HAVE
                </p>
            </div>
            {/* <div style={{ width: '100%', padding: '2rem 6rem 1em', margin: '16px 0px'}}> */}
                <Row className='mt-8 flex justify-center' style={{paddingBottom: '32px',}}> 
                    {subcategories.map((sub) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={sub.key} className='mx-8'>
                        <Link to={`/men/${sub.key}`}>
                            <Card
                                hoverable
                                cover={<img alt={sub.label} src={sub.img} width={300} height={320}  />}
                                style={{ position: 'relative',  fontSize: '20px', color: 'black' }}
                                className="home-page-card"
                            >
                            </Card>  
                        </Link>
                    </Col>
                        ))}
                </Row>
        </section>
        {/* <section className="relative w-full h-24 bg-black flex justify-center items-center px-4">
            <div className="max-w-5xl text-white text-center">
                <p className="text-sm md:text-lg leading-relaxed">
                Since 2009, JABADOR offers you the sale of traditional Moroccan dress such as the Jabador, Djellaba and Gandoura at a price everyone can afford, working with experienced Moroccan craftsmen. <br /><br />
                Our challenge is to give you the opportunity to buy a wide range of Moroccan clothes for all occasions (Muslim religious holidays, weddings, Hlal) in quality fabrics, linen, Mlifa (cotton), Gabardine and Velvet.
                </p>
            </div>
        </section>

        <div className="relative w-full flex justify-center">
            <img
                src="/assets/moroccan-jabador.jpg.webp"
                alt="Craftsmanship"
                className="-mt-24 z-10 object-cover"
                style={{ height: '100px', width: '200px' }}
            />
        </div> */}
        <section className="flex flex-col" 
            style={{background: "radial-gradient(circle,rgba(132, 152, 176, 1) 0%, rgba(71, 89, 122, 1) 45%, rgba(17, 18, 38, 1) 100%)"}}>
            <div className="flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto flex-grow px-6 md:px-6 py-8 md:py-18 gap-10 md:gap-0">
                <div className="max-w-xl text-white">
                    {/* <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6 select-none">
                    BEST GAMING SITE EVER!
                    </h1> */}
                    <p className="text-lg md:text-xl font-normal leading-relaxed">
                        Since 2009, JABADOR offers you the sale of traditional Moroccan dress such as the Jabador, Djellaba and Gandoura at a price everyone can afford, working with experienced Moroccan craftsmen.
                        Our challenge is to give you the opportunity to buy a wide range of moroccan clothes for all occasions (Muslim religious holidays, weddings, Hlal) in quality fabrics, linen, Mlifa (cotton), Gabardine and Velvet.
                    </p>
                </div>
                <div className="relative w-full max-w-sm md:max-w-md pl-4">
                    <div
                    className="rounded-3xl overflow-hidden shadow-lg relative bg-white"
                    style={{ maxWidth: '320px' }}
                    >
                        <img
                        src="/assets/moroccan-jabador.jpg.webp"
                        alt="Craftsmanship"
                        className="w-full h-auto object-cover"
                            height="500"
                            width="320"
                        />
                        {/* <div
                            className="absolute top-4 left-4 bg-[#0a6fff] text-white text-xs font-semibold px-3 py-1 rounded-full select-none"
                            style={{ minWidth: '40px', textAlign: 'center' }}
                        >
                            $22
                        </div>
                        <div
                            className="absolute bottom-4 left-4 bg-[#ff3b3b] text-white text-xs font-semibold px-3 py-1 rounded-full select-none"
                            style={{ minWidth: '40px', textAlign: 'center' }}
                        >
                            -40%
                        </div> */}
                    </div>
                </div>
            </div>
        </section>
        <CustomCarousel></CustomCarousel>
    </>
  );
};

export default Home;
