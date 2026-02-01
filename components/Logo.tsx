
import React from 'react';

interface LogoProps {
  variant?: 'full' | 'icon' | 'compact';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ variant = 'full', className = '' }) => {
  const BrandIcon = ({ sizeClass = "w-20 h-20" }) => (
    <div className={`bg-[#f37021] rounded-none flex items-center justify-center ${sizeClass} shrink-0 relative p-1`}>
      <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current overflow-visible">
        {/* Sun - Large semi circle */}
        <path d="M15 52 A35 35 0 0 1 85 52 L15 52" fill="white" />
        
        {/* Large Bird (Silhouette) inside sun area */}
        <path 
          d="M32 48 C38 42 46 42 50 48 C54 42 62 42 68 48" 
          fill="none" 
          stroke="white" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        
        {/* Distant Bird 1 (above right) */}
        <path 
          d="M65 38 Q70 34 75 38" 
          fill="none" 
          stroke="white" 
          strokeWidth="1.8" 
          strokeLinecap="round" 
        />
        
        {/* Distant Bird 2 (top right) */}
        <path 
          d="M55 34 Q60 30 65 34" 
          fill="none" 
          stroke="white" 
          strokeWidth="1.8" 
          strokeLinecap="round" 
        />
        
        {/* Water Lines - Solid horizontal bars */}
        <rect x="5" y="56" width="90" height="3" fill="white" />
        <rect x="15" y="63" width="70" height="3" fill="white" />
        <rect x="30" y="70" width="40" height="2.5" fill="white" />
        <rect x="42" y="76" width="16" height="2" fill="white" />
      </svg>
    </div>
  );

  if (variant === 'icon') {
    return <BrandIcon sizeClass={className || "w-10 h-10"} />;
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <BrandIcon sizeClass="w-10 h-10" />
        <div className="flex flex-col justify-center">
          <span className="text-lg font-black tracking-tighter leading-none flex">
            <span className="text-[#8b1d3d]">H</span>
            <span className="text-[#f37021]">ORIZONT</span>
          </span>
          <span className="text-[9px] font-black text-[#8b1d3d] uppercase tracking-[0.05em] leading-none mt-0.5">Pflegedienst</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-4 ${className}`}>
      <BrandIcon sizeClass="w-24 h-24 md:w-28 md:h-28" />
      <div className="flex flex-col pt-1.5">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-[0.85] flex">
          <span className="text-[#8b1d3d]">H</span>
          <span className="text-[#f37021]">ORIZONT</span>
        </h1>
        <h2 className="text-2xl md:text-3xl font-black text-[#8b1d3d] tracking-tight leading-none mt-1">
          PFLEGEDIENST
        </h2>
        <p className="text-xs md:text-sm font-bold text-[#f37021] mt-2 tracking-wide">
          Qualität seit 2007
        </p>
      </div>
    </div>
  );
};

export default Logo;
