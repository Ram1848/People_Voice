import React from 'react';
import { AlertTriangle, ShieldAlert, Edit3 } from 'lucide-react';
import ConfidenceIndicator from './ConfidenceIndicator';
import GlassCard from '../glass/GlassCard';
import GlassButton from '../glass/GlassButton';

export const ConfirmationCard = ({
  commandId,
  command,
  currentStock,
  suggestedQuantity,
  isInsufficientStock,
  warning,
  confirmationReason,
  confidence = 0.95,
  onConfirm,
  onCancel,
  onEdit,
  loading = false,
}) => {
  if (!command) return null;

  const isRemove = command.action === 'REMOVE';
  const hasAlternative = isInsufficientStock && suggestedQuantity !== undefined && suggestedQuantity !== null && suggestedQuantity > 0;
  const finalConfirmedQty = hasAlternative ? suggestedQuantity : (command.quantity || suggestedQuantity);

  return (
    <div className="relative rounded-3xl p-6 my-4 text-left bg-white/80 backdrop-blur-2xl border border-amber-200/80 shadow-[0_10px_35px_-5px_rgba(245,158,11,0.12),inset_0_1px_0_0_rgba(255,255,255,1)] animate-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-start justify-between pb-3.5 border-b border-amber-100 mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
            isInsufficientStock ? 'bg-rose-50 text-rose-600 border border-rose-200/60' : 'bg-amber-50 text-amber-600 border border-amber-200/60'
          }`}>
            {isInsufficientStock ? <ShieldAlert className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              {isInsufficientStock ? 'Insufficient Stock Notice' : 'Please Confirm Voice Command'}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {confirmationReason || 'Please verify the details before modifying the database'}
            </p>
          </div>
        </div>

        <ConfidenceIndicator confidence={confidence} />
      </div>

      {/* Understood Details Glass Area */}
      <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-white/80 mb-4 shadow-sm">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
          Understood Action & Stock Level:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-white/80 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Action</span>
            <span className={`font-black text-sm ${isRemove ? 'text-rose-600' : 'text-emerald-600'}`}>
              {command.action}
            </span>
          </div>

          <div className="bg-white/80 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Product</span>
            <span className="font-bold text-sm text-slate-900 capitalize">
              {command.product}
            </span>
          </div>

          <div className="bg-white/80 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Requested</span>
            <span className="font-bold text-sm text-slate-900">
              {command.quantity} {command.unit}
            </span>
          </div>

          <div className="bg-white/80 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Current Stock</span>
            <span className="font-extrabold text-sm text-slate-700">
              {currentStock} {command.unit}
            </span>
          </div>
        </div>

        {/* Warning / Alternative Suggestion Banner */}
        {isInsufficientStock && (
          <div className="mt-3.5 bg-amber-50/80 backdrop-blur-sm border border-amber-200/80 text-amber-900 p-3.5 rounded-xl text-xs font-semibold flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p>{warning || `You only have ${currentStock} ${command.unit} available.`}</p>
              {hasAlternative && (
                <p className="mt-1 font-bold text-amber-800">
                  Would you like to remove {suggestedQuantity} {command.unit} instead?
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
        <GlassButton
          variant="ghost"
          size="sm"
          disabled={loading}
          onClick={onCancel}
        >
          Cancel
        </GlassButton>

        {onEdit && (
          <GlassButton
            variant="secondary"
            size="sm"
            disabled={loading}
            onClick={onEdit}
            icon={Edit3}
          >
            Edit
          </GlassButton>
        )}

        <GlassButton
          variant={isRemove ? 'danger' : 'primary'}
          size="sm"
          disabled={loading || (isInsufficientStock && !hasAlternative)}
          onClick={() => onConfirm(commandId, finalConfirmedQty)}
        >
          {loading ? (
            'Executing...'
          ) : hasAlternative ? (
            `Yes, Remove ${suggestedQuantity} ${command.unit}`
          ) : (
            'Confirm & Execute'
          )}
        </GlassButton>
      </div>
    </div>
  );
};

export default ConfirmationCard;
