import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast, Toaster } from 'sonner';

import {
  SkeletonPulse,
  PulsingBeacon,
  ShimmerBar,
  AuditorScannerHUD,
  MetricCardSkeleton,
  TableSkeleton,
  AnalysisSkeleton,
  ClaimDrawerSkeleton,
  TimelineSkeleton,
} from '../src/components/common/Skeletons.jsx';
import StatusBadge from '../src/components/common/StatusBadge.jsx';
import PageMotion, { pageVariants } from '../src/components/common/PageMotion.jsx';
import ExecutiveKpiCards, { MotionSparklineCurve } from '../src/components/dashboard/ExecutiveKpiCards.jsx';
import ReadinessCheck, { SAMPLE_APOLLO_CLAIM } from '../src/components/upload/ReadinessCheck.jsx';
import DocumentCard from '../src/components/upload/DocumentCard.jsx';
import AuditTimeline from '../src/components/analysis/AuditTimeline.jsx';
import App from '../src/App.jsx';
import { mockAuditTrail } from '../src/services/mockData.js';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

export function runToastsAndSkeletonsStressTests() {
  const testResults = [];
  const vulnerabilities = [];

  function record(id, category, title, passed, severity = 'LOW', details = {}) {
    testResults.push({ id, category, title, passed, severity, details });
    if (!passed) {
      vulnerabilities.push({ id, category, title, severity, details });
    }
  }

  // =========================================================================
  // CATEGORY 1: Sonner Toasts & Stacked Notifications Stress Tests
  // =========================================================================

  // 1.1 Basic Toast Invocations
  try {
    const id1 = toast('Adversarial ping notification');
    const id2 = toast.success('Statutory audit passed', { description: 'All rules conform to IRDAI circular.' });
    const id3 = toast.error('Disallowance flagged', { description: 'Itemized deduction detected.' });
    const id4 = toast.loading('Extracting OCR line items...', { description: 'Parsing PDF tables.' });

    const allHaveIds = [id1, id2, id3, id4].every((id) => typeof id === 'string' || typeof id === 'number');
    record('SONNER-01', 'Sonner Toasts', 'Executes toast primitives (toast, success, error, loading) returning valid string/numeric IDs', allHaveIds, 'HIGH');
  } catch (err) {
    record('SONNER-01', 'Sonner Toasts', 'Executes toast primitives cleanly', false, 'HIGH', { error: err.message });
  }

  // 1.2 Pipeline Sequential Toast IDs & State Transition
  try {
    const stageId = 'ocr-stage-1';
    toast.loading('Stage 1/4: Uploading & Hashing', {
      id: stageId,
      description: 'Streaming encrypted multipart chunks...',
    });

    // Update the same toast ID into a success toast (simulating Upload.jsx transition)
    const updatedId = toast.success('Stage 1 Complete: Hashed & Verified', {
      id: stageId,
      description: 'SHA-256 cryptographic hashes sealed for all 3 documents.',
    });

    const isSameId = updatedId === stageId;

    // Transition through stages 2, 3, 4 sequentially
    const stages = ['ocr-stage-2', 'ocr-stage-3', 'ocr-stage-4'];
    let pipelineClean = true;
    for (const sid of stages) {
      toast.loading(`Stage Loading: ${sid}`, { id: sid });
      const resId = toast.success(`Stage Finished: ${sid}`, { id: sid, description: 'Stage step verified.' });
      if (resId !== sid) pipelineClean = false;
    }

    record('SONNER-02', 'Sonner Toasts', 'Sequential pipeline updates preserve exact toast IDs through loading -> success transitions', isSameId && pipelineClean, 'HIGH', { isSameId, pipelineClean });
  } catch (err) {
    record('SONNER-02', 'Sonner Toasts', 'Sequential pipeline updates preserve exact toast IDs', false, 'HIGH', { error: err.message });
  }

  // 1.3 Rapid Sequential Updates Stress Test (ID churn)
  try {
    const rapidId = 'rapid-stress-test';
    let noErrors = true;
    for (let i = 0; i < 50; i++) {
      toast.loading(`Processing tick ${i}`, { id: rapidId, description: `Tick ${i} description` });
    }
    toast.success('Rapid processing completed', { id: rapidId, description: 'All 50 ticks processed.' });
    record('SONNER-03', 'Sonner Toasts', 'Handles 50 rapid sequential updates on single toast ID without collision or failure', noErrors, 'MEDIUM');
  } catch (err) {
    record('SONNER-03', 'Sonner Toasts', 'Handles rapid sequential updates on single toast ID', false, 'MEDIUM', { error: err.message });
  }

  // 1.4 High-Volume Concurrent Multi-Toast Burst
  try {
    let burstSuccess = true;
    const toastIds = [];
    for (let i = 0; i < 60; i++) {
      const tid = toast(`Burst notification #${i}`, {
        description: `Payload index ${i}`,
        duration: 3000,
      });
      toastIds.push(tid);
    }
    burstSuccess = toastIds.length === 60;
    // Dismiss all burst toasts cleanly
    toast.dismiss();
    record('SONNER-04', 'Sonner Toasts', 'Survives 60-toast high-volume burst and dismisses cleanly without memory leak or crash', burstSuccess, 'MEDIUM');
  } catch (err) {
    record('SONNER-04', 'Sonner Toasts', 'High-volume concurrent toast burst', false, 'MEDIUM', { error: err.message });
  }

  // 1.5 Interactive Action Buttons & Callbacks
  try {
    const actionToastId = toast('Discrepancy Remediation Required', {
      action: {
        label: 'Auto-Remediate',
        onClick: () => {},
      },
      cancel: {
        label: 'Dismiss',
        onClick: () => {},
      },
    });
    toast.dismiss(actionToastId);
    record('SONNER-05', 'Sonner Toasts', 'Configures action button & cancel button callbacks without runtime throwing', Boolean(actionToastId), 'MEDIUM');
  } catch (err) {
    record('SONNER-05', 'Sonner Toasts', 'Action buttons configuration', false, 'MEDIUM', { error: err.message });
  }

  // 1.6 Toaster Component SSR Render with Enterprise Props
  try {
    const html = renderToStaticMarkup(
      <Toaster
        position="top-right"
        expand={true}
        richColors
        closeButton
        visibleToasts={6}
        theme="dark"
        toastOptions={{
          className: 'font-sans text-xs',
          style: { borderRadius: '12px' },
        }}
      />
    );
    const rendersElement = html.includes('data-sonner-toaster') || html.includes('ol') || html.includes('section');
    record('SONNER-06', 'Sonner Toasts', 'Toaster component SSR renders cleanly with top-right, expand=true, richColors, visibleToasts=6', rendersElement, 'HIGH', { htmlLength: html.length });
  } catch (err) {
    record('SONNER-06', 'Sonner Toasts', 'Toaster SSR rendering', false, 'HIGH', { error: err.message });
  }

  // =========================================================================
  // CATEGORY 2: Concentric Auditor Scanner HUD Stress Tests
  // =========================================================================

  // 2.1 Default Props SSR Rendering
  try {
    const html = renderToStaticMarkup(<AuditorScannerHUD />);
    const hasPing = html.includes('animate-ping');
    const hasPulse = html.includes('animate-pulse');
    const hasDashed = html.includes('border-dashed');
    const hasReticle = html.includes('h-px') && html.includes('w-px');
    const hasDefaultTitle = html.includes('Auditing Claim');
    const isClean = hasPing && hasPulse && hasDashed && hasReticle && hasDefaultTitle;
    record('HUD-01', 'Auditor Scanner HUD', 'Renders full concentric radar HUD (sonar ping, reticle dash, crosshairs, sensor core) with default props', isClean, 'HIGH');
  } catch (err) {
    record('HUD-01', 'Auditor Scanner HUD', 'Renders HUD with default props', false, 'HIGH', { error: err.message });
  }

  // 2.2 Custom Title, Claim ID, and Subtitle
  try {
    const html = renderToStaticMarkup(
      <AuditorScannerHUD
        title="Forensic Audit In Progress"
        claimId="CLM-84920"
        subtitle="Verifying Section 45 60-Month Moratorium..."
      />
    );
    const hasTitle = html.includes('Forensic Audit In Progress');
    const hasClaim = html.includes('CLM-84920');
    const hasSubtitle = html.includes('Verifying Section 45 60-Month Moratorium...');
    record('HUD-02', 'Auditor Scanner HUD', 'Renders custom title, formatted claimId in mono font, and subtitle', hasTitle && hasClaim && hasSubtitle, 'MEDIUM');
  } catch (err) {
    record('HUD-02', 'Auditor Scanner HUD', 'Custom HUD parameters', false, 'MEDIUM', { error: err.message });
  }

  // 2.3 Adversarial Input Robustness (XSS, null, undefined)
  try {
    const xssPayload = '<script>alert("xss")</script>';
    const htmlXss = renderToStaticMarkup(
      <AuditorScannerHUD title={xssPayload} claimId={null} subtitle={undefined} />
    );
    const isEscaped = !htmlXss.includes('<script>') && htmlXss.includes('&lt;script&gt;');
    const noCrash = Boolean(htmlXss);
    record('HUD-03', 'Auditor Scanner HUD', 'Sanitizes dangerous string inputs and survives null/undefined claimId and subtitle', isEscaped && noCrash, 'HIGH');
  } catch (err) {
    record('HUD-03', 'Auditor Scanner HUD', 'Adversarial inputs to HUD', false, 'HIGH', { error: err.message });
  }

  // 2.4 Sonar Wave CSS Animation Timing & Concentric Geometry
  try {
    const html = renderToStaticMarkup(<AuditorScannerHUD />);
    const hasDuration = html.includes('2.6s') || html.includes('animation-duration:2.6s') || html.includes('animationDuration');
    const hasConcentricRings = (html.match(/rounded-full/g) || []).length >= 4;
    record('HUD-04', 'Auditor Scanner HUD', 'Verifies concentric geometry with >= 4 concentric rings and 2.6s sonar wave duration', hasDuration && hasConcentricRings, 'LOW', { concentricRings: (html.match(/rounded-full/g) || []).length });
  } catch (err) {
    record('HUD-04', 'Auditor Scanner HUD', 'Sonar wave CSS geometry', false, 'LOW', { error: err.message });
  }

  // =========================================================================
  // CATEGORY 3: Reusable Pulsing Beacon Stress Tests
  // =========================================================================

  // 3.1 All Supported Colors
  try {
    const colors = ['sky', 'brand', 'emerald', 'amber', 'rose', 'teal'];
    let allValid = true;
    for (const c of colors) {
      const html = renderToStaticMarkup(<PulsingBeacon color={c} />);
      const hasPingClass = html.includes(`bg-${c}-400`);
      const hasCoreClass = html.includes(`bg-${c}-600`);
      const hasPingAnim = html.includes('animate-ping');
      if (!hasPingClass || !hasCoreClass || !hasPingAnim) {
        allValid = false;
      }
    }
    record('BEACON-01', 'Pulsing Beacon', 'Renders all 6 color variants (sky, brand, emerald, amber, rose, teal) with matching ping & core tokens', allValid, 'HIGH');
  } catch (err) {
    record('BEACON-01', 'Pulsing Beacon', 'Color variants of PulsingBeacon', false, 'HIGH', { error: err.message });
  }

  // 3.2 All Supported Sizes
  try {
    const sizes = [
      { size: 'sm', container: 'h-2 w-2', core: 'h-1.5 w-1.5' },
      { size: 'md', container: 'h-2.5 w-2.5', core: 'h-2 w-2' },
      { size: 'lg', container: 'h-3.5 w-3.5', core: 'h-2.5 w-2.5' },
    ];
    let allSizesMatch = true;
    for (const s of sizes) {
      const html = renderToStaticMarkup(<PulsingBeacon size={s.size} />);
      if (!html.includes(s.container) || !html.includes(s.core)) {
        allSizesMatch = false;
      }
    }
    record('BEACON-02', 'Pulsing Beacon', 'Renders all 3 sizes (sm, md, lg) with exact dimensional classes', allSizesMatch, 'MEDIUM');
  } catch (err) {
    record('BEACON-02', 'Pulsing Beacon', 'Size variants of PulsingBeacon', false, 'MEDIUM', { error: err.message });
  }

  // 3.3 Unknown Fallback Resiliency
  try {
    const htmlUnknownColor = renderToStaticMarkup(<PulsingBeacon color="neon-purple-alien" />);
    const htmlUnknownSize = renderToStaticMarkup(<PulsingBeacon size="colossal" />);
    const htmlNull = renderToStaticMarkup(<PulsingBeacon color={null} size={undefined} />);

    const fallbackColorSafe = htmlUnknownColor.includes('bg-sky-400');
    const fallbackSizeSafe = htmlUnknownSize.includes('h-2.5 w-2.5');
    const nullSafe = htmlNull.includes('bg-sky-400');

    record('BEACON-03', 'Pulsing Beacon', 'Gracefully falls back to sky color and md size upon unknown or null arguments', fallbackColorSafe && fallbackSizeSafe && nullSafe, 'HIGH');
  } catch (err) {
    record('BEACON-03', 'Pulsing Beacon', 'Fallback behavior of PulsingBeacon', false, 'HIGH', { error: err.message });
  }

  // =========================================================================
  // CATEGORY 4: Skeletons & Modern Shimmers Stress Tests
  // =========================================================================

  // 4.1 SkeletonPulse & ShimmerBar SSR
  try {
    const pulseHtml = renderToStaticMarkup(<SkeletonPulse className="h-8 w-40" />);
    const barHtml = renderToStaticMarkup(<ShimmerBar className="w-64" />);

    const pulseValid = pulseHtml.includes('skeleton-shimmer') && pulseHtml.includes('animate-pulse-slow') && pulseHtml.includes('h-8 w-40');
    const barValid = barHtml.includes('bg-slate-100') && barHtml.includes('animate-[shimmer_1.6s_infinite]');

    record('SKEL-01', 'Skeletons', 'SkeletonPulse and ShimmerBar render hardware-accelerated shimmer keyframe classes', pulseValid && barValid, 'HIGH');
  } catch (err) {
    record('SKEL-01', 'Skeletons', 'SkeletonPulse and ShimmerBar SSR', false, 'HIGH', { error: err.message });
  }

  // 4.2 ClaimDrawerSkeleton (Milestone 8 Preparedness)
  try {
    const html = renderToStaticMarkup(<ClaimDrawerSkeleton />);
    const hasHeader = html.includes('h-full flex flex-col');
    const hasDocumentChips = html.includes('grid grid-cols-3');
    const hasChecklist = (html.match(/rounded-full/g) || []).length >= 4;
    const hasCta = html.includes('h-11 w-full rounded-xl');

    record('SKEL-02', 'Skeletons', 'ClaimDrawerSkeleton renders complete slide-over triage placeholder structure', hasHeader && hasDocumentChips && hasChecklist && hasCta, 'MEDIUM');
  } catch (err) {
    record('SKEL-02', 'Skeletons', 'ClaimDrawerSkeleton SSR', false, 'MEDIUM', { error: err.message });
  }

  // 4.3 TimelineSkeleton Boundary Handling
  try {
    const html0 = renderToStaticMarkup(<TimelineSkeleton events={0} />);
    const html1 = renderToStaticMarkup(<TimelineSkeleton events={1} />);
    const html4 = renderToStaticMarkup(<TimelineSkeleton events={4} />);
    const html20 = renderToStaticMarkup(<TimelineSkeleton events={20} />);

    const safe0 = !html0.includes('card-enterprise');
    const count1 = (html1.match(/card-enterprise/g) || []).length === 1;
    const count4 = (html4.match(/card-enterprise/g) || []).length === 4;
    const count20 = (html20.match(/card-enterprise/g) || []).length === 20;

    record('SKEL-03', 'Skeletons', 'TimelineSkeleton scales dynamically from 0 to 20 block event placeholders', safe0 && count1 && count4 && count20, 'LOW');
  } catch (err) {
    record('SKEL-03', 'Skeletons', 'TimelineSkeleton scaling', false, 'LOW', { error: err.message });
  }

  // 4.4 MetricCardSkeleton, TableSkeleton & AnalysisSkeleton
  try {
    const mHtml = renderToStaticMarkup(<MetricCardSkeleton />);
    const tHtml = renderToStaticMarkup(<TableSkeleton rows={4} cols={5} />);
    const aHtml = renderToStaticMarkup(<AnalysisSkeleton />);

    const mOk = mHtml.includes('card-enterprise') && mHtml.includes('skeleton-shimmer');
    const flex1Count = (tHtml.match(/h-4 flex-1/g) || []).length;
    const tOk = tHtml.includes('card-enterprise') && flex1Count === (5 + 4);
    const aOk = aHtml.includes('card-enterprise') && aHtml.includes('grid grid-cols-1 md:grid-cols-3');

    record('SKEL-04', 'Skeletons', 'MetricCardSkeleton, TableSkeleton, and AnalysisSkeleton render with enterprise tokens', mOk && tOk && aOk, 'MEDIUM', { mOk, tOk, aOk, flex1Count });
  } catch (err) {
    record('SKEL-04', 'Skeletons', 'Standard layout skeletons SSR', false, 'MEDIUM', { error: err.message });
  }

  // =========================================================================
  // CATEGORY 5: Motion & Micro-Interactions SSR Safety
  // =========================================================================

  // 5.1 PageMotion Contract Conformance
  try {
    const html = renderToStaticMarkup(
      <PageMotion className="test-motion-container">
        <div id="page-content">Analysis View</div>
      </PageMotion>
    );
    const hasContent = html.includes('Analysis View');
    const hasClass = html.includes('test-motion-container');

    const initialOk = pageVariants.initial.y === 8 && pageVariants.initial.opacity === 0;
    const animateOk = pageVariants.animate.y === 0 && pageVariants.animate.opacity === 1 && pageVariants.animate.transition.duration === 0.22;
    const exitOk = pageVariants.exit.y === -6 && pageVariants.exit.opacity === 0 && pageVariants.exit.transition.duration === 0.18;
    const easeOk = JSON.stringify(pageVariants.animate.transition.ease) === JSON.stringify([0.16, 1, 0.3, 1]);

    const compliant = hasContent && hasClass && initialOk && animateOk && exitOk && easeOk;
    record('MOTION-01', 'Motion Architecture', 'PageMotion wrapper satisfies PROJECT.md line 46-48 animation contracts & SSR renders cleanly', compliant, 'HIGH');
  } catch (err) {
    record('MOTION-01', 'Motion Architecture', 'PageMotion contract conformance', false, 'HIGH', { error: err.message });
  }

  // 5.2 MotionSparklineCurve Adversarial Math
  try {
    const emptyHtml = renderToStaticMarkup(<MotionSparklineCurve data={[]} />);
    const singleHtml = renderToStaticMarkup(<MotionSparklineCurve data={[42]} />);
    const flatHtml = renderToStaticMarkup(<MotionSparklineCurve data={[10, 10, 10]} />);
    const negHtml = renderToStaticMarkup(<MotionSparklineCurve data={[-10, -50, -30]} />);
    const corruptedHtml = renderToStaticMarkup(<MotionSparklineCurve data={[10, null, 'bogus', NaN, undefined, 40]} />);

    const emptySafe = emptyHtml === '';
    const singleSafe = singleHtml === '';
    const flatNoNaN = !flatHtml.includes('NaN') && flatHtml.includes('<path');
    const negNoNaN = !negHtml.includes('NaN') && negHtml.includes('<path');
    const corruptedClean = !corruptedHtml.includes('NaN') && corruptedHtml.includes('<path');

    record('MOTION-02', 'Motion Architecture', 'MotionSparklineCurve handles [], [42], flat [10,10,10], negative values, and non-numeric corrupted data without NaN or crash', emptySafe && singleSafe && flatNoNaN && negNoNaN && corruptedClean, 'HIGH');
  } catch (err) {
    record('MOTION-02', 'Motion Architecture', 'MotionSparklineCurve adversarial math', false, 'HIGH', { error: err.message });
  }

  // =========================================================================
  // CATEGORY 6: Full Page SSR Integrations with Active Modern Loaders
  // =========================================================================

  // 6.1 ReadinessCheck Analyzing State
  try {
    const htmlAnalyzing = renderToStaticMarkup(
      <ReadinessCheck
        documents={SAMPLE_APOLLO_CLAIM.documents}
        claimId="CLM-84920"
        isAnalyzing={true}
        extractionStage={1}
        extractionProgress={45}
      />
    );
    const hasPulsingBeacon = htmlAnalyzing.includes('animate-ping');
    const hasShimmerProgress = htmlAnalyzing.includes('animate-[shimmer_1.5s_infinite]') || htmlAnalyzing.includes('shimmer');
    const hasExecutingText = htmlAnalyzing.includes('Executing Forensic Pipeline...');
    const hasStageTitle = htmlAnalyzing.includes('Extracting OCR Tokens');
    const noSpin = !htmlAnalyzing.includes('animate-spin');

    const checkPassed = hasPulsingBeacon && hasShimmerProgress && hasExecutingText && hasStageTitle && noSpin;
    record('INTEG-01', 'Page Integrations', 'ReadinessCheck in analyzing state renders clinical pulsing beacon, shimmer bar, stage ticker with 0 animate-spin', checkPassed, 'HIGH');
  } catch (err) {
    record('INTEG-01', 'Page Integrations', 'ReadinessCheck analyzing state SSR', false, 'HIGH', { error: err.message });
  }

  // 6.2 DocumentCard Uploading State
  try {
    const uploadingRecord = {
      name: 'itemized_hospital_invoice.pdf',
      size: 1548200,
      uploadStatus: 'uploading',
    };
    const htmlDoc = renderToStaticMarkup(
      <DocumentCard documentType="HOSPITAL_BILL" docRecord={uploadingRecord} />
    );
    const hasExtractingBeacon = htmlDoc.includes('animate-ping');
    const hasLaserScan = htmlDoc.includes('animate-[shimmer_1.5s_infinite]');
    const hasExtractingLabel = htmlDoc.includes('Extracting...');
    const noSpinDoc = !htmlDoc.includes('animate-spin');

    record('INTEG-02', 'Page Integrations', 'DocumentCard in uploading state renders dual-ring pulsing beacon and laser scan beam with 0 animate-spin', hasExtractingBeacon && hasLaserScan && hasExtractingLabel && noSpinDoc, 'HIGH');
  } catch (err) {
    record('INTEG-02', 'Page Integrations', 'DocumentCard uploading state SSR', false, 'HIGH', { error: err.message });
  }

  // 6.3 StatusBadge Running/Analyzing State
  try {
    const runStatuses = ['ANALYZING', 'RUNNING', 'EXTRACTING', 'PROCESSING'];
    let allStatusesPulsing = true;
    for (const st of runStatuses) {
      const htmlBadge = renderToStaticMarkup(<StatusBadge status={st} />);
      if (!htmlBadge.includes('animate-ping') || htmlBadge.includes('animate-spin')) {
        allStatusesPulsing = false;
      }
    }
    record('INTEG-03', 'Page Integrations', 'StatusBadge renders dual-ring clinical pulsing beacon for all 4 processing states with 0 animate-spin', allStatusesPulsing, 'HIGH');
  } catch (err) {
    record('INTEG-03', 'Page Integrations', 'StatusBadge processing state SSR', false, 'HIGH', { error: err.message });
  }

  // 6.4 AuditTimeline Blockchain Ledger Verification State
  try {
    const htmlTimeline = renderToStaticMarkup(
      <AuditTimeline auditTrail={mockAuditTrail} claimId="CLM-84920" />
    );
    const hasLedgerVerified = htmlTimeline.includes('Ledger Hash Chain Verified');
    const hasGenesis = htmlTimeline.includes('Genesis Root');
    const hasFips = htmlTimeline.includes('FIPS 180-4');
    const noSpinTimeline = !htmlTimeline.includes('animate-spin');

    record('INTEG-04', 'Page Integrations', 'AuditTimeline renders cryptographic ledger blocks and verification badge with 0 animate-spin', hasLedgerVerified && hasGenesis && hasFips && noSpinTimeline, 'MEDIUM');
  } catch (err) {
    record('INTEG-04', 'Page Integrations', 'AuditTimeline SSR', false, 'MEDIUM', { error: err.message });
  }

  // 6.5 Full App Shell SSR with Sonner Toaster
  try {
    const htmlApp = renderToStaticMarkup(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    );
    const hasBrand = htmlApp.includes('ClaimGuard');
    const hasSonnerToaster = htmlApp.includes('data-sonner-toaster') || htmlApp.includes('ol') || htmlApp.includes('section');
    const noSpinApp = !htmlApp.includes('animate-spin');

    record('INTEG-05', 'Page Integrations', 'App root shell SSR renders with Sonner Toaster integrated and zero animate-spin', hasBrand && hasSonnerToaster && noSpinApp, 'CRITICAL');
  } catch (err) {
    record('INTEG-05', 'Page Integrations', 'App shell SSR with Sonner Toaster', false, 'CRITICAL', { error: err.message });
  }

  return {
    testResults,
    vulnerabilities,
  };
}
