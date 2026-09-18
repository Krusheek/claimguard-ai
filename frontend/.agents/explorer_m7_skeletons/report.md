# Milestone 7: Skeletons & Loaders Modernization Report

**Author:** `explorer_m7_skeletons`  
**Date:** 2026-09-18  
**Scope:** `c:\Users\krusheek\Desktop\SIH\claimguard-ai\frontend`  
**Target:** Eliminate all 6 legacy `animate-spin` loaders and elevate `Skeletons.jsx` with enterprise clinical shimmer and radar HUD architecture.

---

## Executive Summary

As part of the production readiness elevation for ClaimGuard AI, an exhaustive code audit was conducted to replace all legacy spinning loaders (`animate-spin`) with modern, hardware-accelerated clinical beacons, radar HUDs, and pulsing skeleton screens.

Legacy spinning loaders communicate a dated, generic web template feel that diminishes user trust in high-stakes healthcare insurance forensics (e.g. IRDAI circular compliance, CGHS benchmark adjudication, and Insurance Act § 45 investigations). By replacing these 6 spinning loaders with purpose-built clinical indicators (concentric sonar waves, laser scan beams, dual-ring pulsing beacons, and smooth easing rotations) and enhancing `Skeletons.jsx` with specialized layout placeholders, the interface achieves the polished aesthetic of top-tier enterprise platforms (Stripe, Linear, Palantir).

### Master Inventory of Legacy Loaders

| # | File Path | Line(s) | Legacy Element (`animate-spin`) | Modern Replacement |
|---|---|---|---|---|
| **1** | `src/pages/Analysis.jsx` | 174 & 197 | 96px circular spinning border (`w-24 h-24`) + small checklist spinner (`w-4 h-4`) | **Concentric Clinical Auditor Scanner HUD** with multi-layer sonar waves, crosshairs, glowing sensor core, and **Dual-Ring Pulsing Status Beacon** |
| **2** | `src/components/upload/DocumentCard.jsx` | 167 | 12px spinning circle in extracting badge | **Pulsing Clinical Shimmer Pill** with micro beacon + horizontal laser scan beam across the card bottom |
| **3** | `src/components/upload/ReadinessCheck.jsx` | 400 | Spinning `Activity` icon inside CTA button | **High-Contrast Progress Beacon** with glowing teal pulse ring and ambient button shimmer beam |
| **4** | `src/components/analysis/AuditTimeline.jsx` | 162 | Spinning `ShieldCheck` icon on verify button | **Cryptographic Verification Beacon** with laser hash scanner beam and monospace status feedback |
| **5** | `src/components/common/StatusBadge.jsx` | 89 | Spinning `Activity` icon for active states | **Soft Clinical Pulsing Beacon** with dual-ring `animate-ping` core |
| **6** | `src/pages/Dashboard.jsx` | 163 | Spinning `RefreshCw` icon on dashboard refresh | **Smooth Rotate Transition** (`transition-transform duration-700 ease-in-out` with hover micro-rotation) |
| **7** | `src/components/common/Skeletons.jsx` | 1-86 | Basic static shimmers without specialized drawer/timeline coverage | **Enhanced Pulsing Shimmer Suite** with `animate-pulse-slow`, `AuditorScannerHUD`, `PulsingBeacon`, `ShimmerBar`, `ClaimDrawerSkeleton`, and `TimelineSkeleton` |

---

## 1. Analysis.jsx: Clinical Auditor Scanner HUD & Checklist Beacon

### Context & Deficiencies
In `src/pages/Analysis.jsx` lines 172-176 and 197, the loading state currently renders:
1. A giant 96px circular spinner: `<div className="absolute inset-0 border-4 border-brand-600 rounded-full border-t-transparent animate-spin" />` with an Activity icon inside.
2. In the 4-step analysis pipeline checklist, step 3 renders a tiny 16px spinning border: `<div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />`.

### Design Specification: Clinical Auditor Scanner HUD
- **Concentric Sonar Waves**: Outer pinging ring (`bg-sky-500/10 animate-ping`) expanding outwards at 2.8s intervals.
- **Precision Reticle Crosshairs**: Subtle gradient crosshairs simulating an optical targeting reticle.
- **Secondary Radar Reticle**: Concentric dashed ring (`border border-dashed border-sky-300/60 animate-pulse`) with subtle breathing opacity.
- **Inner Sensor Core**: Rounded-2xl gradient badge (`bg-gradient-to-br from-sky-50 via-white to-teal-50 border border-sky-200`) housing the clinical `Activity` or `ShieldCheck` icon, flanked by an active emerald live beacon dot.
- **Pipeline Checklist Step**: Replace spinning circle with a dual-ring pulsing beacon (`h-4 w-4` with `animate-ping bg-brand-400 opacity-70` + inner solid core `bg-brand-600`).

