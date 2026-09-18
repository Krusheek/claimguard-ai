# Milestone 3 Architectural Specification & Blueprint: Upload Studio & UX Polish

## 1. Observation

### 1.1 Direct Codebase Observations in `src/pages/Upload.jsx`
Direct examination of `src/pages/Upload.jsx` (lines 1–173) reveals several critical structural limitations:

1. **Primitive State Representation (Lines 10–17)**:
   ```javascript
   const [claimId, setClaimId] = useState(null)
   const [activeStep, setActiveStep] = useState(0)
   const [isUploading, setIsUploading] = useState(false)
   const [documents, setDocuments] = useState({
     HOSPITAL_BILL: null,
     INSURANCE_POLICY: null,
     REJECTION_LETTER: null,
   })
   ```
   *The document state stores only the raw DOM `File` object or `null`. Crucial metadata (such as server document ID, upload progress percentage, extraction status, format MIME type, and human-readable file size) is completely omitted.*

2. **Rigid Linear Stepper Forcing Sequential Intake (Lines 19–43, 70–94)**:
   ```javascript
   const steps = [
     { id: 'HOSPITAL_BILL', title: 'Hospital Bill', description: 'Itemized final bill from the hospital' },
     { id: 'INSURANCE_POLICY', title: 'Insurance Policy', description: 'Patient\'s health insurance policy document' },
     { id: 'REJECTION_LETTER', title: 'Rejection/Settlement Letter', description: 'Letter from TPA detailing deductions' },
   ]
   ```
   *The UI is locked into `activeStep`. An auditor possessing all 3 documents simultaneously cannot drag-and-drop them in one batch. If the auditor has the Rejection Letter first, they cannot upload it out-of-order without manually cycling through steps.*

3. **Single-File Drop Target & No Heuristic Classification (Lines 105–109)**:
   ```javascript
   <FileUploader 
     onUpload={(file) => handleFileUpload(file, steps[activeStep].id)} 
     isUploading={isUploading}
     accept={{ 'application/pdf': ['.pdf'], 'image/jpeg': ['.jpeg', '.jpg'], 'image/png': ['.png'] }}
   />
   ```
   *In `FileUploader.jsx` (lines 12–17), `maxFiles: 1` is hardcoded. Dropping multiple files drops only the first file (`acceptedFiles[0]`). There is no auto-tagging heuristic to identify whether a dropped file is a bill, policy, or rejection letter based on filename patterns.*

4. **Absence of Document Management & Metadata Inspection (Lines 128–144)**:
   *Once uploaded, files are rendered in an unformatted bullet list (`documents[step.id]?.name`). There is no button to **Replace** a wrong file, no button to **Remove** a file, no file size display (KB/MB), and no format chip (PDF/PNG/JPG).*

5. **Lack of Pre-Analysis Readiness & Forensic Health Checks (Lines 123–166)**:
   *The page abruptly switches to a static completion view with an uninformative "Start AI Analysis" button. There is no pre-flight health check demonstrating what features ClaimGuard AI will inspect (e.g. line-item itemization, sum insured, moratorium eligibility, ELA tamper scanning).*

6. **Styling Disconnect from Enterprise Design System**:
   *Uses basic generic blue buttons (`bg-blue-600 hover:bg-blue-700`) instead of the clinical slate-900 / medical teal / brand tokens established in `tailwind.config.js` and `src/components/common/`.*

### 1.2 Boundary Conditions & Data Contracts Observed in Specifications & Tests
- **File Upload Limits (`tests/tier2-boundary-cases.test.mjs:22–36`)**:
  - Maximum upload size: `25 * 1024 * 1024` bytes (25 MB).
  - Allowed MIME types: `application/pdf`, `image/jpeg`, `image/png`, `image/tiff`.
  - 0-byte empty files must be flagged and rejected.
- **Multi-Document Readiness Rules (`tests/tier3-combinations.test.mjs:18–43`)**:
  - `HOSPITAL_BILL` only: `canAnalyze = false` (`BILL_SCRUTINY_ONLY`).
  - `HOSPITAL_BILL` + `INSURANCE_POLICY`: `canAnalyze = false` (`PRE_CLAIM_ESTIMATE`).
  - `HOSPITAL_BILL` + `INSURANCE_POLICY` + `REJECTION_LETTER`: `canAnalyze = true` (`FULL_TRIO_AUDIT`).
  - Documents uploaded out-of-order must maintain document type fidelity.
