import React, { useState } from 'react';
import { ArrowRight, Quote, Compass, Instagram } from 'lucide-react';
import { TikTokIcon } from './TikTokIcon';

interface ManifestoSlide {
  id: number;
  partTitle: string;
  tag: string;
  scriptHeading: string;
  text: string;
  highlights: string[];
  signature?: string;
}

const MANIFESTO_SLIDES: ManifestoSlide[] = [
  {
    id: 1,
    partTitle: 'The Creative Community',
    tag: 'CULTURE & VISION',
    scriptHeading: 'Luxe Vogue Lifestyle',
    text: "LVL is a fashion and creative community built around culture, self-expression, and bringing people together through creativity and shared vision. We’re focused on creating intentional content, hosting fashion shoots, collaborating with creatives, and building a strong community around fashion, design, music, and visual storytelling.",
    highlights: [
      'Intentional Content Creation',
      'High-Fashion Shoots',
      'Creative Collaborations',
      'Design, Music & Visual Storytelling'
    ]
  },
  {
    id: 2,
    partTitle: 'The Movement & Foundation',
    tag: 'BEYOND THE RUNWAY',
    scriptHeading: 'Luxe Vogue Lifestyle',
    text: "This is more than just posting clothes. LVL is about creating moments, building connections, and creating something people genuinely want to be part of. Right now, we’re building the foundation. The vision is much bigger – future collaborations, larger projects, events, creative campaigns, and a community with real presence and impact. This is only the beginning.",
    highlights: [
      'Authentic Connections',
      'Impactful Campaigns',
      'Larger Scale Events',
      'Long-Term Creative Presence'
    ],
    signature: 'LVL.'
  }
];

export const BrandManifestoSection: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState<number>(0);

  return (
    <section id="brand-manifesto-section" className="py-16 sm:py-24 bg-black border-b border-neutral-900 relative overflow-hidden">
      
      {/* Noir Satin & Silk Textured Atmospheric Gradients */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        {/* Deep crimson flare */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-gradient-to-b from-[#801424]/25 via-red-950/10 to-transparent blur-[120px] rounded-full" />
        <div className="absolute -bottom-20 left-10 w-96 h-96 bg-[#801424]/15 rounded-full blur-[100px]" />
        
        {/* Subtle geometric luxury damask line overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_60%,transparent_100%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Top Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#801424]/20 border border-[#9e1b32]/50 text-xs font-bold text-red-400 uppercase tracking-widest font-display shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span>Brand Manifesto & Creative Vision</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white uppercase font-display tracking-tight leading-tight">
            Inside <span className="text-[#dc2626]">LVL</span>
          </h2>

          <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Discover the philosophy driving Luxe Vogue Lifestyle — an intentional movement at the crossroads of East African youth culture, fashion, and visual storytelling.
          </p>

          {/* Mobile Slide Switcher Tabs */}
          <div className="flex sm:hidden items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setActiveSlide(0)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                activeSlide === 0 
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' 
                  : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
              }`}
            >
              Part 1: The Community
            </button>
            <button
              type="button"
              onClick={() => setActiveSlide(1)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                activeSlide === 1 
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' 
                  : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
              }`}
            >
              Part 2: The Vision
            </button>
          </div>
        </div>

        {/* Side-by-Side Luxury Editorial Cards (Desktop) / Tabbed (Mobile) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 max-w-6xl mx-auto">
          {MANIFESTO_SLIDES.map((slide, idx) => {
            const isSelectedOnMobile = activeSlide === idx;

            return (
              <div
                key={slide.id}
                className={`${
                  isSelectedOnMobile ? 'flex' : 'hidden sm:flex'
                } flex-col justify-between relative rounded-3xl p-6 sm:p-10 bg-gradient-to-b from-neutral-900/90 via-neutral-950 to-black border-2 border-neutral-800/90 hover:border-[#9e1b32]/80 transition-all duration-300 shadow-2xl shadow-black group`}
              >
                {/* Subtle Inner Glow Border */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#801424]/10 rounded-bl-full blur-2xl pointer-events-none" />

                <div className="space-y-6">
                  
                  {/* Top Bar: Tag & Part Marker */}
                  <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      <span className="text-[11px] sm:text-xs font-mono font-bold text-red-400 uppercase tracking-widest">
                        {slide.tag}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
                      {slide.partTitle}
                    </span>
                  </div>

                  {/* Script Brand Title (Luxe Vogue Lifestyle) */}
                  <div className="text-center sm:text-left pt-2">
                    <h3 className="font-script text-4xl sm:text-6xl text-neutral-100 tracking-wide select-none drop-shadow-[0_2px_12px_rgba(220,38,38,0.3)]">
                      {slide.scriptHeading}
                    </h3>
                  </div>

                  {/* Editorial Manifesto Body Text */}
                  <div className="relative pt-2 pb-4">
                    <Quote className="w-8 h-8 text-[#801424]/40 absolute -top-3 -left-3 -z-10" />
                    <p className="font-italic-serif text-lg sm:text-2xl text-neutral-200 leading-relaxed sm:leading-loose tracking-wide font-normal">
                      "{slide.text}"
                    </p>
                  </div>

                  {/* Pillar Highlights Badges */}
                  <div className="space-y-2 pt-2 border-t border-neutral-800/60">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider font-mono block">
                      Core Pillars:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {slide.highlights.map((highlight, hIdx) => (
                        <span
                          key={hIdx}
                          className="text-[11px] sm:text-xs px-3 py-1 rounded-full bg-neutral-950 border border-neutral-800 text-neutral-300 font-medium group-hover:border-neutral-700 transition-colors"
                        >
                          • {highlight}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Footer Signature */}
                <div className="mt-8 pt-4 border-t border-neutral-900 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
                    <Compass className="w-3.5 h-3.5 text-red-500" />
                    <span>Nairobi, Kenya</span>
                  </div>

                  {slide.signature ? (
                    <span className="font-display font-black text-xl text-red-500 tracking-wider">
                      {slide.signature}
                    </span>
                  ) : (
                    <span className="font-display font-bold text-xs uppercase tracking-widest text-neutral-400">
                      Metamorphosis 2026
                    </span>
                  )}
                </div>

              </div>
            );
          })}
        </div>

        {/* Bottom Callout Banner */}
        <div className="mt-12 sm:mt-16 max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-neutral-950 via-[#801424]/15 to-neutral-950 border border-neutral-800 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1.5">
            <h4 className="text-lg sm:text-xl font-bold text-white font-display uppercase tracking-wide">
              Be Part of the Metamorphosis
            </h4>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-xl">
              Witness the community and creative vision live on the runway. Follow our official channels for daily editorial drops and behind-the-scenes visuals.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href="https://www.instagram.com/luxevoguelifestyle?utm_source=ig_web_button_share_sheet&igsi=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-neutral-500 text-neutral-200 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
            >
              <Instagram className="w-4 h-4 text-rose-400" />
              <span>Instagram</span>
            </a>

            <a
              href="https://www.tiktok.com/@_luxevoguelifestyle_?is_from_webapp=1&sender_device=pc"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-neutral-500 text-neutral-200 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
            >
              <TikTokIcon className="w-4 h-4 text-neutral-200" />
              <span>TikTok</span>
            </a>

            <a
              href="#ticket-tiers-section"
              className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all cursor-pointer"
            >
              <span>Get Passes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
