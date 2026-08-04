import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const BuyMeCoffeeModal: React.FC<Props> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs">
      <div className="relative max-h-[92vh] max-w-[92vw]">
        <button
          type="button"
          onClick={onClose}
          className="absolute -right-3 -top-3 z-10 rounded-full bg-white p-2 text-slate-700 shadow-lg ring-1 ring-slate-200 transition-colors hover:bg-slate-100"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <img
          src="/assets/orbs-qr.jpg"
          alt="Buy me a coffee QR code"
          className="block max-h-[92vh] max-w-[92vw] rounded-xl object-contain shadow-2xl"
        />
      </div>
    </div>
  );
};
