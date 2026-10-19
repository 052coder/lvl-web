import React, { useState } from 'react';
import { Eye, X, ChevronRight, ZoomIn } from 'lucide-react';
import modelSankiImg from '../assets/images/Screenshot 2026-08-30 121841.png';
import modelWecheImg from '../assets/images/weche_poster_full.png';

export interface ModelFeature {
  id: string;
  modelNumber: string;
  name: string;
  subtitle?: string;
  tagline?: string;
  image: string;
  outfitBreakdown: string[];
  vibe: string;
}

export const FEATURED_MODELS: ModelFeature[] = [
  {
    id: 'model-015',
    modelNumber: '015',
    name: 'BELLE',
    tagline: 'Vibrant Nairobi street vitality paired with crisp tailored proportions.',
    image: modelSankiImg,
    outfitBreakdown: [
      'White short-sleeve crop top paired with dark/black jeans.',
      'A leopard-print belt with a gold buckle around the waistline.',
      'Layered gold chain necklaces, including one with a pendant depicting an Egyptian pharaoh profile'
    ],
    vibe: 'COUTURE'
  },
  {
    id: 'model-008',
    modelNumber: '008',
    name: 'WECHE',
    subtitle: 'NOT LOUD. JUST PRESENT. UNMISTAKABLE.',
    tagline: 'Architectural cropped denim layered with raw kinetic composure.',
    image: modelWecheImg,
    outfitBreakdown: [
      'Cropped Raw Dark Indigo Denim Jacket',
      'Oversized Pure Cotton Foundation Tee',
      'Wide-Leg Relaxed Denim & Minimalist Optics'
    ],
    vibe: 'RAW DENIM ARCHITECTURE'
  }
];

export const ModelLookbookShowcase: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<ModelFeature | null>(null);

  return (
    <section id="model-lookbook-section" className="py-14 sm:py-20 bg-neutral-950 border-b border-neutral-900 relative overflow-hidden">
      
      {/* Background Lighting Gradients */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-[#801424]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-red-950/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#801424]/20 border border-[#9e1b32]/40 text-xs font-bold text-red-400 uppercase tracking-widest font-display">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span>Metamorphosis Lookbook Series</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase font-display leading-tight">
              LVL Presents: <span className="font-italic-serif text-red-500 font-normal">The Models</span>
            </h2>
            <p className="text-sm sm:text-base text-neutral-400 max-w-xl">
              Meet the silhouettes walking the runway. High-contrast street couture captured against the vibrant pulse of Nairobi.
            </p>
          </div>
        </div>

        {/* 2-Column Side-by-Side Model Posters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
          {FEATURED_MODELS.map((model) => (
            <div
              key={model.id}
              id={`poster-${model.id}`}
              className="relative group rounded-3xl overflow-hidden bg-black border-2 border-neutral-800 hover:border-[#9e1b32] transition-all duration-300 shadow-2xl shadow-black flex flex-col cursor-pointer"
              onClick={() => setSelectedModel(model)}
            >
              
              {/* Top Bar with Badge */}
              <div className="px-5 py-3.5 bg-neutral-950/90 border-b border-neutral-800 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white font-display">
                    Model {model.modelNumber} • {model.name}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800">
                  {model.vibe}
                </span>
              </div>

              {/* Poster Image Container */}
              <div className="relative aspect-[3/4] sm:aspect-[4/5] bg-black overflow-hidden flex items-center justify-center">
                <img
                  src={model.image}
                  alt={`Model ${model.modelNumber} - ${model.name}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain object-center group-hover:scale-102 transition-transform duration-500 ease-out"
                />

                {/* Hover Quick Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <div className="flex items-center justify-between w-full">
                    <p className="text-xs text-neutral-300 line-clamp-2 max-w-[70%]">
                      {model.tagline}
                    </p>
                    <span className="px-3.5 py-2 rounded-xl bg-[#801424] text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-red-950">
                      <ZoomIn className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Info Bar */}
              <div className="p-4 sm:p-5 bg-neutral-900/60 border-t border-neutral-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-red-400 font-bold">
                    Official Lookbook Feature
                  </div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {model.name} {model.subtitle ? `— "${model.subtitle}"` : ''}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedModel(model);
                  }}
                  className="p-2.5 rounded-xl bg-neutral-800 hover:bg-[#801424] text-neutral-300 hover:text-white transition-colors"
                  title="View full lookbook details"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* Expanded Modal for Full Lookbook Inspection */}
      {selectedModel && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-2.5 sm:p-6 pb-safe pt-safe touch-scroll animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-neutral-950 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden text-neutral-100 flex flex-col md:flex-row max-h-[92dvh] sm:max-h-[90vh]">
            
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedModel(null)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 p-2 sm:p-2.5 rounded-full bg-black/80 hover:bg-neutral-800 border border-neutral-700 text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Left Poster Image View */}
            <div className="md:w-1/2 bg-black relative flex items-center justify-center p-3 sm:p-4 min-h-[200px] sm:min-h-[280px] md:min-h-[500px] max-h-[40vh] md:max-h-none shrink-0">
              <img
                src={selectedModel.image}
                alt={selectedModel.name}
                referrerPolicy="no-referrer"
                className="max-h-[38vh] md:max-h-[70vh] w-auto object-contain rounded-xl shadow-2xl"
              />
            </div>

            {/* Right Details View */}
            <div className="md:w-1/2 p-4 sm:p-8 flex flex-col justify-between overflow-y-auto space-y-4 sm:space-y-6 flex-1 touch-scroll">
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-xs uppercase tracking-[0.2em] font-bold text-red-400">
                    ATELIER LVL RUNWAY SHOWCASE
                  </span>
                  <h3 className="text-3xl sm:text-4xl font-black text-white uppercase font-display">
                    Model {selectedModel.modelNumber} • {selectedModel.name}
                  </h3>
                  {selectedModel.subtitle && (
                    <p className="text-xs font-mono text-neutral-400 uppercase tracking-wide">
                      "{selectedModel.subtitle}"
                    </p>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  {selectedModel.tagline} Featured as part of the Metamorphosis Autumn / Winter 2026 presentation at Nairobi National Museum.
                </p>

                {/* Outfit breakdown */}
                <div className="space-y-2 pt-2 border-t border-neutral-800">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    Runway Ensemble Breakdown:
                  </span>
                  <ul className="space-y-1.5 text-xs text-neutral-200">
                    {selectedModel.outfitBreakdown.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action */}
              <div className="pt-4 border-t border-neutral-800 flex items-center justify-between gap-3">
                <span className="text-xs text-neutral-400">
                  Style: <strong className="text-white">{selectedModel.vibe}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedModel(null);
                    const el = document.getElementById('ticket-tiers-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#801424] to-[#dc2626] text-white text-xs font-bold hover:brightness-110 transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-[#801424]/40"
                >
                  <span>Get Runway Pass</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </section>
  );
};
