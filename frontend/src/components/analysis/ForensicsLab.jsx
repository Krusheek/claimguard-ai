/**
 * src/components/analysis/ForensicsLab.jsx
 * Digital Forensics & Fraud Detection Lab
 * Feature 14: Digital Forensics & Fraud Detection Lab
 * Compliant with ISO/IEC 15444 & CGHS Gazette Tariff Benchmarks
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  FileCheck,
  Eye,
  Sliders,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BarChart2,
  FileText,
  Activity,
  Sparkles,
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { mockAnalysisResult } from '../../services/mockData';

// Currency Formatter in Indian Rupees
export const formatInr = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

export const formatINR = formatInr;

/**
 * Pure SVG Circular ELA Tamper Gauge (0-100)
 * 240-degree sweep arc from 150 deg to 390 deg (-120 deg to +120 deg)
 */
export function ElaTamperGauge({ score = 8.4, assessment = 'CLEAN' }) {
  const cleanScore = Math.max(0, Math.min(100, Number(score) || 0));

  // 240-degree arc geometry
  const radius = 80;
  const cx = 110;
  const cy = 110;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius; // ~502.65
  const arcLength = circumference * (240 / 360); // ~335.1
  const strokeDashoffset = arcLength * (1 - cleanScore / 100);

  // Needle angle: from -120 deg to +120 deg
  const needleAngle = -120 + (cleanScore / 100) * 240;

  // Status mapping
  const isClean = cleanScore < 30;
  const isSuspicious = cleanScore >= 30 && cleanScore < 70;
  const isHighRisk = cleanScore >= 70;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-56 h-48 flex items-center justify-center">
        <svg viewBox="0 0 220 200" className="w-full h-full overflow-visible">
          <defs>
            {/* Gradient for gauge arc */}
            <linearGradient id="elaGaugeGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="45%" stopColor="#10B981" />
              <stop offset="65%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#E11D48" />
            </linearGradient>
            {/* Drop shadow for needle */}
            <filter id="gaugeShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Background track (slate arc) */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset="0"
            strokeLinecap="round"
            transform={`rotate(150 ${cx} ${cy})`}
          />

          {/* Active colored arc */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="url(#elaGaugeGrad)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(150 ${cx} ${cy})`}
            className="transition-all duration-1000 ease-out"
          />

          {/* Scale tick marks */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const tickAngle = -120 + (tick / 100) * 240;
            const rad = (tickAngle * Math.PI) / 180;
            const x1 = cx + (radius - 12) * Math.sin(rad);
            const y1 = cy - (radius - 12) * Math.cos(rad);
            const x2 = cx + (radius - 20) * Math.sin(rad);
            const y2 = cy - (radius - 20) * Math.cos(rad);
            return (
              <line
                key={tick}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#94A3B8"
                strokeWidth="2"
                strokeLinecap="round"
              />
            );
          })}

          {/* Needle pointer */}
          <g
            transform={`rotate(${needleAngle} ${cx} ${cy})`}
            className="transition-transform duration-1000 ease-out"
          >
            <polygon
              points={`${cx - 3},${cy} ${cx + 3},${cy} ${cx},${cy - radius + 8}`}
              fill="#0F172A"
              filter="url(#gaugeShadow)"
            />
            <circle cx={cx} cy={cy} r="8" fill="#0F172A" />
            <circle cx={cx} cy={cy} r="3.5" fill="#38BDF8" />
          </g>

          {/* Scale labels */}
          <text x="36" y="168" fontSize="11" fontWeight="600" fill="#059669" textAnchor="middle">0 (Clean)</text>
          <text x="110" y="44" fontSize="11" fontWeight="600" fill="#D97706" textAnchor="middle">50</text>
          <text x="184" y="168" fontSize="11" fontWeight="600" fill="#E11D48" textAnchor="middle">100 (Risk)</text>
        </svg>

        {/* Center score readout */}
        <div className="absolute bottom-2 flex flex-col items-center">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-financial">
            {cleanScore.toFixed(1)}
            <span className="text-sm font-semibold text-slate-400">/100</span>
          </span>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Tamper Score
          </span>
        </div>
      </div>

      {/* Assessment Risk Pill */}
      <div className="mt-2">
        <StatusBadge
          status={assessment || (isClean ? 'CLEAN' : isSuspicious ? 'NEEDS_REVIEW' : 'HIGH_RISK')}
          size="md"
        />
      </div>
    </div>
  );
}

