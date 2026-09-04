import React from "react";
import { useNavigate } from "react-router-dom";
import { StarFilled } from "@ant-design/icons";

const PLACEHOLDER = "/assets/moroccan-jabador.jpg.webp";

const fmt = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(2) : v;
};

/**
 * Shared storefront product card used by the "Our Products" and
 * "Best Sellers" carousels. Handles discount badge, struck-through original
 * price, hover overlay and a graceful image fallback.
 *
 * `bestSeller` gives the card a distinct look (gold star badge, amber hover
 * bar and a subtle amber frame) so the two rows are easy to tell apart.
 */
const ProductCard = ({ product, aspect = "aspect-[4/5]", bestSeller = false }) => {
  const navigate = useNavigate();

  const id       = product.product_id ?? product.id;
  const name     = product.name || "Product";
  const cover    = product.cover_img || product.imageSrc || PLACEHOLDER;
  const discount = Number(product.discount_percentage) || 0;

  const hasPrices = product.price != null;
  const price       = hasPrices ? fmt(product.price) : null;
  const discounted  = product.discounted_price != null ? fmt(product.discounted_price) : price;
  const showStrike  = discount > 0 && price && discounted && price !== discounted;

  const go = () => id != null && navigate(`/product/${id}`);

  return (
    <div
      onClick={go}
      className={`group relative flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full
        ${bestSeller ? " ring-1 ring-amber-200/50" : "border border-gray-100"}`}
    >
      {/* Image */}
      <div className={`relative overflow-hidden bg-[#f0f0ee] ${aspect}`}>
        <img
          src={cover}
          alt={name}
          loading="lazy"
          onError={(e) => { if (e.currentTarget.src !== window.location.origin + PLACEHOLDER) e.currentTarget.src = PLACEHOLDER; }}
          className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />

        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow">
            -{discount}%
          </span>
        )}

        {/* {bestSeller && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-amber-400 text-[#15203a] text-[11px] font-bold px-2.5 py-1 rounded-full shadow">
            <StarFilled className="text-[10px]" /> Bestseller
          </span>
        )} */}

        {/* Hover "View Product" bar */}
        <div className={`absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 text-center py-2.5 text-sm font-medium tracking-wide
          ${bestSeller ? "bg-amber-400/95 text-[#15203a]" : "bg-[#15203a]/90 text-white"}`}>
          View Product
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-1">
        <h3 className="text-[15px] font-medium text-[#15203a] truncate" title={name}>
          {name}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-[#15203a]">€{discounted}</span>
          {showStrike && (
            <span className="text-sm text-gray-400 line-through">€{price}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
