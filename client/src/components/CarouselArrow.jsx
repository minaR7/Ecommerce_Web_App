import React from "react";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

/**
 * Floating prev/next navigation button for the product carousels.
 * Positioned at the vertical centre, just inside the carousel padding.
 */
const CarouselArrow = ({ dir = "next", onClick }) => {
  const isPrev = dir === "prev";
  return (
    <button
      type="button"
      aria-label={isPrev ? "Previous products" : "Next products"}
      onClick={onClick}
      className={`absolute top-1/2 -translate-y-1/2 z-20 hidden sm:flex items-center justify-center
        w-11 h-11 p-0! rounded-full! bg-white! text-[#15203a]! border-none! shadow-lg ring-1 ring-black/5
        hover:bg-[#15203a]! hover:text-white! hover:scale-105 transition-all duration-200
        ${isPrev ? "left-1 md:left-4" : "right-1 md:right-4"}`}
    >
      {isPrev ? <LeftOutlined /> : <RightOutlined />}
    </button>
  );
};

export default CarouselArrow;