### Exact Implementation Diff

```diff
--- a/src/pages/Analysis.jsx
+++ b/src/pages/Analysis.jsx
@@ -171,11 +171,28 @@ export default function Analysis() {
     return (
       <div className="max-w-5xl mx-auto space-y-8 py-12 text-center">
-        <div className="relative w-24 h-24 mx-auto">
-          <div className="absolute inset-0 border-4 border-sky-100 rounded-full" />
-          <div className="absolute inset-0 border-4 border-brand-600 rounded-full border-t-transparent animate-spin" />
-          <Activity className="w-10 h-10 text-brand-600 absolute inset-0 m-auto" />
-        </div>
+        {/* Clinical Auditor Scanner HUD */}
+        <div className="relative flex items-center justify-center mx-auto my-2 w-32 h-32 select-none">
+          {/* Outer sonar pulse wave */}
+          <div className="absolute inset-0 rounded-full bg-sky-500/10 animate-ping pointer-events-none" style={{ animationDuration: '2.8s' }} />
+          {/* Outer concentric radar boundary */}
+          <div className="absolute -inset-2 rounded-full border border-sky-400/20 animate-pulse pointer-events-none" />
+          {/* Reticle dashed ring */}
+          <div className="absolute inset-1 rounded-full border border-dashed border-sky-300/60 animate-pulse" />
+          {/* Precision reticle crosshairs */}
+          <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-sky-300/40 to-transparent" />
+          <div className="absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-transparent via-sky-300/40 to-transparent" />
+          {/* Central sensor core */}
+          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-50 via-white to-teal-50 border border-sky-200 shadow-diffused flex items-center justify-center">
+            <div className="absolute inset-0 rounded-2xl bg-sky-500/10 animate-pulse" />
+            <Activity className="w-8 h-8 text-brand-600 relative z-10 drop-shadow-sm" />
+            <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
+              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
+              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
+            </span>
+          </div>
+        </div>
+
         <div>
           <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
             Auditing Claim <span className="font-financial text-brand-600">{claimId}</span>
@@ -194,7 +211,10 @@ export default function Analysis() {
           </div>
           <div className="flex items-center gap-3 text-xs font-semibold text-brand-600">
-            <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
+            <div className="relative flex h-4 w-4 items-center justify-center flex-shrink-0">
+              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-70" />
+              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-600" />
+            </div>
             <span>Digital Forensics & CGHS Benchmark Comparator</span>
           </div>
           <div className="flex items-center gap-3 text-xs font-semibold text-slate-400">
```

---

## 2. DocumentCard.jsx: Pulsing Clinical Shimmer

### Context & Deficiencies
In `src/components/upload/DocumentCard.jsx` lines 165-170, when a document is in `isUploading` / OCR extraction state, it renders:
`<div className="w-3 h-3 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />` inside the status pill.

### Design Specification: In-Card Clinical Shimmer
- Replace the tiny spinning ring with a dual-ring **Pulsing Clinical Shimmer Beacon** (`relative flex h-2 w-2` with `animate-ping bg-sky-400` + core `bg-sky-600`).
- Add a micro clinical shimmer gauge (`w-8 h-1 rounded-full skeleton-shimmer`) right after the label.
- Add an active OCR laser scanning beam traversing the bottom edge of the document card during extraction (`absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-sky-400 via-teal-400 to-sky-400 animate-[shimmer_1.5s_infinite]`).
- Ensure root card has `relative overflow-hidden` so the laser scan beam is neatly clipped to the card's rounded corners.

### Exact Implementation Diff

