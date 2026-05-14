import React, { useState } from 'react';
import { Language } from '../types';
import { UI_TEXT } from '../constants';

interface FooterProps {
    lang: Language;
}

export const Footer: React.FC<FooterProps> = ({ lang }) => {
  const t = UI_TEXT[lang].footer;
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [subscribeMsg, setSubscribeMsg] = useState('');

  const handleSubscribe = async () => {
    if (!email.trim()) return;

    setSubscribeStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubscribeStatus('success');
        setSubscribeMsg(lang === 'zh' ? '订阅成功！' : 'Subscribed!');
        setEmail('');
      } else {
        setSubscribeStatus('error');
        setSubscribeMsg(data.error || (lang === 'zh' ? '订阅失败' : 'Failed'));
      }
    } catch {
      setSubscribeStatus('error');
      setSubscribeMsg(lang === 'zh' ? '网络错误' : 'Network error');
    }
  };

  return (
    <footer className="bg-felix-dark text-felix-cream pt-20 pb-10 border-t-8 border-felix-gold">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
        <div>
          <h4 className="font-serif text-2xl text-felix-gold mb-6">goffee coffee</h4>
          <p className="font-light text-sm opacity-70 leading-relaxed max-w-xs mx-auto md:mx-0">
            {t.desc}
          </p>
        </div>

        <div>
          <h4 className="font-sans text-xs font-bold uppercase tracking-[0.2em] mb-6 text-felix-pink">{t.navTitle}</h4>
          <ul className="space-y-4 font-serif text-lg">
            <li className="hover:text-felix-gold cursor-pointer transition-colors">{t.shopAll}</li>
            <li className="hover:text-felix-gold cursor-pointer transition-colors">{t.subs}</li>
            <li className="hover:text-felix-gold cursor-pointer transition-colors">{t.wholesale}</li>
            <li className="hover:text-felix-gold cursor-pointer transition-colors">{t.careers}</li>
          </ul>
        </div>

        <div>
           <h4 className="font-sans text-xs font-bold uppercase tracking-[0.2em] mb-6 text-felix-pink">{t.newsletterTitle}</h4>
           <p className="font-light text-sm mb-4">{t.newsletterDesc}</p>
           <div className="flex border-b border-felix-gold pb-2">
             <input 
               type="email" 
               value={email}
               onChange={(e) => { setEmail(e.target.value); setSubscribeStatus('idle'); }}
               onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
               placeholder={t.emailPlaceholder} 
               className="bg-transparent border-none outline-none w-full text-white placeholder-gray-500" 
             />
             <button 
               onClick={handleSubscribe}
               disabled={subscribeStatus === 'loading'}
               className="text-felix-gold uppercase text-xs font-bold tracking-widest disabled:opacity-50 whitespace-nowrap"
             >
               {subscribeStatus === 'loading' ? '...' : t.join}
             </button>
           </div>
           {subscribeStatus === 'success' && (
             <p className="text-green-400 text-xs mt-2">{subscribeMsg}</p>
           )}
           {subscribeStatus === 'error' && (
             <p className="text-red-400 text-xs mt-2">{subscribeMsg}</p>
           )}
        </div>
      </div>
      <div className="mt-20 text-center text-xs opacity-30 uppercase tracking-widest">
        {t.copyright}
      </div>
    </footer>
  );
};