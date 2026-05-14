import React, { useState, useEffect } from 'react';
import { X, Thermometer, Droplets, Zap, Minus, Plus } from 'lucide-react';
import { Product, Language, CustomizationOptions } from '../types';

interface ProductCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onConfirm: (product: Product, options: CustomizationOptions) => void;
  lang: Language;
}

export const ProductCustomizationModal: React.FC<ProductCustomizationModalProps> = ({
  isOpen,
  onClose,
  product,
  onConfirm,
  lang
}) => {
  const [temperature, setTemperature] = useState<'Hot' | 'Ice'>('Ice');
  const [sweetness, setSweetness] = useState(50);
  const [strength, setStrength] = useState(50);

  // Reset defaults when product changes
  useEffect(() => {
    if (isOpen) {
        setTemperature('Ice');
        setSweetness(50);
        setStrength(50);
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const productName = lang === 'zh' ? product.name_zh : product.name;

  const handleIncrement = (setter: React.Dispatch<React.SetStateAction<number>>, value: number) => {
      setter(Math.min(100, value + 10));
  };

  const handleDecrement = (setter: React.Dispatch<React.SetStateAction<number>>, value: number) => {
      setter(Math.max(0, value - 10));
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
            <h3 className="font-serif text-xl">{lang === 'zh' ? '定制您的饮品' : 'Customize Your Drink'}</h3>
            <button onClick={onClose} className="hover:text-felix-gold transition-colors">
                <X size={24} />
            </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8 overflow-y-auto">
            <div className="text-center">
                <h4 className="font-serif text-2xl text-goffee-charcoal mb-2">{productName}</h4>
                <p className="text-sm text-gray-500 uppercase tracking-widest font-bold">${product.price.toFixed(2)}</p>
            </div>

            {/* Temperature */}
            <div>
                <div className="flex items-center gap-2 mb-4 text-goffee-charcoal">
                    <Thermometer size={18} />
                    <span className="font-bold text-xs uppercase tracking-widest">{lang === 'zh' ? '温度' : 'Temperature'}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => setTemperature('Ice')}
                        className={`py-3 px-4 border text-sm font-serif transition-all ${
                            temperature === 'Ice' 
                            ? 'bg-blue-50 border-blue-500 text-blue-700' 
                            : 'border-gray-200 text-gray-500 hover:border-gray-400'
                        }`}
                    >
                        {lang === 'zh' ? '冰 (Ice)' : 'Ice'}
                    </button>
                    <button 
                        onClick={() => setTemperature('Hot')}
                        className={`py-3 px-4 border text-sm font-serif transition-all ${
                            temperature === 'Hot' 
                            ? 'bg-red-50 border-red-500 text-red-700' 
                            : 'border-gray-200 text-gray-500 hover:border-gray-400'
                        }`}
                    >
                        {lang === 'zh' ? '热 (Hot)' : 'Hot'}
                    </button>
                </div>
            </div>

            {/* Sweetness */}
            <div>
                <div className="flex items-center gap-2 mb-4 text-goffee-charcoal">
                    <Droplets size={18} />
                    <span className="font-bold text-xs uppercase tracking-widest">{lang === 'zh' ? '甜度' : 'Sweetness'}</span>
                </div>
                <div className="flex items-center justify-between border border-gray-200 rounded-md p-2">
                    <button 
                        onClick={() => handleDecrement(setSweetness, sweetness)}
                        className="p-2 text-gray-500 hover:text-goffee-charcoal hover:bg-gray-100 rounded transition-colors"
                        disabled={sweetness <= 0}
                    >
                        <Minus size={20} />
                    </button>
                    <span className="font-serif text-lg text-felix-teal w-16 text-center">{sweetness}%</span>
                    <button 
                        onClick={() => handleIncrement(setSweetness, sweetness)}
                        className="p-2 text-gray-500 hover:text-goffee-charcoal hover:bg-gray-100 rounded transition-colors"
                        disabled={sweetness >= 100}
                    >
                        <Plus size={20} />
                    </button>
                </div>
            </div>

            {/* Strength */}
            <div>
                <div className="flex items-center gap-2 mb-4 text-goffee-charcoal">
                    <Zap size={18} />
                    <span className="font-bold text-xs uppercase tracking-widest">{lang === 'zh' ? '浓度' : 'Strength'}</span>
                </div>
                <div className="flex items-center justify-between border border-gray-200 rounded-md p-2">
                    <button 
                        onClick={() => handleDecrement(setStrength, strength)}
                        className="p-2 text-gray-500 hover:text-goffee-charcoal hover:bg-gray-100 rounded transition-colors"
                        disabled={strength <= 0}
                    >
                        <Minus size={20} />
                    </button>
                    <span className="font-serif text-lg text-felix-teal w-16 text-center">{strength}%</span>
                    <button 
                        onClick={() => handleIncrement(setStrength, strength)}
                        className="p-2 text-gray-500 hover:text-goffee-charcoal hover:bg-gray-100 rounded transition-colors"
                        disabled={strength >= 100}
                    >
                        <Plus size={20} />
                    </button>
                </div>
            </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50">
            <button 
                onClick={() => onConfirm(product, { temperature, sweetness, strength })}
                className="w-full bg-goffee-charcoal text-white py-4 font-bold text-sm uppercase tracking-widest hover:bg-black transition-colors shadow-lg"
            >
                {lang === 'zh' ? '加入购物车' : 'Add to Cart'}
            </button>
        </div>
      </div>
    </>
  );
};