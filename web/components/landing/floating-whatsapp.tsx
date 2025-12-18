'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, X, Send, ArrowRight } from 'lucide-react';

const quickMessages = [
  {
    label: 'Soy veterinario',
    message: 'Hola! Soy veterinario y me interesa VetePy para mi clinica'
  },
  {
    label: 'Soy dueno de mascota',
    message: 'Hola! Soy dueno de mascota y quiero saber mas sobre VetePy'
  },
  {
    label: 'Quiero una demo',
    message: 'Hola! Me gustaria ver una demo de VetePy'
  },
  {
    label: 'Tengo una pregunta',
    message: 'Hola! Tengo una pregunta sobre VetePy'
  }
];

export function FloatingWhatsApp() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Show button after scrolling a bit
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsVisible(scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-show tooltip after 10 seconds if user hasn't interacted
  useEffect(() => {
    if (!hasInteracted && isVisible) {
      const timer = setTimeout(() => {
        // Could show a pulse animation or tooltip here
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [hasInteracted, isVisible]);

  const handleQuickMessage = (message: string) => {
    const whatsappUrl = `https://wa.me/595981324569?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setIsOpen(false);
    setHasInteracted(true);
  };

  const handleOpenChat = () => {
    setIsOpen(!isOpen);
    setHasInteracted(true);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay when open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Chat popup */}
      <div
        className={`fixed bottom-24 right-4 md:right-6 z-50 transition-all duration-300 ${
          isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="w-[320px] rounded-2xl bg-[#0F172A] border border-white/10 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-[#25D366] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold">VetePy</p>
                  <p className="text-white/80 text-xs">Normalmente responde en minutos</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-4">
            {/* Welcome message */}
            <div className="mb-4">
              <div className="bg-white/5 rounded-2xl rounded-tl-none p-3 max-w-[80%]">
                <p className="text-white text-sm">
                  ¡Hola! 👋 ¿En que podemos ayudarte?
                </p>
              </div>
            </div>

            {/* Quick messages */}
            <p className="text-white/50 text-xs mb-3">Selecciona una opcion:</p>
            <div className="space-y-2">
              {quickMessages.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickMessage(item.message)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left transition-all group"
                >
                  <span className="text-white text-sm">{item.label}</span>
                  <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-[#25D366] group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>

            {/* Custom message link */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <a
                href="https://wa.me/595981324569"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold rounded-xl transition-all"
              >
                <Send className="w-4 h-4" />
                Escribir mensaje personalizado
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Floating button */}
      <button
        onClick={handleOpenChat}
        className={`fixed bottom-4 right-4 md:right-6 z-50 group transition-all duration-300 ${
          isOpen ? 'rotate-0' : ''
        }`}
      >
        <div className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
          isOpen
            ? 'bg-white/10 border border-white/20'
            : 'bg-[#25D366] hover:bg-[#20BD5A] hover:scale-110'
        }`}>
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <>
              <MessageCircle className="w-6 h-6 text-white" />
              {/* Pulse animation */}
              <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
            </>
          )}
        </div>

        {/* Tooltip */}
        {!isOpen && !hasInteracted && (
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-white rounded-lg shadow-lg whitespace-nowrap animate-bounce">
            <p className="text-[#0F172A] text-sm font-medium">¿Necesitas ayuda?</p>
            <div className="absolute bottom-0 right-4 w-3 h-3 bg-white transform rotate-45 translate-y-1.5" />
          </div>
        )}
      </button>

      {/* Mobile-only: Label next to button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-20 md:hidden z-50 pointer-events-none">
          <span className="px-3 py-1.5 bg-[#0F172A]/90 border border-white/10 rounded-full text-white text-xs font-medium">
            WhatsApp
          </span>
        </div>
      )}
    </>
  );
}
