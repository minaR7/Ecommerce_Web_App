// import React from 'react';
// import { Carousel, Card, Rate } from 'antd';
// import { useNavigate } from 'react-router-dom';

// const { Meta } = Card;

// const carouselData = [
//   {
//     id: '1',
//     imageSrc: '/assets/slide-hero.jpg',
//     name: 'Product 1',
//     price: '$100',
//     value: 4.5
//   },
//   {
//     id: '2',
//     imageSrc: '/assets/moroccan-jabador.jpg.webp',
//     name: 'Product 2',
//     price: '$150',
//     value: 3.2
//   },
//   {
//     id: '3',
//     imageSrc: '/assets/slide-hero.jpg',
//     name: 'Product 3',
//     price: '$200',
//     value: 5
//   },
//   {
//     id: '4',
//     imageSrc: '/assets/jabador-white-and-gold-503x800.jpg',
//     name: 'Product 4',
//     price: '$120',
//     value: 3.5
//   },
//   {
//     id: '5',
//     imageSrc: '/assets/moroccan-thobes.jpg.webp',
//     name: 'Product 5',
//     price: '$90',
//     value: 4.2
//   },
//   {
//     id: '6',
//     imageSrc: 'https://via.placeholder.com/800x400',
//     name: 'Product 6',
//     price: '$180',
//     value: 4.0
//   }
// ];

// const createSlidingWindows = (data, windowSize) => {
//   const windows = [];
//   for (let i = 0; i <= data.length - windowSize; i++) {
//     windows.push(data.slice(i, i + windowSize));
//   }
//   return windows;
// };

// const CustomCarousel = () => {
//   const navigate = useNavigate();
//   const windowSize = 4;
//   const slides = createSlidingWindows(carouselData, windowSize);

//   return (
//    <>
//     <div className="flex flex-col justify-center items-center text-center px-4"  style={{paddingTop: "2rem", color: "#111226"}}>
//         <h1 className="text-3xl md:text-5xl font-bold mb-2">
//             Best Sellers
//         </h1>
//         <p className="text-lg md:text-2xl font-bold">
//             High Quality Moroccan Fashion
//         </p>
//     </div>
//     <Carousel autoplay autoplaySpeed={5000} style={{padding: "0rem 4rem 1rem 4rem"}}>
//       {slides.map((group, index) => (
//         <div key={index}>
//           <div
//             style={{
//               display: 'flex',
//               justifyContent: 'center',
//               gap: '16px',
//               flexWrap: 'wrap',
//               padding: '2rem',
//             }}
//           >
//             {group.map((item) => (
//               <Card
//                 key={item.id}
//                 hoverable
//                 style={{
//                   width: '23%',
//                   minWidth: '200px',
//                   flexGrow: 1,
//                   padding: '0.5rem',
//                   marginBottom: '1rem',
//                   boxShadow: '2px 3px 4px lightgray',
//                 }}
//                 cover={
//                   <img
//                     alt={item.name}
//                     src={item.imageSrc}
//                     style={{ height: '300px', objectFit: 'cover', cursor: 'pointer' }}
//                     onClick={() => navigate(`/product/${item.id}`)}
//                   />
//                 }
//               >
//                 <Meta title={item.name} description={item.price} />
//                 {/* <div style={{ marginTop: '0.5rem' }}>
//                   <Rate allowHalf disabled defaultValue={item.value} />
//                 </div> */}
//               </Card>
//             ))}
//           </div>
//         </div>
//       ))}
//     </Carousel>
//    </>
//   );
// };

// export default CustomCarousel;
import React, { useEffect, useRef, useState } from "react";
import { Carousel, Spin } from "antd";
import axios from "axios";
import ProductCard from "./ProductCard";
import CarouselArrow from "./CarouselArrow";

// Create sliding windows
const createSlidingWindows = (data, size) => {
  const result = [];
  for (let i = 0; i <= data.length - size; i++) {
    result.push(data.slice(i, i + size));
  }
  return result;
};

const CustomCarousel = () => {
  const carouselRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [windowSize, setWindowSize] = useState(4);

  // -----------------------------
  // Fetch API data
  // -----------------------------
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // const res = await fetch("/api/products");
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_SERVER_URL}/api/products`)
        const data = res.data;
        setProducts(data || []);
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // -----------------------------
  // Responsive logic
  // -----------------------------
  useEffect(() => {
    const resize = () => {
      if (window.innerWidth < 480) setWindowSize(2);      // very small
      else if (window.innerWidth < 768) setWindowSize(2); // small
      else if (window.innerWidth < 1200) setWindowSize(3);// medium
      else setWindowSize(4);                              // large
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const hasCarousel = products.length >= windowSize;
  const baseSlides = hasCarousel ? createSlidingWindows(products, windowSize) : [];

  // Infinite loop slides (only when there are enough products for a carousel)
  const slides = hasCarousel
    ? [baseSlides[baseSlides.length - 1], ...baseSlides, baseSlides[0]]
    : [];

  const handleBeforeChange = (_, next) => {
    if (next === 0) {
      setTimeout(() => carouselRef.current.goTo(baseSlides.length, false), 0);
    }
    if (next === slides.length - 1) {
      setTimeout(() => carouselRef.current.goTo(1, false), 0);
    }
  };

  return (
    <section className="pt-12 md:pt-16">
      {/* Header — always shown, even while loading or when there are no products */}
      <div className="flex flex-col items-center text-center px-4 mb-6">
        <span className="text-[11px] tracking-[0.35em] uppercase text-amber-600 font-semibold mb-2">
          Shop the look
        </span>
        <h2 className="text-3xl md:text-5xl font-bold text-[#15203a]">Our Products</h2>
        <span className="mt-3 w-16 h-1 rounded-full bg-amber-400" />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spin size="large" />
        </div>
      ) : products.length === 0 ? (
        <p className="text-center text-gray-400 py-10">No products available yet.</p>
      ) : !hasCarousel ? (
        // Some products, but too few for the sliding carousel — show them in a row.
        <div className="flex justify-center items-stretch flex-wrap gap-3 sm:gap-5 max-w-7xl mx-auto px-2 sm:px-6 md:px-16 pb-6">
          {products.map((item) => (
            <div key={item.product_id} className="min-w-0 w-full" style={{ maxWidth: 320 }}>
              <ProductCard product={item} />
            </div>
          ))}
        </div>
      ) : (
        <div className="relative max-w-7xl mx-auto px-2 sm:px-6 md:px-16">
          <CarouselArrow dir="prev" onClick={() => carouselRef.current?.prev()} />
          <CarouselArrow dir="next" onClick={() => carouselRef.current?.next()} />
          <Carousel
            ref={carouselRef}
            autoplay
            infinite={false}
            autoplaySpeed={4000}
            beforeChange={handleBeforeChange}
            initialSlide={1}
            className="pb-6"
          >
            {slides.map((group, index) => (
              <div key={index}>
                <div
                  className="flex justify-center items-stretch gap-3 sm:gap-5 p-2 sm:p-4 w-full"
                  style={{ flexWrap: "nowrap" }}
                >
                  {group.map((item) => (
                    // flex:1 1 0 (not width %) so slides fill the row evenly in Safari/WebKit
                    <div key={item.product_id} style={{ flex: "1 1 0", minWidth: 0 }}>
                      <div className="mx-auto" style={{ maxWidth: 320 }}>
                        <ProductCard product={item} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      )}
    </section>
  );
};

export default CustomCarousel;
