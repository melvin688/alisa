import React, { useState } from 'react';
import { UI_TEXT, LOCAL_PRODUCTS } from '../constants';
import { Product, Language } from '../types';
import { ProductSpotlight } from './ProductSpotlight';

interface ProductListProps {
  addToCart: (product: Product) => void;
  lang: Language;
}

export const ProductList: React.FC<ProductListProps> = ({ addToCart, lang }) => {
  const [activeCategory, setActiveCategory] = useState<'beans' | 'drink'>('beans');
  const products = LOCAL_PRODUCTS;
  const loading = false;
  const t = UI_TEXT[lang].products;

  const filteredProducts = products.filter(p => p.category === activeCategory);
  
  // Find the spotlight product (Hayes Valley)
  const spotlightProduct = products.find(p => p.id === 'hayes-valley');

  return (
    <div className="bg-white pb-20">
      {/* Category Tabs */}
      <div className="flex justify-center border-b border-gray-200 sticky top-[72px] bg-white z-40">
          <button 
            onClick={() => setActiveCategory('beans')}
            className={`px-8 py-5 font-bold uppercase text-xs tracking-[0.2em] transition-colors relative ${
                activeCategory === 'beans' 
                ? 'text-goffee-charcoal after:absolute after:bottom-0 after:left-0 after:w-full after:h-1 after:bg-goffee-charcoal' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
              {t.beans}
          </button>
          <button 
            onClick={() => setActiveCategory('drink')}
            className={`px-8 py-5 font-bold uppercase text-xs tracking-[0.2em] transition-colors relative ${
                activeCategory === 'drink' 
                ? 'text-goffee-charcoal after:absolute after:bottom-0 after:left-0 after:w-full after:h-1 after:bg-goffee-charcoal' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
              {t.drinks}
          </button>
      </div>

      {/* Product Spotlight (Only for Beans category and if product exists) */}
      {loading ? (
        <div className="flex justify-center items-center py-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-goffee-charcoal"></div>
        </div>
      ) : (
        <>
        {activeCategory === 'beans' && spotlightProduct && (
            <ProductSpotlight product={spotlightProduct} addToCart={addToCart} lang={lang} />
        )}

        {/* Grid for other products */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center mb-16">
              <h3 className="text-gray-400 uppercase tracking-widest text-xs font-bold mb-2">
                  {activeCategory === 'beans' ? t.beans : t.drinks}
              </h3>
              <h2 className="text-3xl font-serif text-goffee-charcoal">{t.title}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              {filteredProducts
                  .filter(p => activeCategory === 'beans' ? p.id !== 'hayes-valley' : true)
                  .map((product) => {
                  const name = lang === 'zh' ? product.name_zh : product.name;
                  const description = lang === 'zh' ? product.description_zh : product.description;
                  
                  return (
                      <div key={product.id} className="group cursor-pointer">
                          <div className="relative overflow-hidden aspect-[4/5] bg-[#f4f4f4] mb-6">
                              <img 
                                  src={product.image} 
                                  alt={name} 
                                  className="w-full h-full object-cover mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
                              />
                              <button 
                                  onClick={() => addToCart(product)}
                                  className="absolute bottom-0 left-0 w-full bg-goffee-charcoal text-white py-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 font-bold uppercase text-xs tracking-widest"
                              >
                                  {t.addToCart}
                              </button>
                          </div>

                          <div className="text-center">
                              <h3 className="font-serif text-xl text-goffee-charcoal mb-2">{name}</h3>
                              <p className="text-gray-500 text-sm mb-3 max-w-xs mx-auto">{description}</p>
                              <p className="font-serif text-lg text-goffee-charcoal">${product.price.toFixed(2)}</p>
                          </div>
                      </div>
                  );
              })}
          </div>
        </div>
        </>
      )}
    </div>
  );
};