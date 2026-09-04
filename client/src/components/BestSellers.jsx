

import React, { useEffect, useRef, useState } from "react";
import { Carousel, Spin } from "antd";
import axios from "axios";
import ProductCard from "./ProductCard";

const createSlidingWindows = (data, size) => {
  if (!Array.isArray(data) || data.length === 0) return [];
  if (data.length <= size) return [data];
  const result = [];
  for (let i = 0; i <= data.length - size; i++) {
    result.push(data.slice(i, i + size));
  }
  return result;
};

const BestSellerCarousel = () => {
  const carouselRef = useRef(null);

  const [windowSize, setWindowSize] = useState(4);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const resize = () => {
      if (window.innerWidth < 768) setWindowSize(2);
      else if (window.innerWidth < 1200) setWindowSize(3);
      else setWindowSize(4);
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    let active = true;

    const fetchBestSellers = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_SERVER_URL}/api/products/best-sellers`);
        if (!active) return;
        // Only show real best sellers; an empty list hides the section (below).
        setItems(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        if (!active) return;
        console.error("Error fetching best sellers:", err);
        setItems([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchBestSellers();
    const interval = setInterval(fetchBestSellers, 30000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const baseSlides = createSlidingWindows(items, windowSize);
  const hasData = baseSlides.length > 0;

  const slides = hasData
    ? [baseSlides[baseSlides.length - 1], ...baseSlides, baseSlides[0]]
    : [];

  const handleBeforeChange = (_, next) => {
    if (!carouselRef.current) return;
    if (next === 0) {
      setTimeout(() => carouselRef.current.goTo(baseSlides.length, false), 0);
    }
    if (next === slides.length - 1) {
      setTimeout(() => carouselRef.current.goTo(1, false), 0);
    }
  };

  return (
    <section className="pt-12 md:pt-16 pb-4">
      {/* Header — always shown, even while loading or when there are no best sellers */}
      <div className="flex flex-col items-center text-center px-4 mb-6">
        <span className="text-[11px] tracking-[0.35em] uppercase text-amber-600 font-semibold mb-2">
          Customer favourites
        </span>
        <h2 className="text-3xl md:text-5xl font-bold text-[#15203a]">Best Sellers</h2>
        <span className="mt-3 w-16 h-1 rounded-full bg-amber-400" />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Spin />
        </div>
      ) : !hasData ? (
        <p className="text-center text-gray-400 py-10">No best sellers to show yet.</p>
      ) : (
        <Carousel
          ref={carouselRef}
          autoplay
          infinite={false}
          autoplaySpeed={4000}
          beforeChange={handleBeforeChange}
          initialSlide={1}
          className="max-w-7xl mx-auto px-2 sm:px-6 md:px-16 pb-6"
        >
          {slides.map((group, index) => (
            <div key={index}>
              <div
                className="flex justify-center items-stretch gap-3 sm:gap-5 p-2 sm:p-4 w-full"
                style={{ flexWrap: "nowrap" }}
              >
                {group.map((item) => {
                  const id = item.product_id || item.id;
                  return (
                    // flex:1 1 0 (not width %) so slides fill the row evenly in Safari/WebKit
                    <div key={id} style={{ flex: "1 1 0", minWidth: 0 }}>
                      <div className="mx-auto" style={{ maxWidth: 320 }}>
                        <ProductCard product={item} bestSeller />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </Carousel>
      )}
    </section>
  );
};

export default BestSellerCarousel;
