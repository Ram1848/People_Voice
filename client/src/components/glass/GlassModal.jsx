import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Apple-inspired Liquid Glass Modal Dialog
 */
export const GlassModal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-lg',
  showClose = true,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Translucent frosted backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-md transition-opacity"
      />

      {/* Glass dialog container */}
      <div
        className={`
          relative w-full ${maxWidth} z-10
          bg-white/85 backdrop-blur-3xl
          border border-white/90
          rounded-4xl p-6 sm:p-8
          shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15),inset_0_1px_0_0_rgba(255,255,255,1)]
          animate-in zoom-in-95 duration-200
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            {title && <h3 className="text-xl font-bold tracking-tight text-slate-900">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
          </div>
          {showClose && (
            <button
              onClick={onClose}
              className="p-2 -mr-2 -mt-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal body */}
        <div className="space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default GlassModal;
