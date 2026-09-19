import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState = ({
  message = 'Loading data...',
  description = null,
  minHeight = 'min-h-[260px]',
  showSpinner = true,
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${minHeight}`}>
      {showSpinner && (
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-3">
          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
        </div>
      )}
      <p className="text-sm font-semibold text-slate-800">{message}</p>
      {description && <p className="text-xs text-slate-400 mt-1 max-w-sm">{description}</p>}
    </div>
  );
};

export default LoadingState;
