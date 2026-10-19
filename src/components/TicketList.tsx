import React, { useState, useEffect } from 'react';
import { TicketTier } from '../types';
import { 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  Plus, 
  Minus, 
  Timer,
  AlertCircle
} from 'lucide-react';

interface TicketListProps {
  tiers: TicketTier[];
  onSelectTier: (tier: TicketTier, quantity: number) => void;
}

export const TicketList: React.FC<TicketListProps> = ({ tiers, onSelectTier }) => {
  // Quantities for each tier
  const [quantities, setQuantities] = useState<{ [tierId: string]: number }>({
    'flash-sale': 1,
    'early-bird': 1,
    vip: 1,
    regular: 1,
    'group-6': 1
  });

  // Current time for countdown updates
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const updateQuantity = (tierId: string, delta: number, maxAvailable: number) => {
    setQuantities(prev => {
      const current = prev[tierId] || 1;
      const next = Math.max(1, Math.min(maxAvailable, current + delta));
      return { ...prev, [tierId]: next };
    });
  };

  const getTimeRemaining = (expiresAt?: string) => {
    if (!expiresAt) return null;
    const diff = new Date(expiresAt).getTime() - now;
    if (diff <= 0) {
      return { isExpired: true, text: 'Sale Ended', days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    let text = '';
    if (days > 0) {
      text = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    } else {
      text = `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
    }

    return { isExpired: false, text, days, hours, minutes, seconds };
  };

  return (
    <section id="ticket-tiers-section" className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#801424]/20 border border-[#9e1b32]/40 text-xs font-bold text-red-400 uppercase tracking-widest font-display">
          <span>Official Event Passes</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase font-display">
          Metamorphosis <span className="font-italic-serif text-red-500 font-normal">Passes</span>
        </h2>
        <p className="text-sm sm:text-base text-neutral-400">
          Secure guaranteed admission to Atelier LVL Kenya AW26 Runway showcase with instant M-Pesa Pochi la Biashara checkouts.
        </p>
      </div>

      {/* Tier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
        {tiers.map((tier) => {
          const qty = quantities[tier.id] || 1;
          const seatsAvailable = Math.max(0, tier.capacity - tier.sold);
          const timeInfo = getTimeRemaining(tier.expiresAt);
          const isTimerExpired = Boolean(tier.isLimitedTime && timeInfo?.isExpired);
          const isSoldOut = seatsAvailable <= 0 || !tier.active || isTimerExpired;
          
          const isGroup = tier.groupSize > 1;
          const percentSold = Math.min(100, Math.round((tier.sold / tier.capacity) * 100));

          // Compute dynamic color styles from tier.accentColor or fallback defaults
          const accentColor = tier.accentColor || (
            tier.id === 'flash-sale' ? '#f59e0b' :
            tier.id === 'early-bird' ? '#10b981' :
            tier.id === 'vip' ? '#9e1b32' :
            tier.id === 'group-6' ? '#f43f5e' : '#a3a3a3'
          );

          const isLightAccent = ['#f59e0b', '#10b981', '#06b6d4', '#e5e5e5', '#ffffff', '#38bdf8'].includes(accentColor.toLowerCase());

          return (
            <div
              key={tier.id}
              id={`tier-card-${tier.id}`}
              style={{
                borderColor: accentColor,
                boxShadow: `0 20px 45px -15px ${accentColor}35`
              }}
              className="relative rounded-3xl flex flex-col justify-between transition-all duration-300 bg-gradient-to-b from-neutral-900 via-neutral-950 to-black border-2 p-4.5 sm:p-7"
            >
              {/* Top Tag Pill if any */}
              {tier.tag && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span
                    style={{
                      backgroundColor: accentColor,
                      color: isLightAccent ? '#000000' : '#ffffff',
                      boxShadow: `0 4px 15px ${accentColor}50`
                    }}
                    className="px-4 py-1 rounded-full text-[11px] font-black tracking-wider uppercase shadow-lg whitespace-nowrap"
                  >
                    {tier.tag}
                  </span>
                </div>
              )}

              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white font-display uppercase tracking-wide">
                      {tier.name}
                    </h3>
                    {isGroup && (
                      <span className="text-xs font-mono text-neutral-400">
                        Admits 6 Attendees
                      </span>
                    )}
                  </div>
                </div>

                {/* Live Countdown Timer if limited time */}
                {tier.isLimitedTime && timeInfo && (
                  <div
                    style={{
                      borderColor: `${accentColor}60`,
                      backgroundColor: `${accentColor}18`
                    }}
                    className={`my-3 p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                      timeInfo.isExpired ? 'bg-red-950/50 border-red-800/60 text-red-300' : ''
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: timeInfo.isExpired ? '#fca5a5' : accentColor }}>
                      <Timer className="w-3.5 h-3.5 shrink-0" />
                      <span>{timeInfo.isExpired ? 'Flash Sale Expired' : 'Sale Ends In:'}</span>
                    </div>
                    <div className="font-mono text-xs font-black tracking-wider" style={{ color: timeInfo.isExpired ? '#fca5a5' : '#ffffff' }}>
                      {timeInfo.text}
                    </div>
                  </div>
                )}

                {/* Price Display */}
                <div className="my-4 pb-4 border-b border-neutral-800/90">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs uppercase font-bold text-neutral-400">KES</span>
                    <span
                      style={{ color: accentColor }}
                      className="text-3xl sm:text-4xl font-black tracking-tight font-display"
                    >
                      {tier.price.toLocaleString()}
                    </span>
                    {tier.originalPrice && tier.originalPrice > tier.price && (
                      <span className="text-sm font-semibold line-through text-neutral-500">
                        KES {tier.originalPrice.toLocaleString()}
                      </span>
                    )}
                    <span className="text-xs text-neutral-400">
                      {isGroup ? '/ table (6 guests)' : '/ person'}
                    </span>
                  </div>
                  
                  {tier.originalPrice && tier.originalPrice > tier.price && (
                    <div className="text-xs font-mono mt-1" style={{ color: accentColor }}>
                      Save KES {(tier.originalPrice - tier.price).toLocaleString()} vs Standard Pass
                    </div>
                  )}
                  {isGroup && (
                    <div className="text-xs text-neutral-400 font-mono mt-1">
                      KES {(tier.price / 6).toFixed(0)} per guest • Save KES 900
                    </div>
                  )}
                </div>

                {/* Capacity & Scarcity Meter */}
                <div className="mb-5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">
                      {isTimerExpired 
                        ? 'Sale Window Closed' 
                        : isSoldOut 
                        ? 'Sold Out' 
                        : `${seatsAvailable} spots remaining`}
                    </span>
                    <span className="text-neutral-400 font-mono text-[11px]">
                      {tier.sold} sold / {tier.capacity}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentSold}%`,
                        backgroundColor: accentColor
                      }}
                    />
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-neutral-300 mb-5 leading-relaxed">
                  {tier.description}
                </p>

                {/* Perks List */}
                <div className="space-y-2.5 mb-6">
                  <div className="text-[11px] uppercase tracking-wider font-bold text-neutral-400">
                    What's Included:
                  </div>
                  {tier.perks.map((perk, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-200">
                      <div
                        style={{
                          backgroundColor: `${accentColor}25`,
                          color: accentColor
                        }}
                        className="mt-0.5 rounded-full p-0.5 shrink-0"
                      >
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quantity Selector & Action Button */}
              <div className="pt-4 border-t border-neutral-800/80 space-y-3.5">
                {!isSoldOut && (
                  <div className="flex items-center justify-between bg-black/70 p-2.5 rounded-2xl border border-neutral-800">
                    <span className="text-xs font-semibold text-neutral-400">
                      {isGroup ? 'Quantity (Tables)' : 'Quantity (Tickets)'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(tier.id, -1, seatsAvailable)}
                        disabled={qty <= 1}
                        className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg bg-neutral-800 text-neutral-200 hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-white font-mono">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(tier.id, 1, seatsAvailable)}
                        disabled={qty >= seatsAvailable}
                        className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg bg-neutral-800 text-neutral-200 hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                <button
                  id={`btn-buy-${tier.id}`}
                  onClick={() => onSelectTier(tier, qty)}
                  disabled={isSoldOut}
                  style={!isSoldOut ? {
                    background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                    boxShadow: `0 10px 25px -5px ${accentColor}50`,
                    color: isLightAccent ? '#000000' : '#ffffff'
                  } : undefined}
                  className={`w-full min-h-[48px] py-3.5 px-4 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99] ${
                    isSoldOut
                      ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                      : 'hover:opacity-95'
                  }`}
                >
                  {isTimerExpired ? (
                    <span className="flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" />
                      Flash Sale Ended
                    </span>
                  ) : isSoldOut ? (
                    <span>Tier Sold Out</span>
                  ) : (
                    <>
                      <span>
                        Buy {qty > 1 ? `${qty}x ` : ''}for KES {(tier.price * qty).toLocaleString()}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                
                <div className="text-center">
                  <span className="text-[11px] text-neutral-400 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Instant M-Pesa Pochi Verification
                  </span>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </section>
  );
};