- **Backend API Operations (`src/services/api.js:122–151`)**:
  - `uploadDocument(file, documentType, claimId = null)`:
    Returns `{ claim_id, document_id, filename, status }`.
  - `triggerAnalysis(claimId)`:
    Returns `{ analysis_run_id, status: 'RUNNING' }`.
  - Seamless navigation target: `/analysis/:claimId`.

---

## 2. Logic Chain

1. **Addressing Auditor Intake Realities**:
   - In clinical audit environments (hospital billing desks, TPA desks, patient advocacy desks), users receive document packets in varied forms. Some auditors possess a zip file or 3 files in an email and want to drag all 3 files into one area in a single second ("Batch Multi-Drop"). Other auditors work through physical paper files one by one and prefer distinct labeled drop targets ("Guided 3-Step").
   - *Therefore*, the system must provide a **Dual-Mode Upload Architecture** switched by an enterprise segmented pill control (`Batch Upload` vs `Guided 3-Step`).

2. **Automating Document Classification (Auto-Tagging)**:
   - When 1 to 3 files are dropped simultaneously in Batch Mode, manually asking the user to tag each file introduces unnecessary clicks.
   - Medical and insurance filenames invariably contain standard keywords:
     - Bills: `bill`, `invoice`, `discharge`, `summary`, `ipd`, `opd`, `hospital`, `charges`.
     - Policies: `policy`, `schedule`, `coverage`, `insurance`, `star`, `care`, `hdfc`, `icici`, `niacl`.
     - Rejection: `rejection`, `denial`, `deduct`, `settlement`, `query`, `tpa`, `disallow`, `voucher`.
   - By running regex pattern matching on filenames, we can automatically slot files into their respective categories, falling back to unfilled slots if unmatched, while allowing user override via a type dropdown.

3. **Providing Enterprise Inspection & Correction Controls**:
   - Healthcare compliance requires auditability. The user must clearly see:
     1. Formatted file size (`formatFileSize`) to confirm the entire packet was received.
     2. Visual format chip (`PDF`, `PNG`, `JPG`, `TIFF`).
     3. An explicit **Replace** action that swaps only that specific slot without resetting other uploaded documents or the `claim_id`.
     4. An explicit **Remove** action to disassociate a wrongly attached file.

4. **Building Confidence with Pre-Analysis Health Checks (`ReadinessCheck`)**:
   - Clinical auditors hesitate before triggering computationally heavy AI pipelines if they are unsure what data was recognized.
   - By providing a live **Readiness Checklist** featuring:
     - 3 Tripartite indicators (Bill, Policy, Rejection) with real-time status.
     - Forensic & statutory capability pre-flight checklist (Line item itemization, Sum insured & room rent limit, Disallowance grounds, Digital forensics ELA scan).
     - Gated "Run Claim Forensics & Audit" CTA button (disabled until all 3 documents exist).
   - This directly fulfills Requirement R3 (UX Polish) and Tier 3.1 contract specifications.

---

## 3. Caveats

1. **Client-Side File Parsing Limitations**: The browser file object provides `name`, `size`, `type`, and `lastModified`. Semantic content extraction (OCR/VLM) occurs asynchronously on the backend. Thus, the preliminary checklist items in `ReadinessCheck` represent pipeline readiness and verification criteria rather than server-parsed line counts.
2. **Network Resilience**: In offline development or simulated backend environments, `uploadDocument` in `src/services/api.js` gracefully returns client-simulated responses (`claim_id: 'CLM-XXXXX'`). The frontend state machine seamlessly operates in both real and mock environments.
3. **No Code Write During Investigation**: Per explorer guidelines, this report provides complete, production-ready JSX component implementations and contracts for downstream implementation without directly modifying `src/`.

---

## 4. Conclusion & Architectural Blueprint

### 4.1 File Inventory for Milestone 3
To implement Milestone 3 with enterprise perfection, the following files will be created/updated:
1. `src/components/upload/BatchDropzone.jsx` (New) — Dual-mode dropzone supporting Mode A (multi-drop with auto-tagging) and Mode B (guided 3 slotted targets).
2. `src/components/upload/DocumentCard.jsx` (New) — Metadata inspection card displaying document badge, format chip, size, replace/remove actions.
3. `src/components/upload/ReadinessCheck.jsx` (New) — Pre-analysis health check panel with tripartite indicators, capability checklist, and CTA.
4. `src/pages/Upload.jsx` (Refactor) — Complete upload studio page wiring state, dropzones, cards, readiness check, and `/analysis/:id` transition.

