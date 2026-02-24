

import React, { useEffect, useRef, useState } from "react";
import { Carousel, Card } from "antd";
import { useNavigate } from "react-router-dom";

const { Meta } = Card;

const carouselData = [
  { id: "1", imageSrc: "/assets/slide-hero.jpg", name: "Product 1", price: "$100" },
  { id: "2", imageSrc: "/assets/moroccan-jabador.jpg.webp", name: "Product 2", price: "$150" },
  { id: "3", imageSrc: "/assets/slide-hero.jpg", name: "Product 3", price: "$200" },
  { id: "4", imageSrc: "/assets/jabador-white-and-gold-503x800.jpg", name: "Product 4", price: "$120" },
  { id: "5", imageSrc: "/assets/moroccan-thobes.jpg.webp", name: "Product 5", price: "$90" },
  { id: "6", imageSrc: "https://via.placeholder.com/800x400", name: "Product 6", price: "$180" }
];

// Create sliding windows
const createSlidingWindows = (data, size) => {
  const result = [];
  for (let i = 0; i <= data.length - size; i++) {
    result.push(data.slice(i, i + size));
  }
  return result;
};

const BestSellerCarousel = () => {
  const navigate = useNavigate();
  const carouselRef = useRef(null);

  const [windowSize, setWindowSize] = useState(4);

  // ✅ Responsive logic
  useEffect(() => {
    const resize = () => {
      if (window.innerWidth < 768) setWindowSize(2);       // small
      else if (window.innerWidth < 1200) setWindowSize(3); // medium
      else setWindowSize(4);                               // large
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const baseSlides = createSlidingWindows(carouselData, windowSize);

  // Infinite loop (virtual slides)
  const slides = [
    baseSlides[baseSlides.length - 1],
    ...baseSlides,
    baseSlides[0]
  ];

  const handleBeforeChange = (_, next) => {
    if (next === 0) {
      setTimeout(() => carouselRef.current.goTo(baseSlides.length, false), 0);
    }
    if (next === slides.length - 1) {
      setTimeout(() => carouselRef.current.goTo(1, false), 0);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col items-center text-center px-4 pt-8 text-[#111226]">
        <h1 className="text-3xl md:text-5xl font-bold mb-2">Best Sellers</h1>
        <p className="text-lg md:text-2xl font-bold">
          High Quality Moroccan Fashion
        </p>
      </div>

      {/* Carousel */}
      <Carousel
        ref={carouselRef}
        autoplay
        infinite={false}
        autoplaySpeed={4000}
        beforeChange={handleBeforeChange}
        initialSlide={1}
        className="px-4 md:px-16 pb-4"
      >
        {slides.map((group, index) => (
          <div key={index}>
            <div
              className="flex justify-center gap-4 p-4"
              style={{ flexWrap: "nowrap" }}   // ✅ IMPORTANT
            >
              {group.map((item) => (
                <Card
                  key={item.id}
                  hoverable
                  style={{
                    width: `${100 / windowSize}%`, // ✅ perfect fit
                    minWidth: 0,
                    boxShadow: "2px 3px 4px lightgray"
                  }}
                  cover={
                    <img
                      src={item.imageSrc}
                      alt={item.name}
                      onClick={() => navigate(`/product/${item.id}`)}
                      style={{
                        height: windowSize === 2 ? "200px" : "300px",
                        objectFit: "cover",
                        cursor: "pointer"
                      }}
                    />
                  }
                >
                  <Meta title={item.name} description={item.price} />
                </Card>
              ))}
            </div>
          </div>
        ))}
      </Carousel>
    </>
  );
};

export default BestSellerCarousel;
