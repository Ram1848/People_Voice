import React from 'react';
import { 
  AlertTriangle, 
  HelpCircle, 
  ShieldAlert, 
  X, 
  Edit2 
} from 'lucide-react';
import Badge from '../common/Badge';

export const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  onEdit, 
  understood,
  confirmationReason 
}) => {
  if (!isOpen || !understood) return null;

  const isRemove = understood.action === 'REMOVE';
  const hasWarning = !!understood.warning;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100 animate-scale-up">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              hasWarning 
                ? 'bg-amber-100 text-amber-700' 
                : 'bg-emerald-100 text-emerald-700'
            }`}>
              {hasWarning ? <AlertTriangle className="w-5 h-5" /> : <HelpCircle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                {hasWarning ? 'Confirmation & Warning' : 'Please Confirm Command'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {confirmationReason || 'Please verify the details before updating inventory'}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Understood Card */}
        <div className="my-5 bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 uppercase font-bold tracking-wider text-[10px]">Command Intent</span>
            <Badge variant={understood.confidenceLevel || 'HIGH'} size="sm">
              {understood.confidenceLevel || 'NORMAL'} CONFIDENCE ({Math.round((understood.confidence || 0.95) * 100)}%)
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-white p-3 rounded-xl border border-slate-200/70">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Action</span>
              <span className={`text-base font-extrabold ${
                isRemove ? 'text-rose-600' : 'text-emerald-600'
              }`}>
                {understood.action}
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200/70">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Product</span>
              <span className="text-base font-extrabold text-slate-900 capitalize">
                {understood.product}
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200/70">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Quantity</span>
              <span className="text-base font-extrabold text-slate-900">
                {understood.quantity} {understood.unit}
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200/70">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Stock</span>
              <span className="text-base font-extrabold text-slate-700">
                {understood.currentStock} {understood.unit}
              </span>
            </div>
          </div>

          {/* Warning Banner */}
          {hasWarning && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-xl text-xs font-semibold flex items-start space-x-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{understood.warning}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            Cancel
          </button>

          {onEdit && (
            <button
              onClick={onEdit}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors inline-flex items-center space-x-1"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          )}

          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md active:scale-95 transition-all ${
              isRemove 
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30' 
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
            }`}
          >
            Confirm & Execute
          </button>
        </div>

      </div>
    </div>
  );
};

export default ConfirmationModal;
