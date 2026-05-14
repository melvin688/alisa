import React from 'react';
import { Product, Language } from '../types';

interface ProductSpotlightProps {
    product: Product;
    addToCart: (product: Product) => void;
    lang: Language;
}

export const ProductSpotlight: React.FC<ProductSpotlightProps> = ({ product, addToCart, lang }) => {
    const name = lang === 'zh' ? product.name_zh : product.name;
    const notes = lang === 'zh' ? product.notes_zh.join(', ') : product.notes.join(', ').toUpperCase();

    // Text Resources
    const t = {
        addToCart: lang === 'zh' ? '加入购物车' : 'ADD TO CART',
    };

    return (
        <div className="bg-[#f9f8f4] py-16 md:py-24 px-6 mb-16">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-24">
                {/* Product Image */}
                <div className="w-full md:w-1/2 flex justify-center">
                    <div className="relative w-[300px] md:w-[400px] aspect-[4/5] shadow-2xl rounded-sm overflow-hidden bg-white">
                        <img src={product.image} alt={name} className="w-full h-full object-cover mix-blend-multiply" />
                    </div>
                </div>

                {/* Product Details */}
                <div className="w-full md:w-1/2 flex flex-col">
                    <h1 className="font-serif text-4xl md:text-5xl text-goffee-charcoal mb-4">{name}</h1>
                    <p className="text-sm font-bold tracking-widest text-goffee-charcoal/70 uppercase mb-8">
                        {notes}
                    </p>

                    <div className="h-1 w-full bg-gray-200 mb-8 flex">
                         <div className="w-1/3 h-full bg-gray-400"></div>
                    </div>

                    <p className="font-serif text-lg text-gray-600 mb-8 leading-relaxed">
                        {lang === 'zh' ? product.description_zh : product.description}
                    </p>
                    
                    <button 
                        onClick={() => addToCart(product)}
                        className="w-full border border-goffee-charcoal py-4 flex justify-between items-center px-6 hover:bg-goffee-charcoal hover:text-white transition-colors group mb-6"
                    >
                        <span className="font-bold tracking-widest text-sm uppercase">{t.addToCart}</span>
                        <span className="font-serif text-lg">${product.price.toFixed(2)}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};