---

### 4.2 Component Specification: `src/components/upload/BatchDropzone.jsx`

#### Prop Contract:
```typescript
interface BatchDropzoneProps {
  mode: 'batch' | 'guided';
  onModeChange: (newMode: 'batch' | 'guided') => void;
  onBatchFiles: (files: File[]) => void;
  onSlotFile: (file: File, docType: DocumentType) => void;
  documents: Record<DocumentType, UploadedDocRecord | null>;
  isUploading: boolean;
}
```

#### Production-Grade Template Implementation:
```jsx
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  UploadCloud, 
  Layers, 
  FileCheck, 
  AlertCircle, 
  FileSpreadsheet, 
  ShieldCheck, 
  FileWarning, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB boundary
const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpeg', '.jpg'],
  'image/png': ['.png'],
  'image/tiff': ['.tiff', '.tif']
};

export const autoTagDocument = (filename) => {
  if (!filename || typeof filename !== 'string') return null;
  const name = filename.toLowerCase();
  
  if (/(rej|rejection|denial|deduct|settle|settlement|query|tpa|disallow|disallowance|voucher|computation)/i.test(name)) {
    return 'REJECTION_LETTER';
  }
  if (/(policy|schedule|coverage|ins|insurance|star|care|hdfc|icici|niacl|uiic|max_bupa|niva|bajaj|reliance)/i.test(name)) {
    return 'INSURANCE_POLICY';
  }
  if (/(bill|inv|invoice|discharge|hosp|hospital|apollo|fortis|max|medanta|summary|ipd|opd|charges|receipt)/i.test(name)) {
    return 'HOSPITAL_BILL';
  }
  return null;
};

export default function BatchDropzone({
  mode,
  onModeChange,
  onBatchFiles,
  onSlotFile,
  documents,
  isUploading
}) {
  const [dragOverSlot, setDragOverSlot] = useState(null);

  // Mode A: Batch Dropzone
  const onBatchDrop = useCallback((acceptedFiles, fileRejections) => {
    if (fileRejections.length > 0) {
      const firstErr = fileRejections[0].errors[0]?.message || 'Invalid file';
      toast.error(`File rejected: ${firstErr}`);
      return;
    }
    if (!acceptedFiles || acceptedFiles.length === 0) return;
    onBatchFiles(acceptedFiles.slice(0, 3));
  }, [onBatchFiles]);

  const {
    getRootProps: getBatchRootProps,
    getInputProps: getBatchInputProps,
    isDragActive: isBatchDragActive,
    isDragReject: isBatchDragReject
  } = useDropzone({
    onDrop: onBatchDrop,
    accept: ACCEPTED_TYPES,
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

    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File "${file.name}" exceeds maximum size of 25MB`);
      return;
    }
    onSlotFile(file, docType);
  };

  const slotConfigs = [
    {
      id: 'HOSPITAL_BILL',
      title: '1. Hospital Bill & Discharge',
      subtitle: 'Itemized final bill, room rent, pharmacy & consumables breakdown',
      icon: FileSpreadsheet,
      accentColor: 'teal',
      accentBorder: 'hover:border-teal-500 border-teal-200/80 bg-teal-50/20',
      activeBorder: 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-500/20',
      badgeClass: 'bg-teal-100 text-teal-800 border-teal-200',
    },
    {
      id: 'INSURANCE_POLICY',
      title: '2. Insurance Policy Terms',
      subtitle: 'Policy schedule, sum insured, copay clause & room rent sub-limits',
      icon: ShieldCheck,
      accentColor: 'sky',
      accentBorder: 'hover:border-sky-500 border-sky-200/80 bg-sky-50/20',
      activeBorder: 'border-sky-600 bg-sky-50/50 ring-2 ring-sky-500/20',
      badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
    },
    {
      id: 'REJECTION_LETTER',
      title: '3. Rejection / Settlement Letter',
      subtitle: 'TPA deduction sheet, disallowance rationale & denial voucher',
      icon: FileWarning,
      accentColor: 'amber',
      accentBorder: 'hover:border-amber-500 border-amber-200/80 bg-amber-50/20',
      activeBorder: 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-500/20',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    }
  ];

  return (
    <div className="space-y-4">
      {/* Mode Switcher Pill */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Upload Engine:</span>
          <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200 shadow-inner-subtle">
            <button
              type="button"
              onClick={() => onModeChange('batch')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
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
              onClick={() => onModeChange('guided')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
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

        <div className="text-[11px] font-medium text-slate-400 hidden sm:block">
          Max 25MB / file • PDF, PNG, JPG, TIFF
        </div>
      </div>

      {/* Mode A: Batch Multi-Drop Zone */}
      {mode === 'batch' && (
        <div
          {...getBatchRootProps()}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
            isBatchDragActive
              ? 'border-sky-500 bg-sky-50/60 ring-4 ring-sky-500/10 scale-[1.005]'
              : isBatchDragReject
              ? 'border-rose-400 bg-rose-50/60 ring-4 ring-rose-500/10'
              : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
          } ${isUploading ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <input {...getBatchInputProps()} />

          <div className="flex flex-col items-center justify-center space-y-3">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
              isBatchDragActive ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30' : 'bg-white text-slate-600 shadow-sm border border-slate-200'
            }`}>
              <UploadCloud className="w-7 h-7" />
            </div>

            <div>
              <p className="text-base font-bold text-slate-800">
                {isBatchDragActive ? 'Drop all 1 to 3 documents here' : 'Drag & drop all claim documents together'}
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Drop your <strong className="text-slate-700">Hospital Bill</strong>, <strong className="text-slate-700">Insurance Policy</strong>, and <strong className="text-slate-700">Rejection Letter</strong> at once. ClaimGuard AI will auto-detect and sort each file.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
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
                onDragOver={(e) => { e.preventDefault(); setDragOverSlot(slot.id); }}
                onDragLeave={() => setDragOverSlot(null)}
                onDrop={(e) => handleSlotDrop(e, slot.id)}
                className={`relative rounded-xl border-2 border-dashed p-4 transition-all duration-150 flex flex-col justify-between min-h-[160px] ${
                  isTargetActive
                    ? slot.activeBorder
                    : hasDoc
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : slot.accentBorder
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${hasDoc ? 'bg-emerald-100 text-emerald-700' : 'bg-white text-slate-700 border border-slate-200 shadow-2xs'}`}>
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
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onSlotFile(file, slot.id);
                      }}
                    />
                  </label>

                  {hasDoc && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                      Loaded
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
```

---

### 4.3 Component Specification: `src/components/upload/DocumentCard.jsx`

#### Prop Contract:
```typescript
interface DocumentCardProps {
  documentType: 'HOSPITAL_BILL' | 'INSURANCE_POLICY' | 'REJECTION_LETTER';
  docRecord: {
    file: File;
    name: string;
    size: number;
    type: string;
    uploadStatus: 'ready' | 'uploading' | 'error';
    serverDocId?: string;
  } | null;
  onReplace: (file: File) => void;
  onRemove: () => void;
  onRetag: (newType: 'HOSPITAL_BILL' | 'INSURANCE_POLICY' | 'REJECTION_LETTER') => void;
}
```

#### Production-Grade Template Implementation:
```jsx
import React, { useRef } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  Trash2, 
  RefreshCw, 
  FileSpreadsheet, 
  ShieldCheck, 
  FileWarning, 
  FileImage,
  AlertTriangle
} from 'lucide-react';

const DOC_METADATA = {
  HOSPITAL_BILL: {
    title: 'Hospital Bill & Discharge',
    badge: 'bg-teal-50 text-teal-700 border-teal-200',
    icon: FileSpreadsheet,
    desc: 'Itemized hospital invoice'
  },
  INSURANCE_POLICY: {
    title: 'Insurance Policy Schedule',
    badge: 'bg-sky-50 text-sky-700 border-sky-200',
    icon: ShieldCheck,
    desc: 'Policy clauses & limits'
  },
  REJECTION_LETTER: {
    title: 'TPA Settlement / Rejection',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: FileWarning,
    desc: 'Deductions & disallowance'
  }
};

export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const getFormatChip = (filename, mimeType) => {
  const ext = (filename.split('.').pop() || '').toUpperCase();
  if (ext === 'PDF' || mimeType?.includes('pdf')) {
    return { label: 'PDF', bg: 'bg-rose-100 text-rose-700 border-rose-200' };
  }
  if (['PNG', 'JPG', 'JPEG'].includes(ext) || mimeType?.includes('image')) {
    return { label: ext || 'IMG', bg: 'bg-indigo-100 text-indigo-700 border-indigo-200' };
  }
  return { label: ext || 'DOC', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
};

export default function DocumentCard({
  documentType,
  docRecord,
  onReplace,
  onRemove,
  onRetag
}) {
  const fileInputRef = useRef(null);
  const meta = DOC_METADATA[documentType] || DOC_METADATA.HOSPITAL_BILL;
  const DocIcon = meta.icon;

  if (!docRecord) {
    return (
      <div className="card-enterprise p-4 border-dashed border-slate-300 bg-slate-50/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center border border-slate-200">
            <DocIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">{meta.title}</span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Unattached</span>
            </div>
            <p className="text-[11px] text-slate-500">Upload document to complete tripartite audit intake.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-xs font-semibold text-brand-600 hover:text-brand-700 px-3 py-1.5 rounded-lg border border-brand-200 hover:border-brand-300 bg-white shadow-2xs transition-colors"
        >
          Attach File
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.tiff,.tif"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onReplace(file);
          }}
        />
      </div>
    );
  }

  const format = getFormatChip(docRecord.name, docRecord.type);

  return (
    <div className="card-enterprise card-enterprise-hover p-4 border-slate-200 bg-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Emblem & Details */}
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs flex-shrink-0">
            <DocIcon className="w-5 h-5 text-sky-400" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${meta.badge}`}>
                {meta.title}
              </span>
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border ${format.bg}`}>
                {format.label}
              </span>
              {docRecord.uploadStatus === 'ready' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified
                </span>
              )}
              {docRecord.uploadStatus === 'uploading' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600 animate-pulse">
                  <div className="w-3 h-3 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </span>
              )}
            </div>

            <div className="mt-1 flex items-center gap-2">
              <p className="text-xs font-semibold text-slate-800 truncate max-w-xs md:max-w-md" title={docRecord.name}>
                {docRecord.name}
              </p>
              <span className="text-[11px] text-slate-400 font-financial flex-shrink-0">
                ({formatFileSize(docRecord.size)})
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          {/* Retag Dropdown Selector */}
          <select
            value={documentType}
            onChange={(e) => onRetag(e.target.value)}
            className="text-[11px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:ring-1 focus:ring-brand-500 focus:outline-none"
            title="Reclassify document slot"
          >
            <option value="HOSPITAL_BILL">Hospital Bill</option>
            <option value="INSURANCE_POLICY">Insurance Policy</option>
            <option value="REJECTION_LETTER">Rejection Letter</option>
          </select>

          {/* Replace Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Replace document"
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.tiff,.tif"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onReplace(file);
            }}
          />

          {/* Remove Button */}
          <button
            type="button"
            onClick={onRemove}
            title="Remove document"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

### 4.4 Component Specification: `src/components/upload/ReadinessCheck.jsx`

#### Prop Contract:
```typescript
interface ReadinessCheckProps {
  documents: Record<'HOSPITAL_BILL' | 'INSURANCE_POLICY' | 'REJECTION_LETTER', any | null>;
  claimId: string | null;
  isAnalyzing: boolean;
  onRunAudit: () => void;
}
```

#### Production-Grade Template Implementation:
```jsx
import React from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Activity, 
  Sparkles, 
  AlertTriangle, 
  FileSearch,
  Scale,
  Microscope,
  FileText
} from 'lucide-react';

export default function ReadinessCheck({
  documents,
  claimId,
  isAnalyzing,
  onRunAudit
}) {
  const hasBill = !!documents.HOSPITAL_BILL;
  const hasPolicy = !!documents.INSURANCE_POLICY;
  const hasRejection = !!documents.REJECTION_LETTER;

  const uploadedCount = [hasBill, hasPolicy, hasRejection].filter(Boolean).length;
  const canAnalyze = uploadedCount === 3;
  const readinessPercentage = Math.round((uploadedCount / 3) * 100);

  const checklistItems = [
    {
      title: 'Itemized Tariff & Line Items',
      desc: 'Room rent, nursing, OT, pharmacy, and consumables separation',
      ready: hasBill,
      icon: Scale,
    },
    {
      title: 'Statutory Policy Limits',
      desc: 'Sum insured, room rent capping, copay clause & waiting periods',
      ready: hasPolicy,
      icon: ShieldCheck,
    },
    {
      title: 'TPA Disallowance Grounds',
      desc: 'Deductions, exclusion citations & settlement dispute basis',
      ready: hasRejection,
      icon: FileSearch,
    },
    {
      title: 'Digital Forensics Pre-Scan (ELA)',
      desc: 'Pixel discontinuity, EXIF tampering & CGHS benchmark audit',
      ready: canAnalyze,
      icon: Microscope,
    }
  ];

  return (
    <div className="card-enterprise p-6 space-y-6 bg-white border-slate-200/90 shadow-card">
      {/* Header & Readiness Score */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-slate-900 text-white shadow-2xs">
              <Activity className="w-4 h-4 text-teal-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Pre-Analysis Health Check</h3>
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
            canAnalyze 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : uploadedCount > 0 
              ? 'bg-amber-50 text-amber-700 border-amber-200' 
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}>
            {uploadedCount}/3 Docs Attached ({readinessPercentage}%)
          </span>
        </div>

        {/* 3-Segment Progress Bar */}
        <div className="mt-3 w-full bg-slate-100 h-2 rounded-full overflow-hidden flex gap-1 p-0.5">
          <div className={`h-full rounded-full transition-all duration-300 ${hasBill ? 'bg-teal-500 flex-1' : 'bg-transparent flex-1'}`} />
          <div className={`h-full rounded-full transition-all duration-300 ${hasPolicy ? 'bg-sky-500 flex-1' : 'bg-transparent flex-1'}`} />
          <div className={`h-full rounded-full transition-all duration-300 ${hasRejection ? 'bg-amber-500 flex-1' : 'bg-transparent flex-1'}`} />
        </div>
      </div>

      {/* Tripartite Intake Status Matrix */}
      <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Required Document Trio
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-slate-700">
              {hasBill ? <CheckCircle2 className="w-4 h-4 text-teal-600" /> : <XCircle className="w-4 h-4 text-slate-300" />}
              Hospital Bill
            </span>
            <span className="font-semibold text-slate-500 font-financial">
              {hasBill ? 'Ready' : 'Pending'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-slate-700">
              {hasPolicy ? <CheckCircle2 className="w-4 h-4 text-sky-600" /> : <XCircle className="w-4 h-4 text-slate-300" />}
              Insurance Policy
            </span>
            <span className="font-semibold text-slate-500 font-financial">
              {hasPolicy ? 'Ready' : 'Pending'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-slate-700">
              {hasRejection ? <CheckCircle2 className="w-4 h-4 text-amber-600" /> : <XCircle className="w-4 h-4 text-slate-300" />}
              Rejection / Settlement Letter
            </span>
            <span className="font-semibold text-slate-500 font-financial">
              {hasRejection ? 'Ready' : 'Pending'}
            </span>
          </div>
        </div>
      </div>

      {/* Preliminary Inspection Capabilities */}
      <div className="space-y-3">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Forensic Inspection Scope
        </div>
        <div className="space-y-2.5">
          {checklistItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-start gap-2.5">
                <div className={`p-1 rounded mt-0.5 ${item.ready ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800">{item.title}</div>
                  <div className="text-[11px] text-slate-500 leading-tight">{item.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Button & Session Info */}
      <div className="pt-3 border-t border-slate-200/80 space-y-3">
        <button
          type="button"
          onClick={onRunAudit}
          disabled={!canAnalyze || isAnalyzing}
          className={`w-full py-3 px-4 rounded-xl font-bold text-sm shadow-sm transition-all duration-200 flex items-center justify-center gap-2 ${
            canAnalyze && !isAnalyzing
              ? 'bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white shadow-sky-600/20 hover:shadow-md cursor-pointer'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Launching Forensic Pipeline...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Run Claim Forensics & Audit</span>
            </>
          )}
        </button>

        {claimId && (
          <div className="text-center text-[11px] text-slate-500 font-financial">
            Active Session Claim ID: <span className="font-bold text-slate-800">{claimId}</span>
          </div>
        )}

        {!canAnalyze && (
          <p className="text-center text-[11px] text-slate-500">
            Attach all 3 documents to initiate the IRDAI statutory verification audit.
          </p>
        )}
      </div>
    </div>
  );
}
```

---

### 4.5 Component Specification: `src/pages/Upload.jsx` (Refactored Page)

#### Complete Page Implementation Architecture:
```jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, HelpCircle, FileCheck2, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import BatchDropzone, { autoTagDocument } from '../components/upload/BatchDropzone';
import DocumentCard from '../components/upload/DocumentCard';
import ReadinessCheck from '../components/upload/ReadinessCheck';
import { uploadDocument, triggerAnalysis } from '../services/api';

const DOCUMENT_KEYS = ['HOSPITAL_BILL', 'INSURANCE_POLICY', 'REJECTION_LETTER'];

export default function Upload() {
  const navigate = useNavigate();
  const [claimId, setClaimId] = useState(null);
  const [mode, setMode] = useState('batch'); // 'batch' | 'guided'
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [documents, setDocuments] = useState({
    HOSPITAL_BILL: null,
    INSURANCE_POLICY: null,
    REJECTION_LETTER: null,
  });

  // Upload a single file to a specific document slot
  const uploadSingleFile = async (file, docType, currentClaimId = claimId) => {
    // Optimistically set document record in state
    const optimisticRecord = {
      file,
      name: file.name,
      size: file.size,
      type: file.type || 'application/pdf',
      uploadStatus: 'uploading'
    };

    setDocuments(prev => ({ ...prev, [docType]: optimisticRecord }));

    try {
      const response = await uploadDocument(file, docType, currentClaimId);
      const assignedClaimId = currentClaimId || response.claim_id;
      
      if (!currentClaimId && assignedClaimId) {
        setClaimId(assignedClaimId);
      }

      setDocuments(prev => ({
        ...prev,
        [docType]: {
          file,
          name: file.name,
          size: file.size,
          type: file.type || 'application/pdf',
          uploadStatus: 'ready',
          serverDocId: response.document_id
        }
      }));

      toast.success(`${docType.replace('_', ' ')} uploaded successfully`);
      return assignedClaimId;
    } catch (error) {
      console.error(`Failed to upload ${docType}:`, error);
      setDocuments(prev => ({
        ...prev,
        [docType]: {
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          uploadStatus: 'error'
        }
      }));
      toast.error(`Failed to upload ${file.name}`);
      return currentClaimId;
    }
  };

  // Handle Mode A: Multi-drop batch files
  const handleBatchFiles = async (files) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);

    let activeClaimId = claimId;
    const assignedSlots = {};
    const unassignedFiles = [];

    // Step 1: Attempt auto-tagging
    files.forEach(file => {
      const detectedType = autoTagDocument(file.name);
      if (detectedType && !assignedSlots[detectedType]) {
        assignedSlots[detectedType] = file;
      } else {
        unassignedFiles.push(file);
      }
    });

    // Step 2: Assign remaining files to unfilled slots
    for (const key of DOCUMENT_KEYS) {
      if (!assignedSlots[key] && !documents[key] && unassignedFiles.length > 0) {
        assignedSlots[key] = unassignedFiles.shift();
      }
    }

    // Step 3: Execute uploads sequentially to link claimId properly
    for (const [docType, file] of Object.entries(assignedSlots)) {
      activeClaimId = await uploadSingleFile(file, docType, activeClaimId);
    }

    setIsUploading(false);
  };

  // Handle Mode B: Single slot drop
  const handleSlotFile = async (file, docType) => {
    setIsUploading(true);
    await uploadSingleFile(file, docType, claimId);
    setIsUploading(false);
  };

  // Replace file callback
  const handleReplace = async (file, docType) => {
    setIsUploading(true);
    await uploadSingleFile(file, docType, claimId);
    setIsUploading(false);
  };

  // Remove file callback
  const handleRemove = (docType) => {
    setDocuments(prev => ({ ...prev, [docType]: null }));
    toast.success(`${docType.replace('_', ' ')} removed`);
  };

  // Retag / slot swap callback
  const handleRetag = (sourceType, targetType) => {
    if (sourceType === targetType) return;
    setDocuments(prev => {
      const sourceDoc = prev[sourceType];
      const targetDoc = prev[targetType];
      return {
        ...prev,
        [sourceType]: targetDoc,
        [targetType]: sourceDoc
      };
    });
    toast.success(`Reclassified as ${targetType.replace('_', ' ')}`);
  };

  // Trigger analysis and transition
  const handleRunAudit = async () => {
    if (!claimId) {
      toast.error('No active claim session found. Please re-upload documents.');
      return;
    }

    setIsAnalyzing(true);
    try {
      await triggerAnalysis(claimId);
      toast.success('Claim forensics & audit initiated');
      navigate(`/analysis/${claimId}`);
    } catch (error) {
      console.error('Trigger analysis failed:', error);
      toast.error('Failed to initiate analysis pipeline');
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Claim Intake & Upload Studio
            </h1>
            <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-sky-200 uppercase">
              VLM OCR v2.4
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Intake hospital bills, insurance policies, and TPA rejection letters for statutory IRDAI audits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] uppercase font-bold text-slate-400">Compliance Standard</div>
            <div className="text-xs font-bold text-slate-700">IRDAI Master Circular 2024</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center shadow-xs">
            <Shield className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Studio Grid: Left (Dropzone & Cards) + Right (ReadinessCheck) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Dropzone & Cards */}
        <div className="lg:col-span-7 space-y-5">
          {/* Dual-Mode Dropzone */}
          <div className="card-enterprise p-5 bg-white border-slate-200/90 shadow-card">
            <BatchDropzone
              mode={mode}
              onModeChange={setMode}
              onBatchFiles={handleBatchFiles}
              onSlotFile={handleSlotFile}
              documents={documents}
              isUploading={isUploading}
            />
          </div>

          {/* Document Cards Slot Stack */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Attached Document Records
              </h2>
              <span className="text-[11px] text-slate-400">
                Click reclassify or replace to adjust slots
              </span>
            </div>

            {DOCUMENT_KEYS.map((key) => (
              <DocumentCard
                key={key}
                documentType={key}
                docRecord={documents[key]}
                onReplace={(file) => handleReplace(file, key)}
                onRemove={() => handleRemove(key)}
                onRetag={(newType) => handleRetag(key, newType)}
              />
            ))}
          </div>
        </div>

        {/* Right Column (5 cols): Pre-Analysis Health Check */}
        <div className="lg:col-span-5 sticky top-6">
          <ReadinessCheck
            documents={documents}
            claimId={claimId}
            isAnalyzing={isAnalyzing}
            onRunAudit={handleRunAudit}
          />
        </div>
      </div>
    </div>
  );
}
```

---

## 5. Verification Method

### 5.1 Verification Commands & Checks
1. **Component Rendering Validation via Node / SSR**:
   - Verify that all newly created components (`BatchDropzone`, `DocumentCard`, `ReadinessCheck`) render valid static HTML in tests without runtime errors:
     ```bash
     node -e "import('./src/components/upload/BatchDropzone.jsx')"
     ```
2. **E2E Test Runner**:
   - Run the master automated test runner:
     ```bash
     npm test
     ```
     (or `node tests/runner.mjs`)
   - Confirm all 4 tiers (Tier 1: Feature Coverage, Tier 2: Boundaries, Tier 3: Combinations, Tier 4: Real-World Scenarios) pass with 100% success.
3. **Vite Production Build Compilation**:
   - Run production bundling to verify no syntax errors, missing imports, or CSS token issues:
     ```bash
     npm run build
     ```
   - Must complete with zero errors.

### 5.2 Specific File Inspection Checklist
- Check `src/components/upload/BatchDropzone.jsx`:
  - Enforces `MAX_FILE_SIZE = 25 * 1024 * 1024` (25MB limit).
  - Matches regex patterns for Bill, Policy, and Rejection in `autoTagDocument()`.
  - Supports switching between `mode === 'batch'` and `mode === 'guided'`.
- Check `src/components/upload/DocumentCard.jsx`:
  - Renders document badges, format chips, and formatted file sizes.
  - Implements replace (`RefreshCw`) and remove (`Trash2`) callbacks.
- Check `src/components/upload/ReadinessCheck.jsx`:
  - Accurately computes `canAnalyze = uploadedCount === 3`.
  - Disables CTA button when fewer than 3 documents are attached.
  - Triggers `onRunAudit` upon click and redirects to `/analysis/:id`.
- Check `src/pages/Upload.jsx`:
  - Integrates `BatchDropzone`, `DocumentCard`, and `ReadinessCheck`.
  - Maintains `claimId` consistency across multi-file uploads.

### 5.3 Invalidation Conditions
- If the dropzone allows files larger than 25MB without warning.
- If dropping 3 files simultaneously in Batch Mode fails to auto-populate the 3 document cards.
- If the "Run Claim Forensics & Audit" button can be clicked when only 1 or 2 documents are attached.
- If replacing a document resets the existing `claimId` session or deletes other attached documents.
