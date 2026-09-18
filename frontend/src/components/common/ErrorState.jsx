import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Enterprise Contextual Error State
 */
export default function ErrorState({
  title = 'Unable to Load Audit Data',
  message = 'A network or API connectivity error occurred while communicating with the ClaimGuard backend.',
  onRetry = null,
  retryLabel = 'Retry Request',
  secondaryAction = null,
  errorDetails = null,
  className = '',
}) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className={`card-enterprise p-8 text-center max-w-xl mx-auto my-8 border-rose-200 bg-white ${className}`}>
      <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100 shadow-xs">
        <AlertTriangle className="w-7 h-7" />
      </div>

      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 mb-6 leading-relaxed">{message}</p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            {retryLabel}
          </button>
        )}

        {secondaryAction ? (
          <button
            onClick={secondaryAction.onClick}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
          >
            {secondaryAction.label}
          </button>
        ) : (
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
        )}
      </div>

      {errorDetails && (
        <div className="mt-6 pt-4 border-t border-slate-100 text-left">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center justify-between w-full text-xs font-semibold text-slate-500 hover:text-slate-700"
          >
            <span>Technical Diagnostics</span>
            {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showDetails && (
            <pre className="mt-2 p-3 bg-slate-900 text-slate-200 text-xs rounded-lg overflow-x-auto font-mono">
              {typeof errorDetails === 'object' ? JSON.stringify(errorDetails, null, 2) : String(errorDetails)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