/**
 * ForensicsLab Component (Feature 14)
 */
export default function ForensicsLab({
  forensics = null,
  claimId = 'CLM-84920',
  patientName = 'Ayush Sharma',
  hospitalName = 'Apollo Hospitals, Bangalore',
  totalBilled = 110500,
}) {
  const f = forensics || mockAnalysisResult.forensics;
  const ela = f.ela_result || {
    tamper_score: 8.4,
    assessment: 'CLEAN',
    details: 'Error level compression gradient is uniform across all document layers. No digital clone stamping or splicing found.',
  };

  // Heatmap viewer modes: 'doc' | 'heatmap' | 'blend'
  const [viewMode, setViewMode] = useState('doc');
  const [blendOpacity, setBlendOpacity] = useState(65);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedMetro, setSelectedMetro] = useState('Bengaluru');

  // Benchmark procedures dataset
  const benchmarkItems = [
    {
      id: 'ot-consumables',
      procedure: 'OT Consumable Pack (Laparoscopy Trocar & Drape Kit)',
      category: 'Consumables & Implants',
      hospitalCharge: 14500,
      cghsBenchmark: 8200,
      variancePct: 76.8,
      severity: 'HIGH',
      notes: 'Billed 76.8% above CGHS Bengaluru rate schedule (NABH accredited cap).',
    },
    {
      id: 'lap-chole',
      procedure: 'Laparoscopic Cholecystectomy (Surgical Package)',
      category: 'Surgical Procedures',
      hospitalCharge: 48000,
      cghsBenchmark: 32000,
      variancePct: 50.0,
      severity: 'MEDIUM',
      notes: 'Includes surgeon fee, assistant, anesthesia & 48h nursing.',
    },
    {
      id: 'room-rent',
      procedure: 'Deluxe Private Room (Per Day × 2 Days)',
      category: 'Accommodation & Nursing',
      hospitalCharge: 13000,
      cghsBenchmark: 6000,
      variancePct: 116.7,
      severity: 'HIGH',
      notes: 'Billed ₹6,500/day vs CGHS benchmark rate ₹3,000/day.',
    },
    {
      id: 'consultation',
      procedure: 'Senior Gastro Specialist Consultation (2 Visits)',
      category: 'Professional Fees',
      hospitalCharge: 15000,
      cghsBenchmark: 12000,
      variancePct: 25.0,
      severity: 'LOW',
      notes: 'Within reasonable specialist discretionary allowance (+25%).',
    },
  ];

  // Clinical consistency matrix items
  const consistencyItems = [
    {
      id: 'proc-chole',
      category: 'Primary Surgical Procedure',
      item: 'Laparoscopic Cholecystectomy (CPT 47562)',
      icd10: 'K80.20 (Calculus of gallbladder without cholecystitis)',
      status: 'CONSISTENT',
      confidence: 99,
      rationale: 'Primary diagnostic indication aligns with standard clinical intervention guidelines.',
    },
    {
      id: 'med-cefuroxime',
      category: 'Inpatient Pharmacy',
      item: 'Inj. Cefuroxime 1.5g IV (Prophylactic Antibiotic)',
      icd10: 'K80.20 (Surgical Prophylaxis Protocol)',
      status: 'CONSISTENT',
      confidence: 96,
      rationale: 'Complies with Indian Council of Medical Research (ICMR) pre-op antibiotic protocol.',
    },
    {
      id: 'med-statin',
      category: 'Inpatient Pharmacy',
      item: 'Tab. Atorvastatin 40mg (Lipid-lowering agent)',
      icd10: 'K80.20 (No secondary Dyslipidemia code recorded)',
      status: 'FLAGGED',
      confidence: 42,
      rationale: 'Disallowed under acute gallbladder surgical admission; lacks co-morbid hyperlipidemia justification (ICD-10 E78.0).',
    },
    {
      id: 'diag-usg',
      category: 'Diagnostic Investigations',
      item: 'High-Resolution Ultrasound Whole Abdomen + LFT Profile',
      icd10: 'K80.20 (Biliary tract evaluation)',
      status: 'CONSISTENT',
      confidence: 98,
      rationale: 'Mandatory pre-operative ultrasound imaging verifying gallstones and duct clearance.',
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner: Digital Forensics & Fraud Lab Overview */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-elevation border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-medical-600/15 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-medical-cyan text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>ClaimGuard Multi-Spectrum Forensics Engine v2.4</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Digital Forensics & Fraud Detection Lab
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl">
              Automated Error Level Analysis (ELA) document tamper verification, EXIF/PDF metadata parsing, CGHS benchmark rate deviation audit, and ICD-10 clinical consistency checks.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/90 backdrop-blur px-4 py-2.5 rounded-xl border border-slate-700">
            <div className="text-right">
              <div className="text-xs text-slate-400 font-medium">Overall Forensic Risk</div>
              <div className="text-base font-bold text-emerald-400">
                {f.overall_risk === 'LOW' ? 'LOW RISK (AUTHENTIC)' : (f.overall_risk || 'LOW RISK')}
              </div>
            </div>
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Row 1: ELA Tamper Gauge & Metadata Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Pure SVG ELA Tamper Gauge */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-brand-600" />
                  Error Level Analysis (ELA)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Quantization noise gradient across document layers
                </p>
              </div>
              <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                ISO/IEC 15444
              </span>
            </div>

            <div className="py-4">
              <ElaTamperGauge score={ela.tamper_score} assessment={ela.assessment} />
            </div>

            <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 text-xs text-slate-600 leading-relaxed">
              <div className="font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-medical-600" />
                Algorithm Diagnostic Rationale:
              </div>
              {ela.details || 'Error level compression gradient is uniform across all document layers. No digital clone stamping or text splicing found.'}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Suspicious Regions: <strong className="text-slate-800">{ela.suspicious_regions?.length || 0}</strong></span>
            <span>Resave Artifacts: <strong className="text-emerald-700">None Detected</strong></span>
          </div>
        </div>

        {/* Right Column (7 cols): Document Metadata & EXIF Integrity */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-medical-600" />
                  Document Metadata & Hardware Provenance
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  EXIF tags, PDF producer signatures, and compression matrix parity
                </p>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                Hardware Verified
              </span>
            </div>

            {/* Metadata Grid */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <div className="text-[11px] font-semibold uppercase text-slate-500">Hardware Device Origin</div>
                <div className="text-sm font-bold text-slate-800 mt-1">Canon imageRUNNER ADVANCE C5550i</div>
                <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 text-emerald-700">
                  <CheckCircle2 className="w-3 h-3" /> Genuine Hospital Multi-Function Scanner
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <div className="text-[11px] font-semibold uppercase text-slate-500">PDF Producer & Engine</div>
                <div className="text-sm font-bold text-slate-800 mt-1">Adobe Normalizer 21.7.0</div>
                <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 text-emerald-700">
                  <CheckCircle2 className="w-3 h-3" /> Standard Enterprise PostScript Pipeline
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <div className="text-[11px] font-semibold uppercase text-slate-500">Timestamp Parity (Create / Mod)</div>
                <div className="text-sm font-bold text-slate-800 mt-1">2026-09-14 09:12:00 vs 09:12:00</div>
                <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 text-emerald-700">
                  <CheckCircle2 className="w-3 h-3" /> 0-second delta (No post-scan edit gap)
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <div className="text-[11px] font-semibold uppercase text-slate-500">Color Profile & Compression</div>
                <div className="text-sm font-bold text-slate-800 mt-1">sRGB IEC61966-2.1 / FlateDecode</div>
                <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 text-emerald-700">
                  <CheckCircle2 className="w-3 h-3" /> Single-pass lossless quantization
                </div>
              </div>
            </div>

            {/* Metadata Flags Table */}
            <div className="mt-4">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Inspected Security Markers
              </div>
              <div className="space-y-2">
                {f.metadata_flags && f.metadata_flags.length > 0 ? (
                  f.metadata_flags.map((flag, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 text-xs shadow-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <div>
                          <span className="font-semibold text-slate-800">{flag.field_name}: </span>
                          <span className="text-slate-600">{flag.description}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {flag.severity} RISK
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-500 italic p-2 bg-slate-50 rounded">
                    No suspicious metadata modifications detected.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>DPI Density: <strong className="text-slate-800">300 DPI Optical</strong></span>
            <span>Checksum Hash: <strong className="font-mono text-slate-800">9f86d081884...</strong></span>
          </div>
        </div>
      </div>

      {/* Row 2: Interactive Forensic Heatmap & Document Viewer */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-card space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Eye className="w-4 h-4 text-medical-600" />
              Document Heatmap & Anomaly Region Inspector
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Interactive layer toggle between authentic document view and ELA high-frequency noise map
            </p>
          </div>

          {/* Controls toolbar */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* View Mode Toggle Buttons */}
            <div className="inline-flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode('doc')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  viewMode === 'doc'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Original Document
              </button>
              <button
                type="button"
                onClick={() => setViewMode('heatmap')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  viewMode === 'heatmap'
                    ? 'bg-slate-900 text-medical-cyan shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Forensic Heatmap
              </button>
              <button
                type="button"
                onClick={() => setViewMode('blend')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  viewMode === 'blend'
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Blend Overlay
              </button>
            </div>

            {/* Blend Opacity Slider (visible only in blend mode) */}
            {viewMode === 'blend' && (
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200 text-xs">
                <Sliders className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-600 font-medium">Heatmap {blendOpacity}%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={blendOpacity}
                  onChange={(e) => setBlendOpacity(Number(e.target.value))}
                  className="w-20 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                />
              </div>
            )}

            {/* Zoom Controls */}
            <div className="flex items-center bg-slate-100 rounded-lg border border-slate-200 p-0.5">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.1))}
                className="p-1.5 text-slate-600 hover:text-slate-900 rounded hover:bg-white"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-[11px] font-mono font-semibold text-slate-700">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
                className="p-1.5 text-slate-600 hover:text-slate-900 rounded hover:bg-white"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                className="p-1.5 text-slate-500 hover:text-slate-900 rounded hover:bg-white border-l border-slate-200"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Heatmap & Document Visual Canvas */}
        <div className="relative w-full overflow-x-auto bg-slate-950 rounded-xl border border-slate-800 p-4 md:p-8 flex justify-center min-h-[460px]">
          <div
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
            className="transition-transform duration-200 relative w-full max-w-3xl bg-white text-slate-900 rounded-lg shadow-elevation border border-slate-300 p-6 md:p-8 overflow-hidden"
          >
            {/* Base Document Rendering */}
            <div className="space-y-6 select-none font-sans">
              {/* Document Letterhead */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                <div>
                  <div className="text-xl font-extrabold text-slate-900 tracking-wide uppercase">
                    {hospitalName}
                  </div>
                  <div className="text-xs text-slate-600 font-medium mt-0.5">
                    Department of Surgical Gastroenterology & General Surgery
                  </div>
                  <div className="text-[11px] text-slate-500">
                    GSTIN: 29AABCA1234F1Z9 | Reg No: KA/BLR/MED/2019/88219
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1 rounded tracking-wider uppercase">
                    Tax Invoice #INV-2026-99120
                  </span>
                  <div className="text-xs text-slate-600 mt-1 font-semibold">Date: 14/09/2026</div>
                  <div className="text-xs text-slate-500">Claim Ref: {claimId}</div>
                </div>
              </div>

              {/* Patient & Admission Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-3 rounded border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block">Patient Name:</span>
                  <strong className="text-slate-800">{patientName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">UHID / IP No:</span>
                  <strong className="text-slate-800">UHID-882910</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Admission Date:</span>
                  <strong className="text-slate-800">10/09/2026</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Discharge Date:</span>
                  <strong className="text-slate-800">12/09/2026</strong>
                </div>
              </div>

              {/* Itemized Bill Table */}
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 text-slate-600 bg-slate-100 uppercase tracking-wider text-[10px]">
                    <th className="py-2 px-2 font-semibold">#</th>
                    <th className="py-2 px-2 font-semibold">Description of Medical Service</th>
                    <th className="py-2 px-2 font-semibold text-center">Qty</th>
                    <th className="py-2 px-2 font-semibold text-right">Unit Rate (₹)</th>
                    <th className="py-2 px-2 font-semibold text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
                  <tr>
                    <td className="py-2 px-2">1</td>
                    <td className="py-2 px-2 font-semibold">Laparoscopic Cholecystectomy (Package)</td>
                    <td className="py-2 px-2 text-center">1</td>
                    <td className="py-2 px-2 text-right">48,000.00</td>
                    <td className="py-2 px-2 text-right font-semibold">48,000.00</td>
                  </tr>
                  {/* Flagged Row */}
                  <tr className="bg-amber-50/60">
                    <td className="py-2 px-2 font-mono text-amber-900">2</td>
                    <td className="py-2 px-2 text-amber-950 font-semibold">
                      OT Consumable Pack (Trocar & Endoclip Cartridges)
                    </td>
                    <td className="py-2 px-2 text-center">1</td>
                    <td className="py-2 px-2 text-right">14,500.00</td>
                    <td className="py-2 px-2 text-right font-bold text-amber-900">14,500.00</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2">3</td>
                    <td className="py-2 px-2">Specialist Surgeon Professional Fee</td>
                    <td className="py-2 px-2 text-center">1</td>
                    <td className="py-2 px-2 text-right">35,000.00</td>
                    <td className="py-2 px-2 text-right">35,000.00</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2">4</td>
                    <td className="py-2 px-2">Post-Op Inpatient Pharmacy & IV Infusions</td>
                    <td className="py-2 px-2 text-center">1</td>
                    <td className="py-2 px-2 text-right">13,000.00</td>
                    <td className="py-2 px-2 text-right">13,000.00</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-900 font-bold text-slate-900">
                    <td colSpan={4} className="py-2.5 px-2 text-right uppercase text-xs">
                      Grand Total Billed:
                    </td>
                    <td className="py-2.5 px-2 text-right text-sm font-extrabold text-slate-900 font-financial">
                      {formatInr(totalBilled)}
                    </td>
                  </tr>
                </tfoot>
              </table>

              <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-500">
                <span>Authorized Hospital Billing Signatory: <strong>R. Deshmukh</strong></span>
                <span>Audit Verified: ClaimGuard AI Forensic Engine v2.4</span>
              </div>
            </div>

            {/* Forensic Heatmap Overlay Layer */}
            {(viewMode === 'heatmap' || viewMode === 'blend') && (
              <div
                style={{
                  opacity: viewMode === 'heatmap' ? 1 : blendOpacity / 100,
                }}
                className="absolute inset-0 bg-slate-950/95 backdrop-blur-[1px] pointer-events-none transition-opacity duration-300 flex flex-col justify-between p-6 md:p-8"
              >
                {/* Simulated ELA Noise Matrix using SVG Noise Filter */}
                <svg className="absolute inset-0 w-full h-full opacity-60 mix-blend-screen" xmlns="http://www.w3.org/2000/svg">
                  <filter id="noiseFilter">
                    <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
                    <feColorMatrix type="matrix" values="0.1 0 0 0 0.1  0 0.4 0 0 0.3  0 0 0.8 0 0.6  0 0 0 1 0" />
                  </filter>
                  <rect width="100%" height="100%" filter="url(#noiseFilter)" />
                </svg>

                {/* Heatmap overlay UI labels */}
                <div className="relative z-10 flex justify-between items-start text-medical-cyan text-xs font-mono">
                  <div className="bg-slate-900/90 px-2.5 py-1 rounded border border-medical-500/40">
                    ELA NOISE FREQUENCY SPECTRUM: 0.842 MHz
                  </div>
                  <div className="bg-slate-900/90 px-2.5 py-1 rounded border border-slate-700 text-slate-300">
                    COLOR MAP: JET (BLUE=UNIFORM, AMBER=IRREGULAR)
                  </div>
                </div>

                {/* Simulated Anomaly Bounding Box on Row 2 (OT Consumables) */}
                <div className="relative z-10 my-auto">
                  <div className="relative mx-auto w-11/12 h-16 border-2 border-dashed border-amber-400 bg-amber-500/20 rounded-lg p-2.5 shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
                      <div className="text-amber-200 text-xs font-mono font-bold">
                        ANOMALOUS COMPRESSION GRADIENT DETECTED [ROI: Line Item #2]
                      </div>
                    </div>
                    <div className="bg-amber-950/90 border border-amber-400/80 text-amber-300 text-[11px] font-mono px-2 py-0.5 rounded">
                      Δ Quantization = +34.2%
                    </div>
                  </div>
                </div>

                {/* Legend at bottom of Heatmap */}
                <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-slate-300 bg-slate-900/90 p-2 rounded border border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-blue-600 inline-block" />
                    <span>Uniform Baseline</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
                    <span>Standard Quantization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" />
                    <span>Localized Density Delta</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block" />
                    <span>Spliced Artifact</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: CGHS Tariff Benchmark Comparator */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-card space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-brand-600" />
              CGHS Official Tariff Benchmark Comparator
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Audits hospital procedure line items against Central Government Health Scheme (CGHS) Gazette rates
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">City Schedule:</span>
            <div className="inline-flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
              {['Bengaluru', 'Delhi-NCR', 'Mumbai'].map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => setSelectedMetro(city)}
                  className={`px-3 py-1 rounded-md transition-all ${
                    selectedMetro === city
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {city} (Tier 1)
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Benchmark Visual Comparator Bars */}
        <div className="space-y-4">
          {benchmarkItems.map((item) => {
            const maxVal = Math.max(item.hospitalCharge, item.cghsBenchmark) * 1.15;
            const billedWidth = (item.hospitalCharge / maxVal) * 100;
            const cghsWidth = (item.cghsBenchmark / maxVal) * 100;
            const deltaInr = item.hospitalCharge - item.cghsBenchmark;

            return (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors bg-slate-50/50 space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{item.procedure}</span>
                      <span className="text-[11px] font-medium text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{item.notes}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                        item.severity === 'HIGH'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : item.severity === 'MEDIUM'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      +{item.variancePct.toFixed(1)}% Above Tariff
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-700">
                      Delta: +{formatInr(deltaInr)}
                    </span>
                  </div>
                </div>

                {/* Comparative Horizontal Bars */}
                <div className="space-y-1.5 pt-1">
                  {/* Hospital Billed Bar */}
                  <div className="flex items-center gap-3 text-xs">
                    <span className="w-28 text-slate-600 font-medium truncate">Hospital Billed:</span>
                    <div className="flex-1 h-5 bg-slate-200 rounded-full overflow-hidden relative">
                      <div
                        style={{ width: `${billedWidth}%` }}
                        className="h-full bg-amber-500 rounded-full flex items-center justify-end pr-2 transition-all duration-700"
                      >
                        <span className="text-[11px] font-bold text-white leading-none font-financial">
                          {formatInr(item.hospitalCharge)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CGHS Benchmark Bar */}
                  <div className="flex items-center gap-3 text-xs">
                    <span className="w-28 text-medical-700 font-semibold truncate">CGHS Official:</span>
                    <div className="flex-1 h-5 bg-slate-200 rounded-full overflow-hidden relative">
                      <div
                        style={{ width: `${cghsWidth}%` }}
                        className="h-full bg-medical-600 rounded-full flex items-center justify-end pr-2 transition-all duration-700"
                      >
                        <span className="text-[11px] font-bold text-white leading-none font-financial">
                          {formatInr(item.cghsBenchmark)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Statutory Admissibility Note:</strong> While hospital charges exceed CGHS reference rates, IRDAI Master Circular May 2024 mandates that insurers cannot penalize policyholders unless the insurance contract specifies explicit PPN (Preferred Provider Network) tariff schedules.
          </div>
        </div>
      </div>

      {/* Row 4: Clinical Consistency Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              Clinical Consistency & Diagnostic Matrix
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cross-references primary ICD-10 diagnostic indications with billed medical procedures & pharmaceutical items
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">Primary Diagnosis:</span>
            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded border border-slate-200">
              ICD-10: K80.20 (Cholelithiasis)
            </span>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50 text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3 font-semibold">Category</th>
                <th className="py-2.5 px-3 font-semibold">Billed Item / Medical Service</th>
                <th className="py-2.5 px-3 font-semibold">Associated Diagnostic Indication</th>
                <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                <th className="py-2.5 px-3 font-semibold">Clinical Auditor Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {consistencyItems.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-medium text-slate-500 whitespace-nowrap">
                    {row.category}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    {row.item}
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                    {row.icd10}
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        row.status === 'CONSISTENT'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {row.status === 'CONSISTENT' ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <XCircle className="w-3 h-3 text-rose-600" />
                      )}
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-xs text-slate-600 leading-relaxed">
                    {row.rationale}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
