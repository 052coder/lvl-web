import React from 'react';
import { Ticket, ArrowLeft, Instagram } from 'lucide-react';
import { EventSettings } from '../types';
import { AtelierLogo } from './AtelierLogo';
import { TikTokIcon } from './TikTokIcon';

interface HeaderProps {
  activeTab: 'buy' | 'organiser';
  setActiveTab: (tab: 'buy' | 'organiser') => void;
  settings: EventSettings;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  settings
}) => {
  const isOrganiserMode = activeTab === 'organiser';

  return (
    <header id="header-main" className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-neutral-800/80 shadow-xl shadow-black/80 pt-[env(safe-area-inset-top,0px)]">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand & Edition: Click the Logo to open Organiser Portal (Password: lvl.) */}
          <div 
            id="brand-logo-secret-portal"
            onClick={() => {
              if (activeTab === 'organiser') {
                setActiveTab('buy');
              } else {
                setActiveTab('organiser');
              }
            }}
            title="Open Organiser Portal & Gate Scanner"
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div>
              <AtelierLogo size="md" lightText={true} />
            </div>

            <div className="hidden md:block pl-3 border-l border-neutral-800">
              <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                Metamorphosis
              </span>
              <span className="block text-[11px] font-italic-serif text-red-400 font-semibold">
                AW26 Collection
              </span>
            </div>
          </div>

          {/* Navigation Controls */}
          <nav id="nav-tabs" className="flex items-center gap-2 sm:gap-4">
            {!isOrganiserMode && (
              <div className="hidden md:flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-neutral-400 font-display">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('model-lookbook-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Lookbook
                </button>
                <a
                  href="https://www.instagram.com/luxevoguelifestyle_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-[#9e1b32] transition-colors"
                  title="Follow @luxevoguelifestyle_ on Instagram"
                >
                  <Instagram className="w-3.5 h-3.5 text-rose-400" />
                  <span className="normal-case font-mono text-[11px]">Instagram</span>
                </a>
                <a
                  href="https://www.tiktok.com/@_luxevoguelifestyle_?is_from_webapp=1&sender_device=pc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-[#9e1b32] transition-colors"
                  title="Follow @_luxevoguelifestyle_ on TikTok"
                >
                  <TikTokIcon className="w-3.5 h-3.5 text-neutral-200" />
                  <span className="normal-case font-mono text-[11px]">TikTok</span>
                </a>
              </div>
            )}

            {/* Mobile Social buttons */}
            {!isOrganiserMode && (
              <div className="flex md:hidden items-center gap-1.5">
                <a
                  href="https://www.instagram.com/luxevoguelifestyle_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-neutral-900 border border-neutral-800 text-rose-400 hover:text-white hover:border-red-600 transition-colors"
                  title="Instagram @luxevoguelifestyle_"
                >
                  <Instagram className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://www.tiktok.com/@_luxevoguelifestyle_?is_from_webapp=1&sender_device=pc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-red-600 transition-colors"
                  title="TikTok @_luxevoguelifestyle_"
                >
                  <TikTokIcon className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {isOrganiserMode ? (
              <button
                id="btn-back-to-showcase"
                onClick={() => setActiveTab('buy')}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-neutral-900 border border-neutral-700 text-neutral-200 hover:text-white hover:border-red-600 hover:bg-neutral-800 transition-all cursor-pointer shadow-md min-h-[40px]"
              >
                <ArrowLeft className="w-4 h-4 text-red-500 shrink-0" />
                <span className="hidden xs:inline">Exit Organiser</span>
                <span className="xs:hidden">Exit</span>
              </button>
            ) : (
              <button
                id="tab-buy-tickets"
                onClick={() => {
                  setActiveTab('buy');
                  const el = document.getElementById('ticket-tiers-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold bg-gradient-to-r from-[#801424] via-[#9e1b32] to-[#b91c1c] hover:from-[#9e1b32] hover:to-[#dc2626] text-white shadow-lg shadow-[#801424]/30 transition-all cursor-pointer min-h-[40px]"
              >
                <Ticket className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span>Get Passes</span>
              </button>
            )}
          </nav>

        </div>
      </div>
    </header>
  );
};

