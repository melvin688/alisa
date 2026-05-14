import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FeaturedRoast } from './components/FeaturedRoast';
import { ProductList } from './components/ProductList';
import { Locations } from './components/Locations';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { Toast } from './components/Toast';
import { ProductCustomizationModal } from './components/ProductCustomizationModal';
import { BeanCustomizationModal } from './components/BeanCustomizationModal';
import { AiConcierge } from './components/AiConcierge';
import { Page, Product, Language, CartItem, CustomizationOptions } from './types';
import { UI_TEXT } from './constants';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>(Page.HOME);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lang, setLang] = useState<Language>('en');
  const [orderName, setOrderName] = useState('');

  // Customization Modal State
  const [customizationProduct, setCustomizationProduct] = useState<Product | null>(null);
  const [beanCustomizationProduct, setBeanCustomizationProduct] = useState<Product | null>(null);

  // Called when user clicks "Add to Cart" on a product card
  const handleInitiateAddToCart = (product: Product) => {
    if (product.category === 'drink') {
      setCustomizationProduct(product);
    } else if (product.category === 'beans') {
      setBeanCustomizationProduct(product);
    } else {
      finalizeAddToCart(product);
    }
  };

  // Called after customization is confirmed or immediately for non-customizable items
  const finalizeAddToCart = (product: Product, options?: CustomizationOptions) => {
    setCart(prev => {
      const existingItemIndex = prev.findIndex(item => 
        item.id === product.id && 
        JSON.stringify(item.customization) === JSON.stringify(options)
      );

      if (existingItemIndex >= 0) {
        const newCart = [...prev];
        newCart[existingItemIndex].quantity += 1;
        return newCart;
      }
      
      return [...prev, { ...product, quantity: 1, customization: options }];
    });
    
    // Show feedback
    // Since the variant product name already includes the size details (e.g. "Name (2 Bags)"), we can use it directly or strip it for brevity.
    // For now, let's use the full name so they see what they added.
    const productName = lang === 'zh' ? product.name_zh : product.name;
    const msg = lang === 'zh' ? `已添加: ${productName}` : `Added to cart: ${productName}`;
    setToastMessage(msg);
    setIsCartOpen(true);
    setCustomizationProduct(null); // Close drink modal
    setBeanCustomizationProduct(null); // Close bean modal
  };

  // Remove Item from Cart (by index for uniqueness with customizations)
  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  // Update Quantity (by index for uniqueness with customizations)
  const updateQuantity = (index: number, delta: number) => {
    setCart(prev => prev.map((item, i) => {
      if (i === index) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  // Clear entire cart
  const clearCart = () => {
    setCart([]);
  };

  const renderContent = () => {
    switch (currentPage) {
      case Page.HOME:
        return (
          <>
            <Hero setPage={setCurrentPage} lang={lang} />
            <FeaturedRoast lang={lang} setPage={setCurrentPage} />
            <div className="bg-white py-24 text-center px-6">
              <h3 className="text-goffee-charcoal text-2xl md:text-3xl font-serif max-w-3xl mx-auto leading-relaxed">
                {UI_TEXT[lang].home_intro}
              </h3>
            </div>
            <Locations lang={lang} />
          </>
        );
      case Page.SHOP:
        return (
          <div className="pt-24 min-h-screen bg-white">
            <ProductList addToCart={handleInitiateAddToCart} lang={lang} />
          </div>
        );
      case Page.LOCATIONS:
        return (
            <div className="pt-24 min-h-screen bg-white">
                <Locations lang={lang} />
            </div>
        );
      case Page.ABOUT:
        return (
          <div className="pt-32 pb-20 px-6 min-h-screen bg-[#f9f8f4]">
             <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-serif text-goffee-charcoal mb-8">{lang === 'en' ? 'Our Philosophy' : '我们的理念'}</h1>
                <p className="text-lg leading-loose text-gray-600 mb-8 font-light">
                  {lang === 'en' 
                    ? "It started with a simple vow: I will only sell coffee less than 48 hours out of the roaster to my guests, so they may enjoy coffee at peak flavor. We only use the finest, most delicious, and responsibly sourced beans."
                    : "这一切始于一个简单的誓言：我只会向客人出售烘焙出炉不超过48小时的咖啡，以便他们能在风味巅峰期享用。我们只使用最好、最美味且负责任采购的咖啡豆。"
                  }
                </p>
                <div className="w-full h-96 overflow-hidden rounded-sm mt-12 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=2000&auto=format&fit=crop" className="w-full h-full object-cover" alt="Philosophy" />
                </div>
             </div>
          </div>
        );
      default:
        return <Hero setPage={setCurrentPage} lang={lang} />;
    }
  };

  const cartTotalCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white text-gray-900">
      <Navbar 
        currentPage={currentPage} 
        setPage={setCurrentPage} 
        cartCount={cartTotalCount} 
        lang={lang}
        setLang={setLang}
        onOpenCart={() => setIsCartOpen(true)}
      />
      
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cart} 
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onClearCart={clearCart}
        lang={lang}
        setPage={setCurrentPage}
        orderName={orderName}
        setOrderName={setOrderName}
      />

      <ProductCustomizationModal 
        isOpen={!!customizationProduct}
        onClose={() => setCustomizationProduct(null)}
        product={customizationProduct}
        onConfirm={finalizeAddToCart}
        lang={lang}
      />

      <BeanCustomizationModal 
        isOpen={!!beanCustomizationProduct}
        onClose={() => setBeanCustomizationProduct(null)}
        product={beanCustomizationProduct}
        onConfirm={finalizeAddToCart}
        lang={lang}
      />

      <Toast 
        message={toastMessage} 
        onClose={() => setToastMessage(null)} 
      />

      <main className="flex-grow">
        {renderContent()}
      </main>

      <AiConcierge lang={lang} />

      <Footer lang={lang} />
    </div>
  );
}

export default App;