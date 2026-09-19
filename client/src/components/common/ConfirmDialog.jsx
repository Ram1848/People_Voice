import React from 'react';
import Modal from './Modal';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

export const ConfirmDialog = ({
  isOpen,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}) => {
  const iconConfig = {
    danger: {
      icon: AlertTriangle,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      btn: 'bg-rose-600 hover:bg-rose-700 text-white',
    },
    warning: {
      icon: AlertCircle,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      btn: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
    primary: {
      icon: Info,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      btn: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    },
  }[variant] || {
    icon: Info,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    btn: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  };

  const Icon = iconConfig.icon;

  return (
    <Modal isOpen={isOpen} onClose={onCancel} size="sm" closeOnBackdrop={!loading}>
      <div className="flex items-start gap-4">
        <div className={`p-2.5 rounded-xl ${iconConfig.bg} ${iconConfig.color} shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900">{title}</h4>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{message}</p>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-end gap-2.5">
        <button
          type="button"
          disabled={loading}
          onClick={onCancel}
          className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
        >
          {cancelText}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={onConfirm}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50 ${iconConfig.btn}`}
        >
          {loading ? 'Processing...' : confirmText}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
