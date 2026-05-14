import React, { useEffect } from 'react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[80] animate-fade-in-down">
      <div className="bg-felix-dark text-white px-6 py-3 rounded shadow-xl flex items-center gap-3 border-l-4 border-felix-gold">
         <span className="font-serif tracking-wide">{message}</span>
      </div>
    </div>
  );
};