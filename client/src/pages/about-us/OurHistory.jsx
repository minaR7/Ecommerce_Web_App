import React from "react";
import { Row, Col } from "antd";

export default function OurStory() {
  return (
    <div  className="w-full min-h-screen font-['Crimson_Text'] text-[#3a3a3a]">
      {/* HERO SECTION */}
      <header style={{background: 'linear-gradient(180deg,rgba(52, 63, 77, 1) 0%, rgba(32, 40, 54, 1) 45%, rgba(14, 15, 17, 1) 100%)' }} 
      className="w-full text-center py-20 px-5 text-white">
        {/* bg-gradient-to-br from-[#2c5f6f] to-[#1a3d4a]  */}
        <h1 className="text-[56px] md:text-[48px] font-light tracking-[3px] font-['Cormorant_Garamond']">
          El-Maghrib
        </h1>
        <p className="text-[18px] md:text-[14px] font-normal tracking-[2px] uppercase opacity-90">
          Reviving the Sunnah
        </p>
        <p className="max-w-[800px] mx-auto mt-5 text-[24px] md:text-[20px] italic leading-[1.6] opacity-95">
          Born from memories stitched in Morocco and dreams carried across the sea.
        </p>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-[800px] w-full mx-auto py-16 px-6">
        {/* STORY CONTENT */}
        <article>
          <p className="story-text">
            In our family home in Safi, a cedar chest sat beneath a window that faced the sea.
            Inside were djellabas and thobes our grandparents kept for prayer and gatherings—
            neatly folded, hand-finished, scented faintly with orange blossom...
          </p>

          <p className="story-text">
            Years later, our lives brought us to Ireland, where another window faced the Atlantic.
            We found ourselves guided by a different light—the steady blink of a coastal lighthouse...
          </p>

          <hr className="my-12 w-[60px] h-[3px] mx-auto border-none bg-gradient-to-r from-[#343f4d] to-[#202836]" />

          <div className="pull-quote">
            El-Maghrib was born in that space between two shores.
          </div>

          <p className="story-text">
            Our name honours Morocco—the <span className="emphasis">Maghrib</span>—and the prayer
            that marks day's end...
          </p>

          <p className="story-text">
            We began by opening that cedar chest again. We studied the seams, the sfifa trims...
          </p>

          <hr className="my-12 w-[60px] h-[3px] mx-auto border-none bg-gradient-to-r from-[#343f4d] to-[#202836]" />

          <p className="story-text">
            El-Maghrib is crafted in Morocco, for life in Europe. Our pieces are made in small batches...
          </p>

          <p className="story-text">
            Ireland shaped our rhythm. Rain asks for fabrics that dry quickly...
          </p>

          <div className="pull-quote">
            Our history is a bridge—Andalusian echoes in Moroccan courtyards...
          </div>

          <p className="story-text">
            It is a promise that clothing can be a form of dhikr: a daily remembrance...
          </p>
        </article>

        {/* CLOSING BOX */}
        <div className="closing-statement text-center mt-16 p-10 bg-white rounded-lg shadow-lg">
          <div className="text-[24px] text-[#d4af37]">✦ ✦ ✦</div>

          <p className="closing-text">
            If you hold an El-Maghrib thobe, we hope you feel it: the steadiness of the lighthouse...
          </p>

          <p className="final-tagline font-semibold text-[28px] text-[#202836]">
            El-Maghrib. Reviving the Sunnah.
          </p>

          <div className="text-[24px] text-[#d4af37] mt-6">✦</div>
        </div>
      </main>
    </div>
  );
}
