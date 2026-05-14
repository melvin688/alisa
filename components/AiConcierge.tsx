import React, { useState } from 'react';
import { Sparkles, Send, Coffee } from 'lucide-react';
import { Language } from '../types';
import { UI_TEXT } from '../constants';

interface AiConciergeProps {
    lang: Language;
}

export const AiConcierge: React.FC<AiConciergeProps> = ({ lang }) => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const t = UI_TEXT[lang].concierge;

  const handleConsultation = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: input.trim(), lang }),
      });

      const data = await res.json();

      if (res.ok && data.recommendation) {
        setResponse(data.recommendation);
      } else {
        setResponse(data.error || (lang === 'zh' 
          ? '抱歉，AI服务暂时不可用。' 
          : 'My apologies, the steam pressure is low (Error connecting to AI).'));
      }
    } catch (error) {
      console.error(error);
      setResponse(lang === 'zh' 
        ? '网络连接错误，请稍后重试。' 
        : 'My apologies, the steam pressure is low (Error connecting to AI).');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-felix-teal text-felix-gold p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center gap-2 border-2 border-felix-gold"
      >
        <Sparkles size={24} />
        <span className="font-serif hidden md:inline">{t.btn}</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 w-96 max-w-[90vw] bg-white border-2 border-felix-teal shadow-2xl rounded-lg overflow-hidden flex flex-col">
      <div className="bg-felix-teal p-4 flex justify-between items-center text-felix-gold">
        <div className="flex items-center gap-2">
            <Coffee size={20} />
            <h3 className="font-serif text-lg tracking-wide">{t.title}</h3>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-white hover:text-felix-gold">✕</button>
      </div>

      <div className="p-6 bg-felix-pink/20 min-h-[200px] max-h-[400px] overflow-y-auto">
        {!response && !loading && (
            <p className="text-felix-teal/80 italic font-serif text-center mt-4">
                "{t.placeholder}"
            </p>
        )}
        
        {loading && (
            <div className="flex justify-center items-center h-full space-x-2 text-felix-teal">
                <div className="animate-bounce delay-75">●</div>
                <div className="animate-bounce delay-150">●</div>
                <div className="animate-bounce delay-300">●</div>
            </div>
        )}

        {response && (
            <div className="bg-white p-4 rounded-br-2xl rounded-bl-2xl rounded-tr-2xl shadow-sm border border-felix-pink">
                <p className="text-felix-teal font-serif leading-relaxed">{response}</p>
            </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleConsultation()}
          placeholder={t.inputPlaceholder}
          className="flex-1 bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-felix-teal"
        />
        <button 
          onClick={handleConsultation}
          disabled={loading}
          className="bg-felix-teal text-white p-2 rounded hover:bg-felix-teal-light transition-colors disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};