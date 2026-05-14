import React from 'react';
import { Language, Page } from '../types';

interface FeaturedRoastProps {
    lang: Language;
    setPage: (page: Page) => void;
}

export const FeaturedRoast: React.FC<FeaturedRoastProps> = ({ lang, setPage }) => {
    return (
        <div className="flex flex-col md:flex-row min-h-[600px] w-full bg-goffee-charcoal text-white">
            {/* Image Side */}
            <div className="w-full md:w-1/2 h-[400px] md:h-auto relative overflow-hidden">
                <img 
                    src="https://images.unsplash.com/photo-1610632380989-680fe40816c6?auto=format&fit=crop&q=80&w=1200" 
                    alt="Tokyo Kissa Bag" 
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"></div>
            </div>

            {/* Content Side */}
            <div className="w-full md:w-1/2 flex flex-col justify-center p-12 md:p-24">
                <h2 className="font-serif text-4xl md:text-5xl mb-6 leading-tight">
                    {lang === 'en' ? 'Tokyo Kissa Returns for Good' : '东京喫茶 永久回归'}
                </h2>
                <p className="font-light text-gray-300 text-lg leading-relaxed mb-10 max-w-lg">
                    {lang === 'en' 
                     ? "Our darkest roast yet is now available year-round. Experience this beautifully bittersweet and smoky best-selling coffee, honoring the history and artistry of Japanese kissatens. Also available as a subscription."
                     : "我们最深度的烘焙现已全年供应。体验这款畅销的苦甜烟熏风味咖啡，致敬日本喫茶店的历史与艺术。同时也提供订阅服务。"
                    }
                </p>
                <button 
                    onClick={() => setPage(Page.SHOP)}
                    className="border border-white text-white bg-transparent hover:bg-white hover:text-goffee-charcoal transition-all duration-300 py-4 px-10 uppercase tracking-widest text-sm font-bold w-fit"
                >
                    {lang === 'en' ? 'Shop Tokyo Kissa' : '选购 东京喫茶'}
                </button>
            </div>
        </div>
    );
};