import React from 'react';
import { Link } from 'react-router-dom';
import CustomCarousel from './components/Carousel';
import BestSellerCarousel from './components/BestSellers';
import { useSiteSettings } from './hooks/useSiteSettings';

const DEFAULTS = {
  hero:  '/assets/slide-hero.jpg',
  intro: '/assets/moroccan-jabador.jpg.webp',
  hero_eyebrow:    'Authentic Moroccan Craftsmanship',
  hero_heading:    'Jabador & Moroccan Thobes Online',
  hero_subheading: 'High-quality traditional fashion, handcrafted for every occasion.',
  hero_cta_text:   'Shop Collection',
  hero_cta_link:   '/store',
  intro_eyebrow:   'Our Story',
  intro_heading:   'Tradition woven into every thread',
  intro_text:      'Since 2009, JABADOR offers you the sale of traditional Moroccan dress such as the Jabador, Djellaba and Gandoura at a price everyone can afford, working with experienced Moroccan craftsmen. Our challenge is to give you the opportunity to buy a wide range of Moroccan clothes for all occasions (Muslim religious holidays, weddings, Hlal) in quality fabrics, linen, Mlifa (cotton), Gabardine and Velvet.',
};

// If an admin-uploaded image (served by the backend) fails to load — e.g. the
// API is down — silently fall back to the bundled local asset.
const imgFallback = (fallback) => (e) => {
  if (e.currentTarget.src !== window.location.origin + fallback) {
    e.currentTarget.src = fallback;
  }
};

