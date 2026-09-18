import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  UploadCloud,
  Layers,
  Sparkles,
  CheckCircle2,
  FileSpreadsheet,
  ShieldCheck,
  AlertOctagon,
  ArrowDown,
  AlertCircle,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 26,214,400 bytes (25 MB)

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/tiff'
];

export const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.tiff', '.tif'];

/**
 * Validates a file against size boundaries and MIME type whitelist.
 * Conforms strictly to Tier 2.1 boundary contracts.
 */
export const validateUploadFile = (file) => {
  const size = Number(file?.size);
  if (!file || isNaN(size) || size <= 0) {
    return {
      valid: false,
      error: `File "${file?.name || 'document'}" is empty or invalid (0 bytes)`
    };
  }

  if (size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size ${size} exceeds maximum limit of 25MB`
    };
  }

  const name = file.name || '';
  const ext = name.includes('.') ? `.${name.split('.').pop().toLowerCase()}` : '';
  const mime = (file.type || '').toLowerCase();

  const isMimeAllowed = ALLOWED_MIME_TYPES.includes(mime);
  const isExtAllowed = ALLOWED_EXTENSIONS.includes(ext);

  // Strict validation:
  // - If extension is present, it MUST be whitelisted (rejects payload.exe with spoofed application/pdf MIME)
  // - If MIME is present, it MUST be whitelisted
  // - At least one of extension or MIME must be present
  if ((ext && !isExtAllowed) || (mime && !isMimeAllowed) || (!ext && !mime)) {
    return {
      valid: false,
      error: `File type "${ext || file.type || 'unknown'}" is not supported`
    };
  }

  return { valid: true, error: null };
};

/**
 * Regex filename heuristics for automatic document slot classification.
 * Matches keywords for Hospital Bill, Insurance Policy, and Rejection Letter.
 */
export const autoTagDocument = (filename) => {
  if (!filename || typeof filename !== 'string') return null;
  // Replace underscores, hyphens, and periods with whitespace for accurate token matching
  const normalized = filename.toLowerCase().replace(/[._-]+/g, ' ');

  // 1. Rejection / Settlement Letter patterns
  if (/(rej|rejection|denial|deduct|settle|settlement|query|tpa|disallow|disallowance|voucher|computation)/i.test(normalized)) {
    return 'REJECTION_LETTER';
  }

  // 2. Insurance Policy patterns (use \bcare\b to prevent daycare procedure bills matching care insurance)
  if (/(policy|schedule|coverage|ins|insurance|star|\bcare\b|hdfc|icici|niacl|uiic|max_bupa|niva|bajaj|reliance|optima|mediclaim)/i.test(normalized)) {
    return 'INSURANCE_POLICY';
  }

  // 3. Hospital Bill patterns
  if (/(bill|inv|invoice|discharge|hosp|hospital|apollo|fortis|max|medanta|summary|ipd|opd|charges|receipt|itemized)/i.test(normalized)) {
    return 'HOSPITAL_BILL';
  }

  return null;
};

export default function BatchDropzone({
  mode = 'batch',
  onModeChange,
  onBatchFiles,
  onSlotFile,
  documents = {},
  isUploading = false
}) {
  const [dragOverSlot, setDragOverSlot] = useState(null);

  // Mode A: Multi-drop batch handler
  const onBatchDrop = useCallback((acceptedFiles, fileRejections) => {
    // Report rejected files from react-dropzone filters
    if (fileRejections && fileRejections.length > 0) {
      fileRejections.forEach((rej) => {
        const firstErr = rej.errors?.[0]?.message || 'File violates format or 25MB size restriction.';
        toast.error('File Rejected', {
          description: `${rej.file?.name || 'File'}: ${firstErr}`,
        });
      });
    }

    if (!acceptedFiles || acceptedFiles.length === 0) return;

    // Validate each accepted file against domain rules
    const validFiles = [];
    acceptedFiles.forEach((file) => {
      const validation = validateUploadFile(file);
      if (!validation.valid) {
        toast.error('Invalid Document', {
          description: validation.error,
        });
      } else {
        validFiles.push(file);
      }
    });

    if (validFiles.length > 0 && onBatchFiles) {
      onBatchFiles(validFiles.slice(0, 3));
    }
  }, [onBatchFiles]);

  const {
    getRootProps: getBatchRootProps,
    getInputProps: getBatchInputProps,
    isDragActive: isBatchDragActive,
    isDragReject: isBatchDragReject
  } = useDropzone({
    onDrop: onBatchDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/tiff': ['.tiff', '.tif']
    },
    maxSize: MAX_FILE_SIZE,
    maxFiles: 3,
    disabled: isUploading
  });

  // Mode B: Slotted Drop Handler
  const handleSlotDrop = (e, docType) => {
    e.preventDefault();
    setDragOverSlot(null);
    if (isUploading) return;

    const files = Array.from(e.dataTransfer?.files || []);
    if (files.length === 0) return;
    const file = files[0];

    const validation = validateUploadFile(file);
    if (!validation.valid) {
      toast.error('Invalid Document', {
        description: validation.error,
      });
      return;
    }

    if (onSlotFile) {
      onSlotFile(file, docType);
    }
  };

  const handleBrowseSlot = (e, docType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateUploadFile(file);
    if (!validation.valid) {
      toast.error('Invalid Document', {
        description: validation.error,
      });
      return;
    }

    if (onSlotFile) {
      onSlotFile(file, docType);
    }
    // Clear input so same file can be selected again if desired
    e.target.value = '';
  };

  const slotConfigs = [
    {
      id: 'HOSPITAL_BILL',
      title: '1. Hospital Bill & Discharge',
      subtitle: 'Itemized final bill, room rent, pharmacy & consumables breakdown',
      icon: FileSpreadsheet,
      accentColor: 'teal',
      accentBorder: 'hover:border-teal-500 border-teal-200/80 bg-teal-50/20',
      activeBorder: 'border-teal-600 bg-teal-50/60 ring-4 ring-teal-500/20',
      badgeClass: 'bg-teal-100 text-teal-800 border-teal-200',
    },
    {
      id: 'INSURANCE_POLICY',
      title: '2. Insurance Policy Terms',
      subtitle: 'Policy schedule, sum insured, copay clause & room rent sub-limits',
      icon: ShieldCheck,
      accentColor: 'sky',
      accentBorder: 'hover:border-sky-500 border-sky-200/80 bg-sky-50/20',
      activeBorder: 'border-sky-600 bg-sky-50/60 ring-4 ring-sky-500/20',
      badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
    },
    {
      id: 'REJECTION_LETTER',
      title: '3. Rejection / Settlement Letter',
      subtitle: 'TPA deduction sheet, disallowance rationale & denial voucher',
      icon: AlertOctagon,
      accentColor: 'amber',
      accentBorder: 'hover:border-amber-500 border-amber-200/80 bg-amber-50/20',
      activeBorder: 'border-amber-600 bg-amber-50/60 ring-4 ring-amber-500/20',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    }
  ];

  return (
    <div className="space-y-4">
      {/* Mode Switcher Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Intake Engine:
          </span>
          <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200 shadow-inner-subtle">
            <button
              type="button"
              onClick={() => onModeChange && onModeChange('batch')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                mode === 'batch'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              Batch Multi-Drop (1-3 Files)
            </button>
            <button
              type="button"
              onClick={() => onModeChange && onModeChange('guided')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                mode === 'guided'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-teal-400" />
              Guided 3-Step Targets
            </button>
          </div>
        </div>

        <div className="text-[11px] font-medium text-slate-400">
          Max 25MB / file • PDF, PNG, JPG, TIFF
        </div>
      </div>

      {/* Mode A: Batch Multi-Drop Zone */}
      {mode === 'batch' && (
        <div
          {...getBatchRootProps()}
          className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 select-none ${
            isBatchDragReject
              ? 'ring-4 ring-rose-500/25 border-rose-500 bg-rose-50/70 shadow-lg scale-[1.008]'
              : isBatchDragActive
              ? 'ring-4 ring-brand-500/25 border-brand-500 bg-brand-50/70 shadow-lg scale-[1.008]'
              : 'border-slate-300 hover:border-brand-400 bg-slate-50/50 hover:bg-slate-50 shadow-inner-subtle'
          } ${isUploading ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <input {...getBatchInputProps()} />

          <div className="flex flex-col items-center justify-center space-y-3.5">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                isBatchDragReject
                  ? 'bg-rose-100 text-rose-600 scale-110'
                  : isBatchDragActive
                  ? 'bg-brand-100 text-brand-600 scale-110 animate-bounce'
                  : 'bg-white text-brand-600 shadow-xs border border-slate-200 group-hover:scale-105'
              }`}
            >
              {isBatchDragReject ? (
                <AlertCircle className="w-7 h-7" />
              ) : isBatchDragActive ? (
                <ArrowDown className="w-7 h-7" />
              ) : (
                <UploadCloud className="w-7 h-7" />
              )}
            </div>

            <div>
              <p className="text-base font-bold text-slate-800">
                {isBatchDragReject
                  ? 'Unsupported file format or size!'
                  : isBatchDragActive
                  ? 'Release to ingest files for automated classification...'
                  : 'Drag & drop up to 3 claim documents simultaneously'}
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-lg mx-auto">
                Drop your <strong className="text-slate-700">Hospital Bill</strong>, <strong className="text-slate-700">Insurance Policy</strong>, and <strong className="text-slate-700">Rejection Letter</strong> in any order.
                Or <span className="text-brand-600 font-semibold underline underline-offset-2">browse files</span> from your workstation.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <span className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-200 rounded-full text-slate-600 shadow-2xs">
                📄 Bill Auto-Detection
              </span>
              <span className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-200 rounded-full text-slate-600 shadow-2xs">
                🛡️ Policy Recognition
              </span>
              <span className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-200 rounded-full text-slate-600 shadow-2xs">
                ⚠️ Disallowance Parser
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Mode B: Guided 3-Step Slotted Targets */}
      {mode === 'guided' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {slotConfigs.map((slot) => {
            const hasDoc = !!documents[slot.id];
            const isTargetActive = dragOverSlot === slot.id;
            const Icon = slot.icon;

            return (
              <div
                key={slot.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverSlot(slot.id);
                }}
                onDragLeave={() => setDragOverSlot(null)}
                onDrop={(e) => handleSlotDrop(e, slot.id)}
                className={`relative rounded-xl border-2 border-dashed p-4 transition-all duration-150 flex flex-col justify-between min-h-[175px] ${
                  isTargetActive
                    ? slot.activeBorder
                    : hasDoc
                    ? 'border-emerald-300 bg-emerald-50/25'
                    : slot.accentBorder
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-2 rounded-lg ${
                          hasDoc
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-white text-slate-700 border border-slate-200 shadow-2xs'
                        }`}
                      >
                        {hasDoc ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Icon className="w-4 h-4" />}
                      </div>
                      <span className="text-xs font-bold text-slate-900">{slot.title}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                    {slot.subtitle}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                  <label className="text-xs font-semibold text-brand-600 hover:text-brand-700 cursor-pointer flex items-center gap-1">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>{hasDoc ? 'Replace File' : 'Browse File'}</span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.tiff,.tif"
                      onChange={(e) => handleBrowseSlot(e, slot.id)}
                    />
                  </label>

                  {hasDoc ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-200">
                      Attached
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-slate-400">
                      Drop target
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
