import React, { useRef } from 'react';
import {
  FileSpreadsheet,
  ShieldCheck,
  AlertOctagon,
  CheckCircle2,
  Trash2,
  RefreshCw,
  UploadCloud,
  FileText
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

export const DOC_CONFIGS = {
  HOSPITAL_BILL: {
    title: 'Hospital Final Bill',
    badge: 'bg-teal-50 text-teal-700 border-teal-200',
    icon: FileSpreadsheet,
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    description: 'Itemized hospital invoice & discharge summary'
  },
  INSURANCE_POLICY: {
    title: 'Insurance Policy Schedule',
    badge: 'bg-sky-50 text-sky-700 border-sky-200',
    icon: ShieldCheck,
    color: 'text-sky-600',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    description: 'Policy clauses, sum insured & room rent sub-limits'
  },
  REJECTION_LETTER: {
    title: 'Rejection / Settlement Letter',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: AlertOctagon,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    description: 'TPA deduction breakdown & disallowance grounds'
  }
};

/**
 * Format bytes to readable B / KB / MB / GB string.
 */
export const formatFileSize = (bytes) => {
  if (!bytes && bytes !== 0) return '—';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/**
 * Generate visual format chip according to filename extension or MIME.
 */
export const getFormatChip = (filename = '', mimeType = '') => {
  const ext = (filename.split('.').pop() || '').toUpperCase();
  if (ext === 'PDF' || mimeType?.includes('pdf')) {
    return { label: 'PDF', bg: 'bg-rose-100 text-rose-700 border-rose-200' };
  }
  if (['PNG', 'JPG', 'JPEG'].includes(ext) || mimeType?.includes('image')) {
    return { label: ext === 'JPEG' ? 'JPG' : ext || 'IMG', bg: 'bg-indigo-100 text-indigo-700 border-indigo-200' };
  }
  if (['TIFF', 'TIF'].includes(ext) || mimeType?.includes('tiff')) {
    return { label: 'TIFF', bg: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
  }
  return { label: ext || 'DOC', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
};

export default function DocumentCard({
  documentType = 'HOSPITAL_BILL',
  docRecord = null,
  onReplace,
  onRemove,
  onRetag,
  disabled = false
}) {
  const fileInputRef = useRef(null);
  const config = DOC_CONFIGS[documentType] || DOC_CONFIGS.HOSPITAL_BILL;
  const DocIcon = config.icon;

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onReplace) {
      onReplace(file);
    }
    e.target.value = '';
  };

  // 1. Unattached Empty Slot State
  if (!docRecord) {
    return (
      <div className="card-enterprise p-4 border-dashed border-slate-300 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center border border-slate-200 flex-shrink-0">
            <DocIcon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-800">{config.title}</span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-slate-200">
                Pending Intake
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
              {config.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 px-3.5 py-1.5 rounded-lg border border-brand-200 hover:border-brand-300 bg-white shadow-2xs hover:shadow-xs transition-all disabled:opacity-40"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Attach File</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.tiff,.tif"
            onChange={handleFileInputChange}
          />
        </div>
      </div>
    );
  }

  // 2. Attached Document Card State
  const format = getFormatChip(docRecord.name || docRecord.file?.name, docRecord.type || docRecord.file?.type);
  const fileName = docRecord.name || docRecord.file?.name || 'document';
  const fileSize = docRecord.size ?? docRecord.file?.size;
  const isReady = docRecord.uploadStatus === 'ready' || docRecord.status === 'VERIFIED';
  const isUploading = docRecord.uploadStatus === 'uploading';
  const isError = docRecord.uploadStatus === 'error';

  return (
    <div className="card-enterprise card-enterprise-hover p-4 border-slate-200 bg-white transition-all duration-200 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        {/* Left: Emblem & Details */}
        <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
          <div className={`w-11 h-11 rounded-xl ${config.bg} ${config.border} border flex items-center justify-center flex-shrink-0 shadow-xs`}>
            <DocIcon className={`w-5 h-5 ${config.color}`} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-900">{config.title}</span>
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border ${format.bg}`}>
                {format.label}
              </span>
              {isReady && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Verified
                </span>
              )}
              {isUploading && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-sky-700 bg-sky-50/90 px-2.5 py-0.5 rounded-md border border-sky-200 shadow-xs">
                  <span className="relative flex h-2 w-2 flex-shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-600" />
                  </span>
                  <span>Extracting...</span>
                  <span className="inline-block w-8 h-1 rounded-full skeleton-shimmer ml-0.5" />
                </span>
              )}
              {isError && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                  Upload Error
                </span>
              )}
            </div>

            <div className="mt-1 flex items-center gap-2">
              <p className="text-xs font-semibold text-slate-800 truncate max-w-[220px] md:max-w-md" title={fileName}>
                {fileName}
              </p>
              <span className="text-[11px] text-slate-400 font-financial flex-shrink-0">
                ({formatFileSize(fileSize)})
              </span>
            </div>

            {/* Extracted preview tags if metadata exists */}
            {docRecord.metadata && (
              <div className="mt-1.5 flex items-center gap-2 text-[11px] flex-wrap">
                {docRecord.metadata.line_items_count && (
                  <span className="text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md font-semibold border border-teal-200">
                    {docRecord.metadata.line_items_count} line items
                  </span>
                )}
                {docRecord.metadata.sum_insured && (
                  <span className="text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md font-semibold border border-sky-200 font-financial">
                    Sum Insured: ₹{(docRecord.metadata.sum_insured / 100000).toFixed(0)} Lakhs
                  </span>
                )}
                {docRecord.metadata.disallowed_amount && (
                  <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md font-semibold border border-rose-200 font-financial">
                    Disallowed: ₹{docRecord.metadata.disallowed_amount.toLocaleString('en-IN')}
                  </span>
                )}
                {docRecord.metadata.hospital_name && (
                  <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 truncate max-w-[200px]" title={docRecord.metadata.hospital_name}>
                    {docRecord.metadata.hospital_name}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions Controls */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          {/* Retag Dropdown Selector */}
          {onRetag && (
            <select
              value={documentType}
              onChange={(e) => onRetag(e.target.value)}
              disabled={disabled}
              className="text-[11px] font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-brand-500 focus:outline-none cursor-pointer transition-colors"
              title="Reassign document slot category"
            >
              <option value="HOSPITAL_BILL">Hospital Bill</option>
              <option value="INSURANCE_POLICY">Insurance Policy</option>
              <option value="REJECTION_LETTER">Rejection Letter</option>
            </select>
          )}

          {/* Replace Button */}
          {onReplace && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              title="Replace this document"
              className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 disabled:opacity-40"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.tiff,.tif"
            onChange={handleFileInputChange}
          />

          {/* Remove Button */}
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              disabled={disabled}
              title="Remove this document"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200 disabled:opacity-40"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Active OCR scanning laser bar */}
      {isUploading && (
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-slate-100 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-sky-400 via-teal-400 to-sky-400 animate-[shimmer_1.5s_infinite] w-full" />
        </div>
      )}
    </div>
  );
}
