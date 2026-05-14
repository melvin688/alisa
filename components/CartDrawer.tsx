import React, { useState } from 'react';
import { X, Minus, Plus, Trash2, Loader2 } from 'lucide-react';
import { CartItem, Language, Page } from '../types';
import { UI_TEXT } from '../constants';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (index: number, delta: number) => void;
  onRemove: (index: number) => void;
  onClearCart: () => void;
  lang: Language;
  setPage: (page: Page) => void;
  orderName: string;
  setOrderName: (name: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ 
  isOpen, 
  onClose, 
  items, 
  onUpdateQuantity, 
  onRemove,
  onClearCart, 
  lang,
  setPage,
  orderName,
  setOrderName
}) => {
  const t = UI_TEXT[lang].cart;
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!orderName.trim()) {
      alert(lang === 'zh' ? '请输入取单人姓名' : 'Please enter a name for the order');
      return;
    }

    setCheckoutLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderName: orderName.trim(),
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            name_zh: item.name_zh,
            price: item.price,
            quantity: item.quantity,
            customization: item.customization || null,
          })),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const msg = lang === 'zh'
          ? `感谢您, ${orderName}! 订单 #${data.orderId} 已提交成功!`
          : `Thank you, ${orderName}! Order #${data.orderId} placed successfully!`;
        setOrderSuccess(msg);
        // Clear cart after successful order
        onClearCart();
        setOrderName('');
      } else {
        alert(data.error || (lang === 'zh' ? '下单失败，请重试' : 'Failed to place order. Please try again.'));
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert(lang === 'zh' ? '网络错误，请重试' : 'Network error. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Helper to generate a unique key for items (simple version)
  // In a real app, CartItem should probably have a unique instance ID, 
  // but here we use index or assume logic handles merging. 
  // For rendering, index is safe enough if array order is stable.

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full md:w-[450px] bg-white z-[70] transform transition-transform duration-300 shadow-2xl flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="font-serif text-2xl text-goffee-charcoal">{t.title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-goffee-charcoal transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Name Input Section */}
        {items.length > 0 && (
          <div className="p-6 bg-yellow-50/50 border-b border-gray-100">
             <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                {t.nameLabel} <span className="text-red-400">*</span>
             </label>
             <input 
               type="text" 
               value={orderName}
               onChange={(e) => setOrderName(e.target.value)}
               placeholder={t.namePlaceholder}
               className="w-full border border-gray-300 p-3 text-lg font-serif focus:outline-none focus:border-goffee-charcoal bg-white"
             />
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-gray-400">
              {orderSuccess ? (
                <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-green-700 space-y-2">
                  <p className="font-serif text-lg">✅</p>
                  <p className="font-serif text-lg">{orderSuccess}</p>
                  <button
                    onClick={() => { setOrderSuccess(null); onClose(); setPage(Page.SHOP); }}
                    className="mt-4 text-goffee-charcoal hover:text-gray-600 font-bold uppercase text-xs tracking-widest underline underline-offset-4"
                  >
                    {t.shopNow}
                  </button>
                </div>
              ) : (
                <>
                  <p className="font-serif text-lg">{t.empty}</p>
                  <button 
                    onClick={() => { onClose(); setPage(Page.SHOP); }}
                    className="text-goffee-charcoal hover:text-gray-600 font-bold uppercase text-xs tracking-widest underline underline-offset-4"
                  >
                    {t.shopNow}
                  </button>
                </>
              )}
            </div>
          ) : (
            items.map((item, index) => {
              const name = lang === 'zh' ? item.name_zh : item.name;
              // We use index as key here because we might have duplicate products with different customizations
              // Ideally, each added item gets a unique instance ID. 
              // For this demo, let's use a composite key or just index if we don't reorder.
              return (
                <div key={`${item.id}-${index}`} className="flex gap-4">
                  <div className="w-20 h-24 shrink-0 overflow-hidden rounded bg-gray-100">
                    <img src={item.image} alt={name} className="w-full h-full object-cover mix-blend-multiply" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-serif text-lg text-goffee-charcoal leading-tight">{name}</h3>
                        <button 
                          onClick={() => onRemove(index)}
                          className="text-gray-300 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      {/* Customization Details */}
                      {item.customization && (
                        <div className="mt-1 space-y-0.5">
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                            {item.customization.temperature} • {item.customization.sweetness}% Sweet • {item.customization.strength}% Str
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-end mt-2">
                      <p className="font-bold text-gray-600">${item.price.toFixed(2)}</p>
                      
                      <div className="flex items-center gap-3 border border-gray-200 rounded-sm px-2 py-1">
                        <button 
                          onClick={() => onUpdateQuantity(index, -1)}
                          className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-black disabled:opacity-30"
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => onUpdateQuantity(index, 1)}
                          className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-black"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600 font-light">{t.subtotal}</span>
              <span className="font-serif text-2xl text-goffee-charcoal">${subtotal.toFixed(2)}</span>
            </div>
            <button 
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="w-full bg-goffee-charcoal text-white font-bold py-4 text-sm tracking-[0.2em] hover:bg-black transition-colors shadow-lg uppercase disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {checkoutLoading && <Loader2 size={16} className="animate-spin" />}
              {t.checkout}
            </button>
          </div>
        )}
      </div>
    </>
  );
};