import React, { useState, useEffect } from 'react';
import { Page, Language } from '../types';
import { UI_TEXT } from '../constants';
import { ShoppingBag, Menu, X, Globe } from 'lucide-react';

interface NavbarProps {
  currentPage: Page;
  setPage: (page: Page) => void;
  cartCount: number;
  lang: Language;
  setLang: (lang: Language) => void;
  onOpenCart: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, setPage, cartCount, lang, setLang, onOpenCart }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = UI_TEXT[lang].nav;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLang = () => {
    setLang(lang === 'en' ? 'zh' : 'en');
  };

  const navClass = `fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
    scrolled || mobileMenuOpen ? 'bg-felix-teal text-white shadow-lg py-4' : 'bg-transparent text-felix-teal py-6'
  }`;

  const linkClass = (page: Page) => `cursor-pointer font-serif tracking-widest hover:text-felix-gold transition-colors text-sm uppercase ${
    currentPage === page ? 'text-felix-gold border-b border-felix-gold' : ''
  }`;

  return (
    <nav className={navClass}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <div 
          onClick={() => setPage(Page.HOME)}
          className="text-xl md:text-2xl font-serif font-bold tracking-widest cursor-pointer uppercase border-2 border-current px-4 py-1"
        >
          goffee coffee
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-12 items-center">
          <span onClick={() => setPage(Page.HOME)} className={linkClass(Page.HOME)}>{t.home}</span>
          <span onClick={() => setPage(Page.SHOP)} className={linkClass(Page.SHOP)}>{t.shop}</span>
          <span onClick={() => setPage(Page.LOCATIONS)} className={linkClass(Page.LOCATIONS)}>{t.locations}</span>
          <span onClick={() => setPage(Page.ABOUT)} className={linkClass(Page.ABOUT)}>{t.about}</span>
        </div>

        {/* Icons & Lang Switch */}
        <div className="flex items-center space-x-6">
          <button 
            onClick={toggleLang}
            className="hidden md:flex items-center gap-1 font-serif text-xs font-bold tracking-wider hover:text-felix-gold transition-colors"
          >
            <Globe size={16} />
            {lang === 'en' ? 'EN' : '中'}
          </button>

          <div className="relative cursor-pointer group" onClick={onOpenCart}>
            <ShoppingBag size={24} className="hover:text-felix-gold transition-colors" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-felix-gold text-felix-teal text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {cartCount}
              </span>
            )}
          </div>
          <div className="md:hidden cursor-pointer" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-felix-teal text-white flex flex-col items-center py-10 space-y-6 shadow-xl border-t border-felix-teal-light h-screen">
          <span onClick={() => { setPage(Page.HOME); setMobileMenuOpen(false); }} className="font-serif text-xl tracking-widest">{t.home}</span>
          <span onClick={() => { setPage(Page.SHOP); setMobileMenuOpen(false); }} className="font-serif text-xl tracking-widest">{t.shop}</span>
          <span onClick={() => { setPage(Page.LOCATIONS); setMobileMenuOpen(false); }} className="font-serif text-xl tracking-widest">{t.locations}</span>
          <span onClick={() => { setPage(Page.ABOUT); setMobileMenuOpen(false); }} className="font-serif text-xl tracking-widest">{t.about}</span>
          
          <button 
            onClick={toggleLang}
            className="flex items-center gap-2 font-serif text-lg tracking-wider text-felix-gold mt-4 border border-felix-gold px-4 py-1 rounded-full"
          >
            <Globe size={18} />
            {lang === 'en' ? 'Switch to 中文' : '切换到 English'}
          </button>
        </div>
      )}
    </nav>
  );
};