```diff
--- a/src/components/upload/DocumentCard.jsx
+++ b/src/components/upload/DocumentCard.jsx
@@ -142,7 +142,7 @@ export default function DocumentCard({
   const format = getFormatBadge();
 
   return (
-    <div className="card-enterprise card-enterprise-hover p-4 border-slate-200 bg-white transition-all duration-200">
+    <div className="card-enterprise card-enterprise-hover p-4 border-slate-200 bg-white transition-all duration-200 relative overflow-hidden">
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
         {/* Left: Emblem & Details */}
         <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
@@ -163,9 +163,13 @@ export default function DocumentCard({
                 </span>
               )}
               {isUploading && (
-                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200 animate-pulse">
-                  <div className="w-3 h-3 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
-                  Extracting...
+                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-sky-700 bg-sky-50/90 px-2.5 py-0.5 rounded-md border border-sky-200 shadow-xs">
+                  <span className="relative flex h-2 w-2 flex-shrink-0">
+                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
+                    <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-600" />
+                  </span>
+                  <span>Extracting...</span>
+                  <span className="inline-block w-8 h-1 rounded-full skeleton-shimmer ml-0.5" />
                 </span>
               )}
               {isError && (
@@ -248,6 +252,13 @@ export default function DocumentCard({
             className="hidden"
             accept=".pdf,.jpg,.jpeg,.png,.tiff,.tif"
             onChange={handleFileInputChange}
           />
         </div>
       </div>
+
+      {/* Active OCR scanning laser bar */}
+      {isUploading && (
+        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-slate-100 overflow-hidden">
+          <div className="h-full bg-gradient-to-r from-sky-400 via-teal-400 to-sky-400 animate-[shimmer_1.5s_infinite] w-full" />
+        </div>
+      )}
     </div>
   );
 }
```

---

## 3. ReadinessCheck.jsx: Pulsing Progress Beacon

### Context & Deficiencies
In `src/components/upload/ReadinessCheck.jsx` line 400, when the user clicks "Run Claim Forensics & Audit", the button enters `isAnalyzing` mode and renders `<Activity className="w-5 h-5 animate-spin text-white" />`. Spinning an EKG cardiac pulse waveform defies medical visual conventions and introduces visual jitter into the primary action button.

### Design Specification: High-Contrast Progress Beacon
- Replace spinning `Activity` with a dual-layer **Pulsing Progress Beacon**:
  - Outer beacon: `animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-200 opacity-80`
  - Core sensor dot: `relative inline-flex rounded-full h-2.5 w-2.5 bg-white shadow-sm`
- Add an ambient scanning shimmer beam traversing the button surface (`absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-[shimmer_2s_infinite] pointer-events-none`).
- Button wrapper requires `relative overflow-hidden` for crisp containment.

### Exact Implementation Diff

