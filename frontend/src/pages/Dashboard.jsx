import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  RefreshCw,
  UploadCloud,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

import ExecutiveKpiCards from '../components/dashboard/ExecutiveKpiCards';
import DashboardCharts from '../components/dashboard/DashboardCharts';
import ClaimsTable from '../components/dashboard/ClaimsTable';
import ClaimDrawer from '../components/dashboard/ClaimDrawer';
import { MetricCardSkeleton, TableSkeleton, SkeletonPulse } from '../components/common/Skeletons';
import ErrorState from '../components/common/ErrorState';
import { getClaims, getStats } from '../services/api';

// ── Page entrance animation ─────────────────────────────────────────
const pageVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut', staggerChildren: 0.07 },
  },
};
const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [stats, setStats] = useState(null);
  const [claims, setClaims] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeStatusFilter, setActiveStatusFilter] = useState('ALL');

  // Drawer state — holds the selected claim object (or null when closed)
  const [drawerClaim, setDrawerClaim] = useState(null);

  const loadData = useCallback(async (manual = false) => {
    if (manual) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const [statsRes, claimsRes] = await Promise.all([getStats(), getClaims()]);
      setStats(statsRes);
      setClaims(claimsRes || []);
      setLastUpdated(new Date());
      if (manual) {
        toast.success('Dashboard Synchronized', {
          description: 'Executive audit metrics and claims ledger updated.',
        });
      }
    } catch (err) {
      console.error('Dashboard synchronization failure:', err);
      if (!stats) {
        setError(err?.message || 'Unable to communicate with the ClaimGuard backend API.');
      } else {
        toast.error('Synchronization Failed', {
          description: 'Displaying cached audit metrics. Check network connection.',
        });
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [stats]);

  useEffect(() => { loadData(false); }, []); // eslint-disable-line

  const handleSelectStatusFilter = (filterId) => {
    setActiveStatusFilter(filterId);
    document.getElementById('claims-table-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // ── Loading skeleton ──────────────────────────────────────────────
  if (isLoading && !stats) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center pb-2">
          <div className="space-y-2">
            <SkeletonPulse className="h-7 w-64" />
            <SkeletonPulse className="h-4 w-96" />
          </div>
          <SkeletonPulse className="h-10 w-36 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => <MetricCardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 card-enterprise p-6 h-80 flex flex-col justify-between">
            <SkeletonPulse className="h-5 w-48 mb-4" />
            <SkeletonPulse className="h-48 w-full" />
          </div>
          <div className="lg:col-span-4 card-enterprise p-6 h-80 space-y-3">
            <SkeletonPulse className="h-5 w-36" />
            {[1,2,3,4,5].map(i => <SkeletonPulse key={i} className="h-12 w-full rounded-lg" />)}
          </div>
        </div>
        <TableSkeleton rows={8} cols={7} />
      </div>
    );
  }

  if (error && !stats) {
    return (
      <ErrorState
        title="Dashboard Offline"
        message={error}
        onRetry={() => loadData(false)}
        retryLabel="Reconnect & Retry"
      />
    );
  }

  return (
    <>
      {/* ── Contextual Claim Inspection Drawer ── */}
      <ClaimDrawer claim={drawerClaim} onClose={() => setDrawerClaim(null)} />

      <motion.div
        className="space-y-6 max-w-7xl mx-auto"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ── 1. Page Header ── */}
        <motion.div
          variants={sectionVariants}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Executive Audit &amp; Adjudication Dashboard
              </h1>
              <span className="text-[11px] font-bold uppercase tracking-wider bg-medical-50 text-medical-700 px-2.5 py-0.5 rounded-full border border-medical-200">
                IRDAI Compliance Hub
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Real-time statutory adjudication, proportionate deduction analysis, and dispute recovery ledger.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              type="button"
              onClick={() => loadData(true)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 hover:scale-101 active:scale-[0.98] text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-all disabled:opacity-50 group"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-700 ease-in-out ${
                  isRefreshing ? 'rotate-180 text-brand-600' : 'group-hover:rotate-45'
                }`}
              />
              <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
            </button>
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 hover:scale-101 active:scale-[0.98] text-white rounded-lg text-xs font-bold shadow-sm transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload New Claim</span>
            </Link>
          </div>
        </motion.div>

        {/* ── 2. Priority Alert Banner ── */}
        <motion.div
          variants={sectionVariants}
          className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-brand-950 text-white border border-slate-700 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 flex-shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-slate-100">Statutory Dispute Alert: </span>
              <span className="text-slate-300">
                Multiple claims show unlawful proportionate deductions scaling down ICU, OT, and Surgeon fees.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleSelectStatusFilter('FLAGGED')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 hover:scale-101 active:scale-[0.98] text-white text-xs font-semibold rounded-lg transition-all border border-white/10 whitespace-nowrap"
          >
            <span>View Flagged Claims</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>

        {/* ── 3. Bento Row 1: 4 KPI Cards ── */}
        <motion.div variants={sectionVariants}>
          <ExecutiveKpiCards stats={stats} claims={claims} />
        </motion.div>

        {/* ── 4. Bento Row 2: Charts (8 cols) + Recent Claims Mini-Panel (4 cols) ── */}
        <motion.div
          variants={sectionVariants}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* Charts — 8 cols */}
          <div className="lg:col-span-8">
            <DashboardCharts
              claims={claims}
              stats={stats}
              onSelectStatusFilter={handleSelectStatusFilter}
            />
          </div>

          {/* Recent Claims Panel — 4 cols */}
          <div className="lg:col-span-4 card-enterprise card-enterprise-hover p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800">Recent Claims</h3>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Last {Math.min(5, claims.length)}
              </span>
            </div>
            {claims.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-xs text-slate-400 italic text-center">
                  No claims yet. Upload your first claim to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-2 flex-1 overflow-auto">
                {claims.slice(0, 5).map((claim) => (
                  <motion.button
                    key={claim.id}
                    type="button"
                    onClick={() => setDrawerClaim(claim)}
                    whileHover={{ scale: 1.01, boxShadow: '0 4px 16px rgba(15,23,42,0.06)' }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-brand-300 bg-white transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono text-slate-500 truncate">
                        {claim.id?.slice(0, 12)}…
                      </span>
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                        claim.status === 'COMPLETE'
                          ? 'bg-status-pass-bg text-status-pass-text'
                          : claim.status === 'FAILED'
                          ? 'bg-status-fail-bg text-status-fail-text'
                          : 'bg-status-warning-bg text-status-warning-text'
                      }`}>
                        {claim.status || 'PENDING'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {new Date(claim.updated_at || claim.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </p>
                  </motion.button>
                ))}
              </div>
            )}
            {claims.length > 5 && (
              <button
                type="button"
                onClick={() => document.getElementById('claims-table-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="mt-3 text-[11px] font-semibold text-brand-600 hover:text-brand-700 text-center w-full py-2 rounded-lg hover:bg-brand-50 transition-colors"
              >
                View all {claims.length} claims ↓
              </button>
            )}
          </div>
        </motion.div>

        {/* ── 5. Bento Row 3: Full Claims Data Table (12 cols) ── */}
        <motion.div variants={sectionVariants} id="claims-table-section">
          <ClaimsTable
            claims={claims}
            isLoading={isLoading}
            initialSearchQuery={initialQuery}
            activeStatusTab={activeStatusFilter}
            onTabChange={setActiveStatusFilter}
            onRefresh={() => loadData(true)}
            onRowClick={(claim) => setDrawerClaim(claim)}
          />
        </motion.div>
      </motion.div>
    </>
  );
}
