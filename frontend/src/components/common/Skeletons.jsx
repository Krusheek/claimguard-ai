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