```diff
--- a/src/components/upload/ReadinessCheck.jsx
+++ b/src/components/upload/ReadinessCheck.jsx
@@ -389,17 +389,21 @@ export default function ReadinessCheck({
           type="button"
           onClick={onRunAudit}
           disabled={!canAnalyze || isAnalyzing}
-          className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm shadow-md transition-all duration-200 flex items-center justify-center gap-2.5 ${
+          className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm shadow-md transition-all duration-200 flex items-center justify-center gap-2.5 relative overflow-hidden ${
             canAnalyze && !isAnalyzing
               ? 'bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white shadow-sky-600/20 hover:shadow-lg cursor-pointer active:scale-[0.98]'
               : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300/60 shadow-none'
           }`}
         >
           {isAnalyzing ? (
             <>
-              <Activity className="w-5 h-5 animate-spin text-white" />
-              <span>Executing Forensic Pipeline...</span>
+              <div className="relative flex h-4 w-4 items-center justify-center flex-shrink-0">
+                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-200 opacity-80" />
+                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white shadow-sm" />
+              </div>
+              <span className="tracking-wide font-semibold">Executing Forensic Pipeline...</span>
+              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-[shimmer_2s_infinite] pointer-events-none" />
             </>
           ) : canAnalyze ? (
             <>
```

---

## 4. AuditTimeline.jsx: Cryptographic Verification Beacon

### Context & Deficiencies
In `src/components/analysis/AuditTimeline.jsx` line 162, the top banner's "Verify Hash Chain" button executes cryptographic parent-hash verification across the ledger blocks. During verification, it renders:
`<ShieldCheck className={`w-4 h-4 ${isVerifying ? 'animate-spin' : ''}`} />`.
Spinning a security shield icon creates an incongruous pinwheel effect in a FIPS 180-4 compliant cryptographic audit interface.

### Design Specification: Cryptographic Verification Beacon & Laser Scanner
- Keep the `ShieldCheck` icon steady when idle.
- When `isVerifying` is active:
  - Display a dedicated **Cryptographic Verification Beacon**: dual-ring emerald ping (`animate-ping bg-emerald-300 opacity-75` + inner core `bg-emerald-100`).
  - Render a laser hash scanner sweep beam traversing the button (`bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_1.5s_infinite]`).
  - Display "Verifying Block Hashes..." in monospace formatting (`font-mono tracking-tight`).

### Exact Implementation Diff

```diff
--- a/src/components/analysis/AuditTimeline.jsx
+++ b/src/components/analysis/AuditTimeline.jsx
@@ -157,10 +157,21 @@ export default function AuditTimeline({ claimId = 'CLM-84920' }) {
             <button
               type="button"
               onClick={handleVerifyChain}
               disabled={isVerifying}
-              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
+              className="relative flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-80 overflow-hidden"
             >
-              <ShieldCheck className={`w-4 h-4 ${isVerifying ? 'animate-spin' : ''}`} />
-              {isVerifying ? 'Verifying Block Hashes...' : 'Verify Hash Chain'}
+              {isVerifying ? (
+                <>
+                  <div className="relative flex h-3.5 w-3.5 items-center justify-center flex-shrink-0">
+                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
+                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-100" />
+                  </div>
+                  <span className="font-mono tracking-tight">Verifying Block Hashes...</span>
+                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_1.5s_infinite] pointer-events-none" />
+                </>
+              ) : (
+                <>
+                  <ShieldCheck className="w-4 h-4 text-emerald-100" />
+                  <span>Verify Hash Chain</span>
+                </>
+              )}
             </button>
```

---

## 5. StatusBadge.jsx: Soft Clinical Pulsing Beacon & Test Compatibility

### Context & Deficiencies
In `src/components/common/StatusBadge.jsx` lines 88-92:
```jsx
      {showIcon && (
        normStatus === 'ANALYZING' || normStatus === 'RUNNING' || normStatus === 'EXTRACTING' || normStatus === 'PROCESSING' ? (
          <Activity className="w-3 h-3 animate-spin text-sky-600" />
        ) : (
          <IconComponent className="w-3.5 h-3.5 flex-shrink-0" />
        )
      )}
```
Spinning an Activity icon inside small table cells and headers causes continuous optical distortion and distraction.

### Design Specification: Soft Pulsing Beacon
- Replace spinning `Activity` with a sleek dual-ring clinical pulse beacon:
  - Container: `relative flex h-2 w-2 flex-shrink-0`
  - Outer wave: `animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75`
  - Core sensor dot: `relative inline-flex rounded-full h-2 w-2 bg-sky-600`

### Critical Contract Test Consideration
In `tests/component-harness.jsx` line 99:
```javascript
  test('StatusBadge: maps running/analyzing statuses to animated sky tokens', () => {
    const runStatuses = ['ANALYZING', 'RUNNING', 'EXTRACTING', 'PROCESSING'];
    for (const st of runStatuses) {
      const html = renderToStaticMarkup(<StatusBadge status={st} />);
      if (!html.includes('bg-sky-50') || !html.includes('animate-spin')) {
        throw new Error(`Expected sky classes and spinning icon for running status ${st}`);
      }
    }
  });
```
When `StatusBadge.jsx` is updated to eliminate `animate-spin`, `tests/component-harness.jsx` line 99 must be updated in tandem to assert the presence of `animate-ping` (the pulsing beacon) so the entire test runner passes with 100% success. Both diffs are provided below.

### Exact Implementation Diffs

#### A. `src/components/common/StatusBadge.jsx`
```diff
--- a/src/components/common/StatusBadge.jsx
+++ b/src/components/common/StatusBadge.jsx
@@ -86,9 +86,12 @@ export default function StatusBadge({
     >
       {showIcon && (
         normStatus === 'ANALYZING' || normStatus === 'RUNNING' || normStatus === 'EXTRACTING' || normStatus === 'PROCESSING' ? (
-          <Activity className="w-3 h-3 animate-spin text-sky-600" />
+          <span className="relative flex h-2 w-2 flex-shrink-0" aria-label="Processing indicator">
+            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
+            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-600" />
+          </span>
         ) : (
           <IconComponent className="w-3.5 h-3.5 flex-shrink-0" />
         )
       )}
       <span>{style.label}</span>
```

#### B. Companion Test Update: `tests/component-harness.jsx`
```diff
--- a/tests/component-harness.jsx
+++ b/tests/component-harness.jsx
@@ -96,8 +96,8 @@ export async function runComponentTests() {
     const runStatuses = ['ANALYZING', 'RUNNING', 'EXTRACTING', 'PROCESSING'];
     for (const st of runStatuses) {
       const html = renderToStaticMarkup(<StatusBadge status={st} />);
-      if (!html.includes('bg-sky-50') || !html.includes('animate-spin')) {
-        throw new Error(`Expected sky classes and spinning icon for running status ${st}`);
+      if (!html.includes('bg-sky-50') || (!html.includes('animate-ping') && !html.includes('animate-spin'))) {
+        throw new Error(`Expected sky classes and pulsing beacon for running status ${st}`);
       }
     }
   });
```

---

## 6. Dashboard.jsx: Smooth Rotate Transition on Refresh

### Context & Deficiencies
In `src/pages/Dashboard.jsx` lines 160-165:
```jsx
<button
  type="button"
  onClick={() => loadData(true)}
  disabled={isRefreshing}
  className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
>
  <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin text-brand-600' : ''}`} />
  <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
</button>
```
Using continuous `animate-spin` on the dashboard refresh button feels uncalibrated.

### Design Specification: Smooth Rotate Transition
- Replace `animate-spin` with a controlled `transition-transform duration-700 ease-in-out`.
- When `isRefreshing` is active, apply `rotate-180 text-brand-600`.
- When idle, apply `rotate-0` with an intuitive hover micro-interaction `group-hover:rotate-45`.

### Exact Implementation Diff

```diff
--- a/src/pages/Dashboard.jsx
+++ b/src/pages/Dashboard.jsx
@@ -158,9 +158,13 @@ export default function Dashboard() {
           <button
             type="button"
             onClick={() => loadData(true)}
             disabled={isRefreshing}
-            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
+            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 group"
           >
-            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin text-brand-600' : ''}`} />
+            <RefreshCw
+              className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-700 ease-in-out ${
+                isRefreshing ? 'rotate-180 text-brand-600' : 'group-hover:rotate-45'
+              }`}
+            />
             <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
           </button>
```

---

## 7. Skeletons.jsx: Enterprise Pulsing Shimmer Suite Enhancement

### Context & Contract Requirements
`src/components/common/Skeletons.jsx` currently exports 4 base components:
1. `SkeletonPulse`: Basic rounded shimmer box.
2. `MetricCardSkeleton`: Basic KPI card.
3. `TableSkeleton`: Basic table.
4. `AnalysisSkeleton`: Basic analysis screen.

Contract test assertions in `tests/component-harness.jsx` require:
- `SkeletonPulse` must output `skeleton-shimmer` class.
- `MetricCardSkeleton` must output `card-enterprise` and `skeleton-shimmer`.
- `TableSkeleton` must output `card-enterprise` and gracefully handle default parameters, custom parameters, and `rows=0, cols=0`.
- `AnalysisSkeleton` must output `card-enterprise` and `max-w-6xl`.

### Modernization Enhancements Added:
1. **Pulsing Breathing Shimmer**: Added `animate-pulse-slow` to `SkeletonPulse` alongside `skeleton-shimmer` for multi-frequency biological breathing effect.
2. **`PulsingBeacon` Component**: Reusable clinical status beacon supporting color themes (`sky`, `emerald`, `amber`, `rose`, `teal`, `brand`) and sizes (`sm`, `md`, `lg`).
3. **`ShimmerBar` Component**: Horizontal scanning laser bar for progress and table headers.
4. **`AuditorScannerHUD` Component**: Reusable clinical radar HUD with concentric sonar waves and reticle crosshairs.
5. **`ClaimDrawerSkeleton` Component**: Dedicated skeleton for the Milestone 8 contextual slide-over drawer (`ClaimInspectionDrawer`), fulfilling the requirement in `PROJECT.md` line 43.
6. **`TimelineSkeleton` Component**: Dedicated skeleton for the cryptographic audit trail log blocks.
7. **Enhanced `TableSkeleton` & `AnalysisSkeleton`**: Upgraded layout hierarchy with realistic filter tabs, search bars, pagination controls, and 3 financial delta KPI cards.

### Exact Enhanced Code for `src/components/common/Skeletons.jsx`

```jsx
/**
 * src/components/common/Skeletons.jsx
 * Enterprise Pulsing Skeleton Shimmers & Clinical HUD Loaders
 * Milestone 7 Modernization: Hardware-accelerated shimmer waves,
 * clinical radar beacons, and high-fidelity layout placeholders.
 */

import React from 'react';

/**
 * Base Shimmer Element with slow ambient breathing pulse
 */
export function SkeletonPulse({ className = '' }) {
  return (
    <div className={`skeleton-shimmer animate-pulse-slow rounded ${className}`} />
  );
}

/**
 * Reusable Clinical Pulsing Beacon (Double Ring)
 */
export function PulsingBeacon({ color = 'sky', size = 'md', className = '' }) {
  const colorMap = {
    sky: { ping: 'bg-sky-400', core: 'bg-sky-600' },
    brand: { ping: 'bg-brand-400', core: 'bg-brand-600' },
    emerald: { ping: 'bg-emerald-400', core: 'bg-emerald-600' },
    amber: { ping: 'bg-amber-400', core: 'bg-amber-600' },
    rose: { ping: 'bg-rose-400', core: 'bg-rose-600' },
    teal: { ping: 'bg-teal-400', core: 'bg-teal-600' },
  };

  const sizeMap = {
    sm: { container: 'h-2 w-2', core: 'h-1.5 w-1.5' },
    md: { container: 'h-2.5 w-2.5', core: 'h-2 w-2' },
    lg: { container: 'h-3.5 w-3.5', core: 'h-2.5 w-2.5' },
  };

  const c = colorMap[color] || colorMap.sky;
  const s = sizeMap[size] || sizeMap.md;

  return (
    <span className={`relative inline-flex items-center justify-center ${s.container} flex-shrink-0 ${className}`}>
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${c.ping} opacity-75`} />
      <span className={`relative inline-flex rounded-full ${s.core} ${c.core}`} />
    </span>
  );
}

/**
 * Horizontal Scanning Laser Shimmer Bar
 */
export function ShimmerBar({ className = '' }) {
  return (
    <div className={`h-1 w-full bg-slate-100 overflow-hidden rounded-full ${className}`}>
      <div className="h-full w-full bg-gradient-to-r from-transparent via-sky-400 to-transparent animate-[shimmer_1.6s_infinite]" />
    </div>
  );
}

/**
 * High-Tech Concentric Auditor Scanner HUD
 */
export function AuditorScannerHUD({ title = 'Auditing Claim', claimId = '', subtitle = '' }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-5 py-6 select-none">
      {/* Concentric Radar HUD */}
      <div className="relative flex items-center justify-center w-28 h-28">
        {/* Outward Sonar Wave */}
        <div className="absolute inset-0 rounded-full bg-sky-500/10 animate-ping pointer-events-none" style={{ animationDuration: '2.6s' }} />
        
        {/* Secondary Concentric Ring */}
        <div className="absolute -inset-2 rounded-full border border-sky-400/20 animate-pulse pointer-events-none" />
        
        {/* Reticle Hash Ring */}
        <div className="absolute inset-1 rounded-full border border-dashed border-sky-300/50 animate-pulse" />
        
        {/* Precision Crosshairs */}
        <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-sky-300/35 to-transparent" />
        <div className="absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-transparent via-sky-300/35 to-transparent" />
        
        {/* Central Clinical Sensor Core */}
        <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-50 via-white to-teal-50 border border-sky-200/90 shadow-card flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-sky-500/10 animate-pulse" />
          <svg className="w-7 h-7 text-brand-600 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <PulsingBeacon color="emerald" size="sm" className="absolute top-1 right-1" />
        </div>
      </div>

      {/* Header Info */}
      <div className="text-center max-w-lg">
        <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center justify-center gap-2">
          <span>{title}</span>
          {claimId && <span className="font-mono text-brand-600 text-lg">{claimId}</span>}
        </h3>
        {subtitle && <p className="text-slate-500 mt-1.5 text-xs leading-relaxed">{subtitle}</p>}
      </div>
    </div>
  );
}

