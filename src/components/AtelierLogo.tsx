import React from 'react';
import pantherLogoImg from '../assets/images/IMG_2934.jpeg';

interface AtelierLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  lightText?: boolean;
  showText?: boolean;
}

export const AtelierLogo: React.FC<AtelierLogoProps> = ({ 
  className = '', 
  size = 'md',
  lightText = true,
  showText = true
}) => {
  const badgeDimensions = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10 sm:w-11 sm:h-11',
    lg: 'w-13 h-13 sm:w-14 sm:h-14',
    xl: 'w-16 h-16 sm:w-20 sm:h-20'
  }[size];

  const atelierSize = {
    sm: 'text-[8px] tracking-[0.25em]',
    md: 'text-[9px] sm:text-[10px] tracking-[0.28em]',
    lg: 'text-[11px] sm:text-xs tracking-[0.3em]',
    xl: 'text-xs sm:text-sm tracking-[0.35em]'
  }[size];

  const brandSize = {
    sm: 'text-xs',
    md: 'text-sm sm:text-base',
    lg: 'text-lg sm:text-xl',
    xl: 'text-xl sm:text-2xl'
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3.5 select-none ${className}`}>
      {/* Circular Crimson Emblem with Twin Roaring Panthers */}
      <div className={`relative shrink-0 ${badgeDimensions} rounded-full overflow-hidden border border-[#9e1b32]/60 shadow-md shadow-[#801424]/40 bg-[#7a0f1d] flex items-center justify-center`}>
        <img 
          src={pantherLogoImg} 
          alt="Atelier LVL Panthers Logo" 
          className="w-full h-full object-cover transform scale-110"
          loading="eager"
        />
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <span className={`font-black uppercase text-[#a81c2f] font-sans ${atelierSize} pb-0.5`}>
            A T E L I E R
          </span>
          <span className={`font-bold font-editorial tracking-tight ${lightText ? 'text-white' : 'text-neutral-900'} ${brandSize}`}>
            LVL 
          </span>
        </div>
      )}
    </div>
  );
};

