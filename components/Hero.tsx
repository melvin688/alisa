import React from 'react';
import { Page, Language } from '../types';
import { UI_TEXT } from '../constants';

interface HeroProps {
  setPage: (page: Page) => void;
  lang: Language;
}

export const Hero: React.FC<HeroProps> = ({ setPage, lang }) => {
  const t = UI_TEXT[lang].hero;

  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=2071&auto=format&fit=crop')",
        }}
      >
         <div className="absolute inset-0 bg-felix-teal/30 mix-blend-multiply"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-16">
        <h2 className="text-felix-pink uppercase tracking-[0.3em] text-sm md:text-lg mb-4 font-bold drop-shadow-md">
          {t.est}
        </h2>
        <h1 className="font-serif text-5xl md:text-8xl text-white mb-8 leading-tight drop-shadow-xl">
          {t.title_prefix} <br/> <span className="text-felix-gold italic">{t.title_suffix}</span>
        </h1>
        <p className="text-white text-lg md:text-xl font-light mb-10 max-w-2xl mx-auto drop-shadow-md">
          {t.desc}
        </p>
        <button 
          onClick={() => setPage(Page.SHOP)}
          className="bg-felix-gold text-felix-teal hover:bg-white hover:text-felix-teal transition-colors duration-300 font-serif px-10 py-4 text-lg tracking-widest uppercase shadow-xl"
        >
          {t.cta}
        </button>
      </div>

      {/* Decorative Border Bottom */}
      <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-felix-pink to-transparent"></div>
    </div>
  );
};