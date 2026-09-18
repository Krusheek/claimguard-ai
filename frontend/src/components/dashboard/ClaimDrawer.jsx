import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  X,
  ExternalLink,
  FileText,
  ShieldCheck,
  FileSearch,
  Clock,
  Calendar,
  Hash,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { formatINR, formatClaimDate } from './ClaimsTable';

// ── Framer Motion variants ──────────────────────────────────────────
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const drawerVariants = {
  hidden: { x: '100%', opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
};

// ── Document type display map ───────────────────────────────────────
const DOC_DISPLAY = {
  HOSPITAL_BILL: { label: 'Hospital Bill', icon: FileText, color: 'text-medical-600 bg-medical-50 border-medical-200' },
  INSURANCE_POLICY: { label: 'Insurance Policy', icon: ShieldCheck, color: 'text-brand-600 bg-brand-50 border-brand-200' },
  REJECTION_LETTER: { label: 'Rejection Letter', icon: FileSearch, color: 'text-rose-600 bg-rose-50 border-rose-200' },
};

// ── Detail Row helper ───────────────────────────────────────────────
function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-slate-500" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-800 mt-0.5 truncate">{value || '—'}</p>
      </div>
    </div>
  );
}

// ── Stage Progress Bar ──────────────────────────────────────────────
const STAGES = ['UPLOADED', 'EXTRACTING', 'ANALYZING', 'COMPLETE'];
function StageProgress({ currentStage }) {
  const idx = STAGES.indexOf(currentStage?.toUpperCase() ?? '');
  return (
    <div className="mt-1">
      <div className="flex gap-1 mb-2">
        {STAGES.map((stage, i) => (
          <div
            key={stage}
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              i <= idx ? 'bg-brand-600' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
      <div className="flex justify-between text-[9px] font-semibold uppercase tracking-wider text-slate-400">
        {STAGES.map((s) => (
          <span key={s} className={s === currentStage?.toUpperCase() ? 'text-brand-600' : ''}>
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Main ClaimDrawer ────────────────────────────────────────────────
export default function ClaimDrawer({ claim, onClose }) {
  const navigate = useNavigate();
  const isOpen = Boolean(claim);

  const { formatted: createdFormatted, relative: createdRelative } = formatClaimDate(claim?.created_at);
  const { formatted: updatedFormatted } = formatClaimDate(claim?.updated_at);

  const docs = claim?.documents || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px]"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
          />

          {/* Drawer Panel */}
          <motion.aside
            key="drawer"
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[480px] bg-white shadow-elevation flex flex-col overflow-hidden"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-white/90 backdrop-blur-sm flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-200 flex items-center justify-center">
                  <Hash className="w-4 h-4 text-brand-600" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Claim Inspection</p>
                  <p className="text-sm font-bold text-slate-900 font-mono truncate max-w-[220px]">
                    {claim?.id?.slice(0, 18)}…
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {/* Status & Stage */}
              <div className="card-enterprise p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Current Status</span>
                  <StatusBadge status={claim?.status} size="sm" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 block mb-2">Pipeline Stage</span>
                  <StageProgress currentStage={claim?.status} />
                </div>
              </div>

              {/* Core Details */}
              <div className="card-enterprise p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Claim Details</p>
                <DetailRow icon={Hash} label="Claim ID" value={claim?.id} />
                <DetailRow icon={Calendar} label="Submitted" value={`${createdFormatted}${createdRelative ? ` · ${createdRelative}` : ''}`} />
                <DetailRow icon={Clock} label="Last Updated" value={updatedFormatted} />
              </div>

              {/* Financial Summary (if available) */}
              {(claim?.total_monetary_impact != null) && (
                <div className="card-enterprise p-4 bg-gradient-to-br from-brand-50/60 to-white border-brand-200/70">
                  <p className="text-xs font-bold uppercase tracking-wider text-brand-500 mb-3">Financial Impact</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
                      {claim?.status === 'COMPLETE' ? (
                        <CheckCircle2 className="w-5 h-5 text-brand-600" />
                      ) : (
                        <Loader2 className="w-5 h-5 text-brand-400 animate-pulse" />
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Recoverable Amount</p>
                      <p className="text-xl font-black text-brand-700 font-mono">
                        {formatINR(claim?.total_monetary_impact)}
                      </p>
                    </div>
                  </div>
                  {claim?.verdict && (
                    <div className={`mt-3 px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                      claim.verdict === 'CLAIM_SUPPORTED'
                        ? 'bg-status-pass-bg text-status-pass-text border border-status-pass-border'
                        : 'bg-status-fail-bg text-status-fail-text border border-status-fail-border'
                    }`}>
                      {claim.verdict === 'CLAIM_SUPPORTED' ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      )}
                      {claim.verdict.replace(/_/g, ' ')}
                    </div>
                  )}
                </div>
              )}

              {/* Uploaded Documents */}
              <div className="card-enterprise p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Documents ({docs.length})
                </p>
                {docs.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No documents uploaded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {docs.map((doc) => {
                      const meta = DOC_DISPLAY[doc.document_type] || DOC_DISPLAY['HOSPITAL_BILL'];
                      const Icon = meta.icon;
                      return (
                        <div
                          key={doc.id}
                          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-xs font-medium ${meta.color}`}
                        >
                          <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{meta.label}</span>
                          <span className="ml-auto text-[10px] font-normal opacity-70 truncate max-w-[120px]">
                            {doc.original_filename || doc.filename || ''}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer CTA */}
            <div className="flex-shrink-0 px-5 py-4 border-t border-slate-200 bg-slate-50/80 backdrop-blur-sm">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate(`/analysis/${claim?.id}`);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white rounded-xl text-sm font-bold shadow-sm transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                View Full Analysis
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
