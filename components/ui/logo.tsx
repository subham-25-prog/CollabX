import React from 'react';

export const LogoIcon = ({ className = "" }: { className?: string }) => (
  <div className={`relative w-8 h-8 flex items-center justify-center ${className}`}>
    <div className="absolute inset-0 bg-primary/40 blur-md rounded-full animate-pulse-slow"></div>
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 drop-shadow-[0_0_8px_var(--primary)]">
      <path d="M16 2L2 9L16 16L30 9L16 2Z" fill="url(#grad1)" fillOpacity="0.9" />
      <path d="M2 23L16 30L30 23V16L16 23L2 16V23Z" fill="url(#grad2)" fillOpacity="0.8" />
      <defs>
        <linearGradient id="grad1" x1="2" y1="2" x2="30" y2="16" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.7 0.25 240)" />
          <stop offset="1" stopColor="oklch(0.6 0.28 300)" />
        </linearGradient>
        <linearGradient id="grad2" x1="2" y1="16" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.4 0.25 280)" />
          <stop offset="1" stopColor="oklch(0.65 0.25 240)" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);
