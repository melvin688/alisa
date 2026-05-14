import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Product, Language } from '../types';

interface BeanCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onConfirm: (product: Product) => void;
  lang: Language;
}

export const BeanCustomizationModal: React.FC<BeanCustomizationModalProps> = ({
  isOpen,
  onClose,
  product,
  onConfirm,
  lang
}) => {
  const [selectedSize, setSelectedSize] = useState<1 | 2 | 3>(1);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (isOpen) {
        setSelectedSize(1);
        setIsSubscribed(false);
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const name = lang === 'zh' ? product.name_zh : product.name;
  
  // Text Resources
  const t = {
    title: lang === 'zh' ? '选择规格' : 'Customize Your Beans',
    selectSize: lang === 'zh' ? '选择规格' : 'SELECT SIZE',
    help: lang === 'zh' ? '选购指南' : 'Need help choosing?',
    oneBag: lang === 'zh' ? '1 袋' : 'One Bag',
    twoBags: lang === 'zh' ? '2 袋' : 'Two Bags',
    threeBags: lang === 'zh' ? '3 袋' : 'Three Bags',
    off10: lang === 'zh' ? '省 10%' : '10% OFF',
    off17: lang === 'zh' ? '省 17.5%' : '17.5% OFF',
    addToCart: lang === 'zh' ? '加入购物车' : 'ADD TO CART',
    subscribe: lang === 'zh' ? '订阅并省钱' : 'SUBSCRIBE & SAVE',
  };

  // Price Calculation Logic
  const basePrice = product.price;
  
  const calculateTotal = (size: number, subscribed: boolean) => {
      let total = basePrice * size;
      
      // Bundle Discounts
      if (size === 2) {
          total = total * 0.90; // 10% off
      } else if (size === 3) {
          total = total * 0.825; // 17.5% off
      }

      // Subscription Discount
      if (subscribed) {
          total = total * 0.9166;
      }

      return total;
  };

  const currentPrice = calculateTotal(selectedSize, isSubscribed);
  const subscriptionPriceExample = calculateTotal(selectedSize, true);

  const handleConfirm = () => {
    // Create a unique variant for the cart
    const variantId = `${product.id}-size-${selectedSize}-${isSubscribed ? 'sub' : 'once'}`;
    const variantNameSuffix = lang === 'zh' 
        ? `(${selectedSize} 袋${isSubscribed ? ', 订阅' : ''})` 
        : `(${selectedSize} Bag${selectedSize > 1 ? 's' : ''}${isSubscribed ? ', Subscribed' : ''})`;
    
    // Create a new product object representing this specific variant
    const variantProduct: Product = {
        ...product,
        id: variantId,
        name: `${product.name} ${variantNameSuffix}`,
        name_zh: `${product.name_zh} ${variantNameSuffix}`,
        price: currentPrice, // Store total price as the item price
        // Note: quantity will be set to 1 by the cart logic, representing 1 bundle
    };

    onConfirm(variantProduct);
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 z-[90] transition-opacity backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[100] bg-white w-[90%] max-w-md shadow-2xl rounded-sm overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-goffee-charcoal text-white p-6 flex justify-between items-center">
            <h3 className="font-serif text-xl">{t.title}</h3>
            <button onClick={onClose} className="hover:text-felix-gold transition-colors">
                <X size={24} />
            </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8 overflow-y-auto">
            <div className="text-center">
                <h4 className="font-serif text-2xl text-goffee-charcoal mb-2">{name}</h4>
                <p className="text-sm text-gray-500 uppercase tracking-widest font-bold">${basePrice.toFixed(2)} / bag</p>
            </div>

            <div className="select-none">
                 <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500">{t.selectSize}</span>
                    <span className="text-xs underline cursor-pointer text-gray-500 hover:text-goffee-charcoal">{t.help}</span>
                 </div>
                 <div className="grid grid-cols-3 gap-3">
                     {/* Option 1 */}
                     <div 
                        onClick={() => setSelectedSize(1)}
                        className={`border-2 p-3 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 h-32 ${selectedSize === 1 ? 'border-goffee-charcoal bg-gray-50' : 'border-gray-200 hover:border-gray-400'}`}
                     >
                         <div className="w-5 h-7 border border-current mb-2 text-gray-600"></div>
                         <span className="font-serif text-sm text-center leading-tight">{t.oneBag}</span>
                     </div>

                     {/* Option 2 */}
                     <div 
                        onClick={() => setSelectedSize(2)}
                        className={`border-2 p-3 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 h-32 ${selectedSize === 2 ? 'border-goffee-charcoal bg-gray-50' : 'border-gray-200 hover:border-gray-400'}`}
                     >
                         <div className="flex gap-1 mb-2 text-gray-600">
                             <div className="w-4 h-6 border border-current"></div>
                             <div className="w-4 h-6 border border-current"></div>
                         </div>
                         <span className="font-serif text-sm text-center leading-tight text-gray-600">{t.twoBags}</span>
                         <span className="text-[9px] bg-gray-200 px-1.5 py-0.5 mt-1 font-bold">{t.off10}</span>
                     </div>

                     {/* Option 3 */}
                     <div 
                        onClick={() => setSelectedSize(3)}
                        className={`border-2 p-3 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 h-32 ${selectedSize === 3 ? 'border-goffee-charcoal bg-gray-50' : 'border-gray-200 hover:border-gray-400'}`}
                     >
                         <div className="flex gap-1 mb-2 text-gray-600">
                             <div className="w-3 h-5 border border-current"></div>
                             <div className="w-3 h-5 border border-current"></div>
                             <div className="w-3 h-5 border border-current"></div>
                         </div>
                         <span className="font-serif text-sm text-center leading-tight text-gray-600">{t.threeBags}</span>
                         <span className="text-[9px] bg-gray-200 px-1.5 py-0.5 mt-1 font-bold">{t.off17}</span>
                     </div>
                 </div>
            </div>

            <div 
                onClick={() => setIsSubscribed(!isSubscribed)}
                className="flex items-center gap-3 cursor-pointer group border-t border-b border-gray-100 py-4"
            >
                 <div className={`w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center transition-colors shrink-0 ${isSubscribed ? 'bg-goffee-charcoal border-goffee-charcoal' : 'group-hover:border-goffee-charcoal'}`}>
                    {isSubscribed && <div className="w-2 h-2 bg-white rounded-full"></div>}
                 </div>
                 <div className="flex flex-col">
                     <span className={`font-bold tracking-widest text-xs uppercase ${isSubscribed ? 'text-goffee-charcoal' : 'text-gray-500'}`}>
                        {t.subscribe}
                     </span>
                     {isSubscribed && <span className="text-[10px] text-green-600 font-bold">Best Value</span>}
                 </div>
                 <span className="ml-auto font-serif text-sm">${subscriptionPriceExample.toFixed(2)}</span>
            </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50">
            <button 
                onClick={handleConfirm}
                className="w-full bg-goffee-charcoal text-white py-4 flex justify-between items-center px-6 hover:bg-black transition-colors shadow-lg group"
            >
                <span className="font-bold text-sm uppercase tracking-widest">{t.addToCart}</span>
                <span className="font-serif text-lg">${currentPrice.toFixed(2)}</span>
            </button>
        </div>
      </div>
    </>
  );
};