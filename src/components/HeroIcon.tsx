import React from 'react';

// This component renders the uploaded hero icon.
// Replace the src with the actual URL of your uploaded image.
export const HeroIcon = () => {
  return (
    <img 
      src="/hero-icon.png" 
      alt="Dream3r Hero Icon" 
      className="w-16 h-16 rounded-xl object-cover border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
      referrerPolicy="no-referrer"
    />
  );
};
