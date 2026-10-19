import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Ban, 
  EyeOff, 
  Wine, 
  DoorClosed, 
  Camera, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle,
  Sparkles,
  Shirt
} from 'lucide-react';

interface TermsAndConditionsProps {
  compact?: boolean;
}

export const EVENT_RULES = [
  {
    id: 'no-alcohol',
    icon: Wine,
    title: 'Strictly No Alcohol Provided / Zero Intoxication Policy',
    desc: 'Atelier LVL Kenya will not be providing any alcohol at the venue. Any guest found consuming unauthorized alcohol, smuggling beverages, or appearing visibly intoxicated will be immediately escorted out by event security.',
    highlight: 'No Alcohol Provided'
  },
  {
    id: 'disorderly-conduct',
    icon: Ban,
    title: 'Disorderly Conduct & Ejection (No Refunds)',
    desc: 'Anyone caught acting disorderly, creating disturbances, harassing attendees/models, or disobeying security instructions will be immediately ejected from the venue with zero refund under all circumstances.',
    highlight: 'Instant Ejection • No Refunds'
  },
  {
    id: 'identity-visibility',
    icon: EyeOff,
    title: 'Mandatory Facial & Identity Visibility',
    desc: 'For the safety of all guests and venue security verification, nobody is permitted to wear anything that fully conceals or covers their identity (e.g. balaclavas, ski masks, full-face disguises, or opaque face shields).',
    highlight: 'No Face Coverings'
  },
  {
    id: 'dress-code',
    icon: Shirt,
    title: 'Avant-Garde Street Couture & Tailoring',
    desc: 'Dress in high-fashion, avant-garde streetwear, or sophisticated architectural tailoring. Flip-flops, gym wear, or sloppy casuals are strictly prohibited at gate entry.',
    highlight: 'Street Couture / Tailoring'
  },
  {
    id: 'single-entry',
    icon: DoorClosed,
    title: 'Single Entry Gate Policy (No Passouts)',
    desc: 'Digital QR passes are strictly validated for one-time admission. Once admitted past the gate checkpoint, exiting the venue invalidates your pass. Re-entry requires purchasing a new ticket if capacity permits.',
    highlight: 'Strictly No Re-Entry'
  },
  {
    id: 'media-consent',
    icon: Camera,
    title: 'Media & Photography Consent',
    desc: 'By entering Atelier LVL Kenya Metamorphosis showcase, you consent to being photographed, recorded, and broadcast for official fashion show lookbooks, press coverage, and promotional releases.',
    highlight: 'Press & Media Consent'
  }
];

export const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({ compact = false }) => {
  const [isExpanded, setIsExpanded] = useState(!compact);

  return (
    <section id="terms-and-conditions" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-gradient-to-b from-neutral-900/90 via-neutral-950 to-black border-2 border-[#801424]/60 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Subtle glowing corner highlight */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#801424]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800/80">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#801424]/20 border border-[#9e1b32]/40 text-[10px] font-black text-red-400 uppercase tracking-widest font-display">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Atelier LVL Regulations</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white font-display uppercase tracking-wide">
              Terms of Admission & Code of Conduct
            </h3>
            <p className="text-xs text-neutral-400">
              Please review Atelier LVL house rules prior to purchasing passes. Admission is strictly contingent on compliance.
            </p>
          </div>

          {compact && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-200 transition-all cursor-pointer w-fit"
            >
              <span>{isExpanded ? 'Collapse Rules' : 'View Full Rules (6)'}</span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Rules Grid */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-6 animate-in fade-in duration-200">
            {EVENT_RULES.map((rule) => {
              const Icon = rule.icon;
              return (
                <div
                  key={rule.id}
                  className="p-5 rounded-2xl bg-black/60 border border-neutral-800 hover:border-red-900/60 transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="w-9 h-9 rounded-xl bg-red-950/60 border border-red-800/60 flex items-center justify-center text-red-400 group-hover:scale-105 transition-transform">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-900 text-red-300/90 border border-neutral-800">
                        {rule.highlight}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white font-display leading-tight">
                      {rule.title}
                    </h4>

                    <p className="text-xs text-neutral-400 leading-relaxed">
                      {rule.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Warning Callout Box */}
        <div className="mt-6 p-4 rounded-2xl bg-red-950/40 border border-red-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-300">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>
              <strong className="text-white">Strict Security Enforcement:</strong> By purchasing or holding a digital QR pass, you irrevocably agree to comply with all LVL house safety policies and security gate procedures.
            </span>
          </div>
          <span className="text-[10px] font-mono uppercase text-red-400/80 font-bold shrink-0">
            Zero-Tolerance Policy
          </span>
        </div>

      </div>
    </section>
  );
};
