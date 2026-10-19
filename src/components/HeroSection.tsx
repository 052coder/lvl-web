import React from 'react';
import { Calendar, MapPin, ShieldCheck, Clock, ArrowDown, Instagram } from 'lucide-react';
import { EventSettings } from '../types';
import { TikTokIcon } from './TikTokIcon';

interface HeroSectionProps {
  settings: EventSettings;
  onExploreClick: () => void;
  onOpenPortal?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ settings, onExploreClick }) => {
  return (
    <section id="hero-section" className="relative overflow-hidden pt-10 pb-16 sm:py-24 bg-neutral-950 border-b border-neutral-900">
      
      {/* Background Architectural Grid Lines & Atmospheric Glow */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-[#801424]/20 via-[#801424]/5 to-transparent blur-3xl opacity-80" />
        <div className="absolute -bottom-10 right-10 w-96 h-96 bg-red-950/20 rounded-full blur-3xl" />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
        <div className="space-y-6 sm:space-y-8 max-w-4xl">
          
          {/* Top Atelier Badge & Social Links */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#801424]/20 border border-[#9e1b32]/40 text-[#f87171] text-xs font-bold tracking-widest uppercase shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              ATELIER LVL PRESENTATION
            </span>
            <a
              href="https://www.instagram.com/luxevoguelifestyle_/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-neutral-900/90 text-rose-300 hover:text-white border border-neutral-800 hover:border-neutral-700 text-xs font-medium transition-colors"
              title="Official Instagram @luxevoguelifestyle_"
            >
              <Instagram className="w-3.5 h-3.5 text-rose-400" />
              <span>Instagram</span>
            </a>
            <a
              href="https://www.tiktok.com/@_luxevoguelifestyle_?is_from_webapp=1&sender_device=pc"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-neutral-900/90 text-neutral-300 hover:text-white border border-neutral-800 hover:border-neutral-700 text-xs font-medium transition-colors"
              title="Official TikTok @_luxevoguelifestyle_"
            >
              <TikTokIcon className="w-3.5 h-3.5 text-neutral-200" />
              <span>TikTok</span>
            </a>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-neutral-900/90 text-neutral-300 border border-neutral-800 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              M-Pesa Pochi Checkout
            </span>
          </div>

          {/* Main Headline */}
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-[28px] xs:text-3xl sm:text-5xl md:text-7xl font-black tracking-tight text-white uppercase font-display leading-[1.0] break-words">
              METAMORPHOSIS:
            </h1>
            <div className="text-2xl xs:text-3xl sm:text-4xl md:text-6xl font-normal font-italic-serif text-[#dc2626] tracking-tight leading-[1.05]">
              AUTUMN / WINTER <span className="font-editorial not-italic font-bold text-white sm:text-[#dc2626]">2026</span>
            </div>
          </div>

          {/* Editorial Concept Paragraph */}
          <p className="text-sm sm:text-base md:text-lg text-neutral-300 font-normal max-w-3xl leading-relaxed">
            {settings.tagline} An exclusive runway showcase bridging architectural tailoring, experimental street silhouettes, and contemporary East African couture.
          </p>

          {/* Metadata Badges / Info Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-2">
            {/* Date */}
            <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 transition-colors flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#801424]/30 text-red-400 border border-[#9e1b32]/30 shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="text-left min-w-0">
                <div className="text-[9px] uppercase font-bold tracking-widest text-neutral-400 font-display">
                  DATE
                </div>
                <div className="text-xs sm:text-sm font-bold text-white mt-0.5 truncate">
                  {settings.date}
                </div>
              </div>
            </div>

            {/* Time */}
            <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 transition-colors flex items-center gap-3">
              <div className="p-2 rounded-xl bg-neutral-800 text-neutral-300 border border-neutral-700 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="text-left min-w-0">
                <div className="text-[9px] uppercase font-bold tracking-widest text-neutral-400 font-display">
                  TIME
                </div>
                <div className="text-xs sm:text-sm font-bold text-white mt-0.5 truncate">
                  {settings.time}
                </div>
              </div>
            </div>

            {/* Venue */}
            <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 transition-colors flex items-center gap-3 sm:col-span-1">
              <div className="p-2 rounded-xl bg-[#801424]/30 text-red-400 border border-[#9e1b32]/30 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="text-left min-w-0">
                <div className="text-[9px] uppercase font-bold tracking-widest text-neutral-400 font-display">
                  VENUE
                </div>
                <div className="text-xs sm:text-sm font-bold text-white mt-0.5 truncate">
                  {settings.venue}
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action & Quick Pass Tiers */}
          <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-center sm:justify-start gap-3 sm:gap-4">
            <button
              id="btn-hero-explore-tickets"
              onClick={onExploreClick}
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-[#801424] via-[#9e1b32] to-[#dc2626] hover:from-[#9e1b32] hover:to-[#ef4444] text-white font-extrabold text-sm sm:text-base transition-all shadow-xl shadow-[#801424]/40 flex items-center justify-center gap-2 group cursor-pointer min-h-[48px]"
            >
              <span>Purchase Digital Passes</span>
              <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            </button>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-4 py-2.5 sm:px-5 sm:py-3.5 rounded-2xl sm:rounded-full bg-black/80 border border-neutral-800 text-xs text-neutral-300 shadow-inner">
              <span className="font-bold text-white uppercase text-[10px] tracking-wider">Passes:</span>
              <span className="text-red-400 font-bold">VIP KES 2,000</span>
              <span className="text-neutral-700 hidden xs:inline">•</span>
              <span className="text-neutral-200 font-medium">Regular KES 1,200</span>
              <span className="text-neutral-700 hidden xs:inline">•</span>
              <span className="text-rose-300 font-semibold">Group (6) KES 6,300</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