const Home = () => {
  const { settings } = useSiteSettings();
  const s = (key) => settings[key] || DEFAULTS[key];

  // Content — all editable from Admin → Site Content → Homepage
  const heroSrc        = settings.hero_image_url  || DEFAULTS.hero;
  const introSrc       = settings.intro_image_url || DEFAULTS.intro;
  const heroEyebrow    = s('hero_eyebrow');
  const heroHeading    = s('hero_heading');
  const heroSubheading = s('hero_subheading');
  const heroCtaText    = s('hero_cta_text');
  const heroCtaLink    = s('hero_cta_link');
  const introEyebrow   = s('intro_eyebrow');
  const introHeading   = s('intro_heading');
  const introText      = s('intro_text');

  return (
    <div className="bg-[#f7f7f5]">
      {/* ── Hero / Cover ─────────────────────────────────────────────── */}
      <section className="relative w-full h-[420px] md:h-[576px] overflow-hidden">
        <img
          src={heroSrc}
          alt="Hero"
          onError={imgFallback(DEFAULTS.hero)}
          className="absolute inset-0 w-full h-full object-cover hp-hero-zoom"
        />
        {/* Dual gradient scrim: darken left for text + subtle bottom fade */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Overlay content */}
        <div className="relative z-10 h-full max-w-7xl mx-auto px-6 md:px-8 flex flex-col justify-center">
          <div className="max-w-2xl">
            {heroEyebrow && (
              <span className="hp-fade-up inline-flex items-center gap-2 mb-3 sm:mb-5 text-[10px] sm:text-xs md:text-sm tracking-[0.2em] sm:tracking-[0.3em] uppercase text-amber-300 font-semibold">
                <span className="w-6 sm:w-8 h-px bg-amber-300/70" />
                {heroEyebrow}
              </span>
            )}
            {/* `!` important overrides the global `h1 { font-size: 3.2em }`
                rule in index.css so these responsive sizes actually apply. */}
            <h1 className="hp-fade-up hp-delay-1 text-2xl! sm:text-4xl! md:text-5xl! lg:text-6xl! font-extrabold text-white leading-[1.12] sm:leading-[1.05] mb-3 sm:mb-5 drop-shadow-lg">
              {heroHeading}
            </h1>
            <p className="hp-fade-up hp-delay-2 text-sm sm:text-lg md:text-2xl text-gray-100/90 mb-6 sm:mb-9 max-w-xl">
              {heroSubheading}
            </p>
            <div className="hp-fade-up hp-delay-3 flex flex-wrap gap-4">
              <Link
                to={heroCtaLink}
                className="group px-6 py-2.5 text-sm sm:px-8 sm:py-3.5 sm:text-base border border-white/60 rounded-full bg-amber-400 text-[#15203a] font-semibold shadow-xl shadow-amber-900/20 hover:bg-amber-300 hover:-translate-y-0.5 transition-all duration-200"
              >
                {heroCtaText}
                <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
              </Link>
              {/* <Link
                to="/store"
                className="px-8 py-3.5 rounded-full border border-white/60 text-white font-semibold backdrop-blur-sm hover:bg-white hover:text-[#15203a] transition-all duration-200"
              >
                Explore New Arrivals
              </Link> */}
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        {/* <div className="hp-fade-in hp-delay-4 absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center text-white/70">
          <span className="text-[11px] tracking-[0.2em] uppercase mb-2">Scroll</span>
          <span className="w-px h-8 bg-gradient-to-b from-white/70 to-transparent" />
        </div> */}
      </section>

      {/* ── Introduction section ─────────────────────────────────────── */}
      <section
        className="relative overflow-hidden mt-10 md:mt-16"
        style={{ background: 'linear-gradient(135deg, #1a2030 0%, #202836 45%, #11131f 100%)' }}
      >
        {/* Decorative blurred accents */}
        <div className="pointer-events-none absolute -top-32 -left-24 w-80 h-80 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-0 w-96 h-96 rounded-full bg-cyan-400/10 blur-3xl" />
        {/* Subtle vertical hairline divider down the middle (desktop) */}
        <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-white/5 hidden md:block" />

        <div className="relative max-w-7xl mx-auto px-6 py-12 md:py-16 grid grid-cols-1 md:grid-cols-2 items-center gap-8 md:gap-14">
          {/* Text */}
          <div className="text-white order-2 md:order-1 max-w-xl">
            {introEyebrow && (
              <span className="inline-flex items-center gap-3 mb-3 text-[11px] tracking-[0.35em] uppercase text-amber-300/90 font-semibold">
                <span className="w-10 h-px bg-amber-300/60" />
                {introEyebrow}
              </span>
            )}
            <h2 className="font-serif text-3xl md:text-4xl lg:text-[2.6rem] font-semibold mb-4 leading-[1.15] tracking-tight">
              {introHeading}
            </h2>
            <p className="text-sm md:text-base font-light leading-[1.75] text-gray-300/90">
              {introText}
            </p>
            <Link
              to="/our-history"
              className="group inline-flex items-center gap-3 mt-6 px-6 py-2.5 rounded-full border border-amber-300/40 text-amber-200 font-medium hover:bg-amber-300 hover:text-[#15203a] hover:border-amber-300 transition-all duration-300"
            >
              Read our history
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>

          {/* Image */}
          <div className="order-1 md:order-2 flex justify-center md:justify-end">
            <figure className="group relative">
              {/* Soft glow */}
              <div className="absolute -inset-5 rounded-[2.25rem] bg-amber-400/15 blur-3xl transition-opacity duration-500 group-hover:opacity-80" />
              {/* Offset accent frame */}
              <div className="absolute -bottom-4 -right-4 w-full h-full rounded-[1.75rem] border border-amber-300/30 hidden md:block transition-transform duration-500 group-hover:translate-x-1 group-hover:translate-y-1" />
              <div className="relative rounded-[1.75rem] overflow-hidden shadow-2xl bg-white ring-1 ring-white/10" style={{ maxWidth: '300px' }}>
                <img
                  src={introSrc}
                  alt="Craftsmanship"
                  onError={imgFallback(DEFAULTS.intro)}
                  className="w-full h-auto object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
                  height="420"
                  width="300"
                />
                {/* Bottom gradient for depth */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
              {/* Est. badge */}
              <div className="absolute -top-4 -left-4 hidden md:flex flex-col items-center justify-center w-16 h-16 rounded-full bg-amber-400 text-[#15203a] shadow-xl">
                <span className="text-[9px] tracking-widest uppercase leading-none">Est.</span>
                <span className="text-lg font-bold leading-none mt-1">2009</span>
              </div>
            </figure>
          </div>
        </div>
      </section>

      {/* ── Product carousels ────────────────────────────────────────── */}
      <div className="py-5">
        <CustomCarousel />
        <BestSellerCarousel />
      </div>
    </div>
  );
};

export default Home;

/* ───────────────────────────────────────────────────────────────────────────
   PREVIOUS HOMEPAGE LAYOUT (kept for reference) — replaced by the redesign above.

import React from 'react';
import CustomCarousel from './components/Carousel';
import BestSellerCarousel from './components/BestSellers';
import { useSiteSettings } from './hooks/useSiteSettings';

const DEFAULT_HERO  = '/assets/slide-hero.jpg';
const DEFAULT_INTRO = '/assets/moroccan-jabador.jpg.webp';
const DEFAULT_TEXT  = 'Since 2009, JABADOR offers you the sale of traditional Moroccan dress such as the Jabador, Djellaba and Gandoura at a price everyone can afford, working with experienced Moroccan craftsmen. Our challenge is to give you the opportunity to buy a wide range of Moroccan clothes for all occasions (Muslim religious holidays, weddings, Hlal) in quality fabrics, linen, Mlifa (cotton), Gabardine and Velvet.';

const Home = () => {
  const { settings } = useSiteSettings();

  const heroSrc  = settings.hero_image_url  || DEFAULT_HERO;
  const introSrc = settings.intro_image_url || DEFAULT_INTRO;
  const introText = settings.intro_text     || DEFAULT_TEXT;

  return (
    <>
      {// Hero / Cover}
      <section className="relative w-full h-[400px] md:h-[600px] overflow-hidden">
        <img
          src={heroSrc}
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

      {// Introduction section}
      <section
        className="flex flex-col mt-6"
        style={{ background: 'radial-gradient(circle,rgba(52, 63, 77, 1) 0%, rgba(32, 40, 54, 1) 45%, rgba(17, 18, 38, 1) 100%)' }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto flex-grow px-6 md:px-6 py-8 md:py-18 gap-10 md:gap-0">
          <div className="max-w-xl text-white">
            <p className="text-lg md:text-xl font-normal leading-relaxed">
              {introText}
            </p>
          </div>
          <div className="relative w-full max-w-sm md:max-w-md pl-4">
            <div
              className="rounded-3xl overflow-hidden shadow-lg relative bg-white"
              style={{ maxWidth: '320px' }}
            >
              <img
                src={introSrc}
                alt="Craftsmanship"
                className="w-full h-auto object-cover"
                height="500"
                width="320"
              />
            </div>
          </div>
        </div>
      </section>

      <CustomCarousel />
      <BestSellerCarousel />
    </>
  );
};

export default Home;
─────────────────────────────────────────────────────────────────────────── */