/**
 * Metric Card Skeleton with Sparkline & Elevation
 */
export function MetricCardSkeleton() {
  return (
    <div className="card-enterprise p-6 flex flex-col justify-between h-36 border-slate-200/80 shadow-card">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <SkeletonPulse className="h-3.5 w-24" />
          <SkeletonPulse className="h-7 w-36" />
        </div>
        <SkeletonPulse className="h-12 w-12 rounded-xl" />
      </div>
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SkeletonPulse className="h-4 w-12 rounded-full" />
          <SkeletonPulse className="h-3.5 w-20" />
        </div>
        <SkeletonPulse className="h-3.5 w-16" />
      </div>
    </div>
  );
}

/**
 * Table Skeleton with Header Toolbar, Filter Tabs & Row Skeletons
 */
export function TableSkeleton({ rows = 6, cols = 6 }) {
  return (
    <div className="card-enterprise overflow-hidden border-slate-200/90 shadow-card">
      {/* Table Toolbar Skeleton */}
      <div className="p-5 border-b border-slate-200/80 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <SkeletonPulse className="h-5 w-36" />
            <SkeletonPulse className="h-4 w-16 rounded-full" />
          </div>
          <SkeletonPulse className="h-3.5 w-64" />
        </div>
        <div className="flex items-center gap-2.5">
          <SkeletonPulse className="h-8 w-48 rounded-lg" />
          <SkeletonPulse className="h-8 w-20 rounded-lg" />
        </div>
      </div>

      {/* Filter Tabs Bar Skeleton */}
      <div className="px-5 py-3 border-b border-slate-100 flex gap-2 bg-slate-50/50">
        <SkeletonPulse className="h-7 w-16 rounded-lg" />
        <SkeletonPulse className="h-7 w-24 rounded-lg" />
        <SkeletonPulse className="h-7 w-24 rounded-lg" />
        <SkeletonPulse className="h-7 w-20 rounded-lg" />
      </div>

      {/* Table Head & Body */}
      <div className="divide-y divide-slate-100">
        <div className="px-6 py-3 bg-slate-50/80 flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <SkeletonPulse key={i} className="h-4 flex-1" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="px-6 py-4 flex items-center gap-4">
            <SkeletonPulse className="h-4 w-24" />
            <SkeletonPulse className="h-4 flex-1" />
            <SkeletonPulse className="h-6 w-20 rounded-full" />
            <SkeletonPulse className="h-4 w-16" />
            <SkeletonPulse className="h-4 w-28" />
            <SkeletonPulse className="h-4 w-20 ml-auto" />
          </div>
        ))}
      </div>

      {/* Pagination Footer Skeleton */}
      {rows > 0 && (
        <div className="px-6 py-3.5 border-t border-slate-200/80 bg-slate-50/60 flex items-center justify-between">
          <SkeletonPulse className="h-4 w-40" />
          <div className="flex items-center gap-2">
            <SkeletonPulse className="h-8 w-8 rounded-lg" />
            <SkeletonPulse className="h-8 w-8 rounded-lg" />
            <SkeletonPulse className="h-8 w-8 rounded-lg" />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Analysis Page Skeleton with 3 Financial Delta Cards, Tab Bar & Verdict Items
 */
export function AnalysisSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner Skeleton */}
      <div className="card-enterprise p-6 space-y-4 border-slate-200/90 shadow-card">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <SkeletonPulse className="h-7 w-48" />
            <SkeletonPulse className="h-6 w-24 rounded-full" />
          </div>
          <div className="flex items-center gap-2">
            <SkeletonPulse className="h-8 w-28 rounded-lg" />
            <SkeletonPulse className="h-8 w-28 rounded-lg" />
          </div>
        </div>
        <SkeletonPulse className="h-4 w-full max-w-xl" />

        {/* 3 Financial Delta KPI Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 space-y-2">
            <SkeletonPulse className="h-3.5 w-24" />
            <SkeletonPulse className="h-6 w-32" />
          </div>
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 space-y-2">
            <SkeletonPulse className="h-3.5 w-24" />
            <SkeletonPulse className="h-6 w-32" />
          </div>
          <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-100/60 space-y-2">
            <SkeletonPulse className="h-3.5 w-32" />
            <SkeletonPulse className="h-6 w-36" />
          </div>
        </div>
      </div>

      {/* Tab Navigation Pill Bar Skeleton */}
      <div className="flex gap-2 pb-1 overflow-x-auto">
        <SkeletonPulse className="h-10 w-36 rounded-xl" />
        <SkeletonPulse className="h-10 w-36 rounded-xl" />
        <SkeletonPulse className="h-10 w-36 rounded-xl" />
        <SkeletonPulse className="h-10 w-36 rounded-xl" />
      </div>

      {/* Main Analysis Content Skeleton (Verdict Cards) */}
      <div className="card-enterprise p-6 md:p-8 space-y-4 border-slate-200/90 shadow-card">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <SkeletonPulse className="h-5 w-48" />
          <SkeletonPulse className="h-4 w-28" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="space-y-2 flex-1 max-w-lg">
                <div className="flex items-center gap-2">
                  <SkeletonPulse className="h-5 w-20 rounded-full" />
                  <SkeletonPulse className="h-4 w-52" />
                </div>
                <SkeletonPulse className="h-3.5 w-80" />
              </div>
              <SkeletonPulse className="h-6 w-24 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Claim Drawer Skeleton (for Milestone 8 Contextual Slide-Over Drawer)
 */
export function ClaimDrawerSkeleton() {
  return (
    <div className="h-full flex flex-col p-6 space-y-6 bg-white select-none">
      {/* Drawer Header */}
      <div className="flex items-start justify-between pb-4 border-b border-slate-100">
        <div className="space-y-2">
          <SkeletonPulse className="h-6 w-36" />
          <SkeletonPulse className="h-4 w-48" />
        </div>
        <SkeletonPulse className="h-8 w-8 rounded-lg" />
      </div>

      {/* Tripartite Document Chips */}
      <div className="space-y-2">
        <SkeletonPulse className="h-3.5 w-28" />
        <div className="grid grid-cols-3 gap-2">
          <SkeletonPulse className="h-12 rounded-xl" />
          <SkeletonPulse className="h-12 rounded-xl" />
          <SkeletonPulse className="h-12 rounded-xl" />
        </div>
      </div>

      {/* Financial Recovery Card */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
        <div className="flex justify-between">
          <SkeletonPulse className="h-4 w-24" />
          <SkeletonPulse className="h-4 w-16" />
        </div>
        <SkeletonPulse className="h-7 w-36" />
        <SkeletonPulse className="h-3.5 w-full" />
      </div>

      {/* Forensics Checklist */}
      <div className="space-y-3 pt-2">
        <SkeletonPulse className="h-4 w-32" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <SkeletonPulse className="h-4 w-4 rounded-full flex-shrink-0" />
            <SkeletonPulse className="h-3.5 flex-1" />
          </div>
        ))}
      </div>

      {/* Bottom CTA Button */}
      <div className="mt-auto pt-4 border-t border-slate-100">
        <SkeletonPulse className="h-11 w-full rounded-xl" />
      </div>
    </div>
  );
}

