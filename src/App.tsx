/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  AttendeeTicket, 
  EventSettings, 
  TicketTier 
} from './types';
import { 
  loadEventSettings, 
  loadTickets, 
  loadTicketTiers, 
  resetToDefaults, 
  saveEventSettings, 
  saveTickets, 
  saveTicketTiers 
} from './lib/storage';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { ModelLookbookShowcase } from './components/ModelLookbookShowcase';
import { TicketList } from './components/TicketList';
import { MpesaPaymentModal } from './components/MpesaPaymentModal';
import { TicketPassModal } from './components/TicketPassModal';
import { OrganiserPortal } from './components/OrganiserPortal';
import { TicketScanner } from './components/TicketScanner';
import { Sparkles, ShieldCheck, Smartphone, Instagram } from 'lucide-react';
import { TikTokIcon } from './components/TikTokIcon';

export default function App() {
  // Primary State
  const [settings, setSettings] = useState<EventSettings>(loadEventSettings);
  const [tiers, setTiers] = useState<TicketTier[]>(loadTicketTiers);
  const [tickets, setTickets] = useState<AttendeeTicket[]>(loadTickets);

  // Active Navigation Tab: 'buy' or 'organiser'
  const [activeTab, setActiveTab] = useState<'buy' | 'organiser'>('buy');

  // Modal States
  const [checkoutData, setCheckoutData] = useState<{ tier: TicketTier; quantity: number } | null>(null);
  const [activePassTicket, setActivePassTicket] = useState<AttendeeTicket | null>(null);
  const [scannerPrefillCode, setScannerPrefillCode] = useState<string | undefined>(undefined);

  // Sync to LocalStorage on updates
  useEffect(() => {
    saveEventSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveTicketTiers(tiers);
  }, [tiers]);

  useEffect(() => {
    saveTickets(tickets);
  }, [tickets]);

  // Handlers
  const handleSelectTierForPurchase = (tier: TicketTier, quantity: number) => {
    setCheckoutData({ tier, quantity });
  };

  const handlePaymentSuccess = (newTicket: AttendeeTicket) => {
    // 1. Update tickets list
    const updatedTickets = [newTicket, ...tickets];
    setTickets(updatedTickets);

    // 2. Increment sold count for this tier
    const updatedTiers = tiers.map(t => {
      if (t.id === newTicket.tierId) {
        return { ...t, sold: Math.min(t.capacity, t.sold + newTicket.quantity) };
      }
      return t;
    });
    setTiers(updatedTiers);

    // 3. Close checkout modal and display the newly minted digital pass
    setCheckoutData(null);
    setActivePassTicket(newTicket);
  };

  const handleCheckInTicket = (ticketId: string): AttendeeTicket | null => {
    let checkedTicket: AttendeeTicket | null = null;
    const updated = tickets.map(t => {
      if (t.id.toLowerCase() === ticketId.toLowerCase() || t.mpesaCode.toLowerCase() === ticketId.toLowerCase()) {
        checkedTicket = {
          ...t,
          checkedIn: true,
          checkedInAt: new Date().toISOString(),
          checkedInBy: 'Gate Scanner'
        };
        return checkedTicket;
      }
      return t;
    });
    setTickets(updated);
    return checkedTicket;
  };

  const handleResetData = () => {
    const defaults = resetToDefaults();
    setSettings(defaults.settings);
    setTiers(defaults.tiers);
    setTickets(defaults.tickets);
  };

  const handleOpenScannerWithCode = (ticketId: string) => {
    setScannerPrefillCode(ticketId);
    setActiveTab('organiser');
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-neutral-100 selection:bg-red-600/30 selection:text-red-200">
      
      {/* Top Main Navigation (Secret Organiser Portal behind LVL logo) */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        myTicketsCount={tickets.length}
        settings={settings}
      />

      {/* Main App Content Views */}
      <main className="flex-1">
        
        {/* VIEW 1: BUY TICKETS / LANDING PAGE */}
        {activeTab === 'buy' && (
          <div className="space-y-4">
            <HeroSection
              settings={settings}
              onExploreClick={() => {
                const el = document.getElementById('ticket-tiers-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* Featured Models Lookbook Showcase */}
            <ModelLookbookShowcase />
            
            <TicketList
              tiers={tiers}
              onSelectTier={handleSelectTierForPurchase}
            />

            {/* Event Highlights Strip */}
            <section className="py-12 border-t border-neutral-900 bg-neutral-950">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2">
                    <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                      <Sparkles className="w-4 h-4" />
                      <span>Haute Couture Runway</span>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      Experience boundary-pushing collections from leading designers walking the illuminated LVL runway stage.
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2">
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                      <Smartphone className="w-4 h-4" />
                      <span>Direct Pochi la Biashara</span>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      Instant zero-friction payment directly into the verified event Pochi number (<span className="font-mono text-white">{settings.pochiNumber}</span>).
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2">
                    <div className="flex items-center gap-2 text-red-500 font-bold text-sm">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Live QR Gate Admissions</span>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      Every ticket issues a tamper-proof QR gate pass scanned directly at security with double-scan prevention.
                    </p>
                  </div>

                </div>
              </div>
            </section>
          </div>
        )}

        {/* VIEW 2: ORGANISER PORTAL (Contains Passes, Live Scanner without pass, Pricing & Seats, Pochi Settings) */}
        {activeTab === 'organiser' && (
          <OrganiserPortal
            settings={settings}
            tiers={tiers}
            tickets={tickets}
            onUpdateSettings={setSettings}
            onUpdateTiers={setTiers}
            onUpdateTickets={setTickets}
            onResetData={handleResetData}
            onCheckInTicket={handleCheckInTicket}
            onViewTicket={(t) => setActivePassTicket(t)}
          />
        )}

      </main>

      {/* M-Pesa Pochi Payment Checkout Modal */}
      {checkoutData && (
        <MpesaPaymentModal
          tier={checkoutData.tier}
          quantity={checkoutData.quantity}
          settings={settings}
          onClose={() => setCheckoutData(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Digital QR Ticket Pass Modal */}
      {activePassTicket && (
        <TicketPassModal
          ticket={activePassTicket}
          settings={settings}
          onClose={() => {
            setActivePassTicket(null);
            setScannerPrefillCode(undefined);
          }}
          onOpenScannerWithCode={handleOpenScannerWithCode}
        />
      )}

      {/* Footer */}
      <footer id="main-footer" className="bg-black border-t border-neutral-900 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          
          <div className="flex items-center gap-2">
            <span className="font-black text-white tracking-widest uppercase font-display">
              LVL FASHION RUNWAY
            </span>
            <span>•</span>
            <span>{settings.date}</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <a
              href="https://www.instagram.com/luxevoguelifestyle?utm_source=ig_web_button_share_sheet&igsi=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors"
              title="Instagram @luxevoguelifestyle"
            >
              <Instagram className="w-4 h-4 text-rose-400" />
              <span>@luxevoguelifestyle</span>
            </a>
            <a
              href="https://www.tiktok.com/@_luxevoguelifestyle_?is_from_webapp=1&sender_device=pc"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors"
              title="TikTok @_luxevoguelifestyle_"
            >
              <TikTokIcon className="w-4 h-4 text-neutral-200" />
              <span>@_luxevoguelifestyle_</span>
            </a>
            <span>Pochi: <strong className="text-red-400 font-mono">{settings.pochiNumber}</strong></span>
          </div>

        </div>
      </footer>

    </div>
  );
}