/**
 * Timeline / Cryptographic Audit Trail Skeleton
 */
export function TimelineSkeleton({ events = 4 }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: events }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="flex flex-col items-center">
            <SkeletonPulse className="w-8 h-8 rounded-full flex-shrink-0" />
            {i < events - 1 && <div className="w-0.5 h-16 bg-slate-200 mt-2" />}
          </div>
          <div className="flex-1 card-enterprise p-4 space-y-2">
            <div className="flex justify-between">
              <SkeletonPulse className="h-4 w-40" />
              <SkeletonPulse className="h-3.5 w-24" />
            </div>
            <SkeletonPulse className="h-3.5 w-full" />
            <SkeletonPulse className="h-3 w-64" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## 8. Verification & Regression Plan

### Independent Verification Procedure
The downstream implementer can verify these updates via the following sequence:

1. **Unit & Contract Test Verification**:
   ```bash
   node tests/runner.mjs
   ```
   Must yield `Pass: 72, Fail: 0` (100% passing across all 4 tiers and component stress harness).
2. **Stress Test Verification**:
   ```bash
   node tests/run-stress-tests.mjs
   ```
   Must pass all 41 SSR render stress suites with zero errors.
3. **Circular Dependencies Audit**:
   ```bash
   node tests/check-circular-deps.mjs
   ```
   Must report `PASSED: No circular dependencies detected`.
4. **Token Resolver & CSS Compilation Audit**:
   ```bash
   npm run build
   node tests/token-resolver.test.mjs
   ```
   Vite build must bundle with zero compilation warnings or missing class tokens.
5. **Zero Spinning Loaders Grep**:
   ```bash
   # Confirm that 0 occurrences of animate-spin remain in active src/ components
   grep -rn "animate-spin" src/
   ```
   Must return 0 results.

---

*Report prepared and submitted by `explorer_m7_skeletons`.*
