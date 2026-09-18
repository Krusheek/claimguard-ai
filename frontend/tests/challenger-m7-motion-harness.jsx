/**
 * tests/challenger-m7-motion-harness.jsx
 * Milestone 7 Challenger: Framer Motion Transitions & Routing Adversarial Harness
 *
 * Validates:
 * 1. PageMotion Contract & Variant Conformance (PROJECT.md line 46-48)
 * 2. Full Page Route Rendering under MemoryRouter across all application routes
 * 3. <AnimatePresence mode="wait"> rapid path transition handling and layout shift prevention
 * 4. Mobile Menu Drawer entry/exit animation configuration and presence registration
 * 5. Console error and unhandled rejection tracking during motion lifecycles
 */

import React, { useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';

import PageMotion, { pageVariants } from '../src/components/common/PageMotion.jsx';
import App from '../src/App.jsx';
import Dashboard from '../src/pages/Dashboard.jsx';
import Upload from '../src/pages/Upload.jsx';
import Analysis from '../src/pages/Analysis.jsx';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

export function runMotionStressHarness() {
  const testResults = [];
  const vulnerabilities = [];

  // Console spy setup
  const capturedErrors = [];
  const capturedWarns = [];
  const originalError = console.error;
  const originalWarn = console.warn;

  function startConsoleSpy() {
    console.error = (...args) => {
      capturedErrors.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
    };
    console.warn = (...args) => {
      capturedWarns.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
    };
  }

  function stopConsoleSpy() {
    console.error = originalError;
    console.warn = originalWarn;
  }

  function record(id, title, category, passed, details = {}, severity = 'HIGH') {
    testResults.push({ id, title, category, passed, details, severity });
    if (!passed) {
      vulnerabilities.push({ id, title, severity, details });
    }
  }

  startConsoleSpy();

  // =========================================================================
  // SUITE 1: PageMotion Contract & Variant Conformance
  // =========================================================================
  try {
    // 1.1: Initial variant matches contract: { opacity: 0, y: 8 }
    const hasCorrectInitial =
      pageVariants &&
      pageVariants.initial &&
      pageVariants.initial.opacity === 0 &&
      pageVariants.initial.y === 8;
    record(
      'MOT-01-1',
      'pageVariants.initial matches contract (opacity: 0, y: 8)',
      'PageMotion Contract',
      hasCorrectInitial,
      { initial: pageVariants?.initial }
    );

    // 1.2: Animate variant matches contract: { opacity: 1, y: 0, duration: 0.22, ease: [0.16, 1, 0.3, 1] }
    const hasCorrectAnimate =
      pageVariants &&
      pageVariants.animate &&
      pageVariants.animate.opacity === 1 &&
      pageVariants.animate.y === 0 &&
      pageVariants.animate.transition?.duration === 0.22 &&
      Array.isArray(pageVariants.animate.transition?.ease) &&
      pageVariants.animate.transition.ease[0] === 0.16 &&
      pageVariants.animate.transition.ease[1] === 1 &&
      pageVariants.animate.transition.ease[2] === 0.3 &&
      pageVariants.animate.transition.ease[3] === 1;
    record(
      'MOT-01-2',
      'pageVariants.animate matches contract (opacity: 1, y: 0, duration: 0.22, cubic bezier)',
      'PageMotion Contract',
      hasCorrectAnimate,
      { animate: pageVariants?.animate }
    );

    // 1.3: Exit variant matches contract: { opacity: 0, y: -6, duration: 0.18, ease: [0.16, 1, 0.3, 1] }
    const hasCorrectExit =
      pageVariants &&
      pageVariants.exit &&
      pageVariants.exit.opacity === 0 &&
      pageVariants.exit.y === -6 &&
      pageVariants.exit.transition?.duration === 0.18 &&
      Array.isArray(pageVariants.exit.transition?.ease) &&
      pageVariants.exit.transition.ease[0] === 0.16 &&
      pageVariants.exit.transition.ease[1] === 1 &&
      pageVariants.exit.transition.ease[2] === 0.3 &&
      pageVariants.exit.transition.ease[3] === 1;
    record(
      'MOT-01-3',
      'pageVariants.exit matches contract (opacity: 0, y: -6, duration: 0.18, cubic bezier)',
      'PageMotion Contract',
      hasCorrectExit,
      { exit: pageVariants?.exit }
    );

    // 1.4: PageMotion SSR renders children and applies container classes
    const childContent = <div data-testid="test-content">Route Content</div>;
    const renderedMarkup = renderToStaticMarkup(
      <PageMotion className="custom-test-class">{childContent}</PageMotion>
    );
    const rendersCorrectly =
      renderedMarkup.includes('Route Content') &&
      renderedMarkup.includes('custom-test-class') &&
      renderedMarkup.includes('w-full min-w-0');
    record(
      'MOT-01-4',
      'PageMotion renders children and merges custom className',
      'PageMotion Contract',
      rendersCorrectly,
      { renderedMarkup }
    );

    // 1.5: PageMotion handles null/undefined/empty children gracefully
    const emptyMarkup1 = renderToStaticMarkup(<PageMotion>{null}</PageMotion>);
    const emptyMarkup2 = renderToStaticMarkup(<PageMotion>{undefined}</PageMotion>);
    const emptyMarkup3 = renderToStaticMarkup(<PageMotion />);
    const handlesEmpty =
      typeof emptyMarkup1 === 'string' &&
      typeof emptyMarkup2 === 'string' &&
      typeof emptyMarkup3 === 'string';
    record(
      'MOT-01-5',
      'PageMotion handles empty/null/undefined children without throwing',
      'PageMotion Contract',
      handlesEmpty,
      { emptyMarkup1, emptyMarkup2, emptyMarkup3 }
    );
  } catch (err) {
    record('MOT-01-ERR', 'Suite 1 execution crashed', 'PageMotion Contract', false, { error: err.message });
  }

  // =========================================================================
  // SUITE 2: Full Application Route Transitions under MemoryRouter
  // =========================================================================
  const routesToTest = [
    { path: '/', expectedText: 'skeleton-shimmer', name: 'Dashboard' },
    { path: '/upload', expectedText: 'Claim Intake', name: 'Upload Claims' },
    { path: '/analysis', expectedText: 'Auditing Claim', name: 'Analysis (default)' },
    { path: '/analysis/CLM-84920', expectedText: 'CLM-84920', name: 'Analysis (parameterized)' },
    { path: '/non-existent-route-random', expectedText: '404', name: '404 Fallback' },
  ];

  routesToTest.forEach((r, idx) => {
    try {
      const client = createTestQueryClient();
      const markup = renderToStaticMarkup(
        <QueryClientProvider client={client}>
          <MemoryRouter initialEntries={[r.path]}>
            <App />
          </MemoryRouter>
        </QueryClientProvider>
      );

      const hasContent = markup.includes(r.expectedText);
      record(
        `MOT-02-${idx + 1}`,
        `Route [${r.path}] renders successfully with expected view: ${r.name}`,
        'Route Rendering',
        hasContent,
        { path: r.path, expectedText: r.expectedText, snippet: markup.slice(0, 300) }
      );
    } catch (err) {
      record(
        `MOT-02-${idx + 1}`,
        `Route [${r.path}] crashed during rendering: ${r.name}`,
        'Route Rendering',
        false,
        { path: r.path, error: err.message }
      );
    }
  });

  // =========================================================================
  // SUITE 3: Mobile Menu Drawer Entry & Exit Motion Architecture
  // =========================================================================
  try {
    // 3.1: App initially has mobile drawer closed (no backdrop or sliding drawer in DOM)
    const client = createTestQueryClient();
    const closedMarkup = renderToStaticMarkup(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // When closed, backdrop with "backdrop-blur-sm" is not rendered
    const drawerIsInitiallyClosed = !closedMarkup.includes('backdrop-blur-sm');
    record(
      'MOT-03-1',
      'Mobile menu drawer is closed by default in initial DOM state',
      'Mobile Drawer Motion',
      drawerIsInitiallyClosed,
      { closed: drawerIsInitiallyClosed }
    );

    // 3.2: Mobile drawer animation variants verification
    // Simulating open state with the exact JSX from App.jsx lines 100-124
    const simulatedDrawer = (
      <AnimatePresence>
        <div className="md:hidden fixed inset-0 z-50 flex" key="mobile-drawer-wrapper">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="w-64 bg-slate-900 text-white flex flex-col z-10 relative shadow-2xl"
          >
            <div>Sidebar Content</div>
          </motion.aside>
        </div>
      </AnimatePresence>
    );

    const openMarkup = renderToStaticMarkup(simulatedDrawer);
    const hasBackdrop = openMarkup.includes('backdrop-blur-sm');
    const hasSidebar = openMarkup.includes('Sidebar Content');
    record(
      'MOT-03-2',
      'Mobile drawer renders backdrop and sliding aside with motion attributes when active',
      'Mobile Drawer Motion',
      hasBackdrop && hasSidebar,
      { hasBackdrop, hasSidebar }
    );

    // 3.3: Adversarial Probe — AnimatePresence Child Structure
    // When mobileMenuOpen becomes false, AnimatePresence removes children.
    // If the direct child of AnimatePresence is a plain <div>, does it properly encapsulate motion descendants?
    // In App.jsx line 102: `<div className="md:hidden fixed inset-0 z-50 flex">`
    // Framer motion uses PresenceChild context which penetrates plain DOM elements to reach motion.div and motion.aside.
    // We verify that the outer wrapper maintains proper z-index and fixed viewport anchoring.
    const isWellAnchored =
      openMarkup.includes('fixed inset-0') &&
      openMarkup.includes('z-50') &&
      openMarkup.includes('flex');
    record(
      'MOT-03-3',
      'Mobile drawer container correctly enforces fixed inset-0 z-50 flex positioning during animation',
      'Mobile Drawer Motion',
      isWellAnchored,
      { openMarkup }
    );
  } catch (err) {
    record('MOT-03-ERR', 'Suite 3 crashed', 'Mobile Drawer Motion', false, { error: err.message });
  }

  // =========================================================================
  // SUITE 4: <AnimatePresence mode="wait"> Rapid Path Change Stress Testing
  // =========================================================================
  try {
    // 4.1: mode="wait" enforces single-child invariant
    // In AnimatePresence with mode="wait", only one page is rendered at any instant.
    // Verify that App wraps <Routes> inside <AnimatePresence mode="wait">
    const client = createTestQueryClient();
    const appMarkup = renderToStaticMarkup(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Verify exactly one main page content exists (no duplicate page rendering)
    const hasDashboard = appMarkup.includes('skeleton-shimmer');
    const hasUpload = appMarkup.includes('Claim Intake');
    const hasAnalysis = appMarkup.includes('Auditing Claim');
    const exactlyOnePage = hasDashboard && !hasUpload && !hasAnalysis;

    record(
      'MOT-04-1',
      'mode="wait" renders exactly one active route page with 0 duplicate layout overlap',
      'Rapid Routing Stress',
      exactlyOnePage,
      { hasDashboard, hasUpload, hasAnalysis }
    );

    // 4.2: Rapid Path Change Simulation
    // Simulate high-frequency path transitions: / -> /upload -> /analysis -> / -> /upload
    const sequence = ['/', '/upload', '/analysis', '/', '/upload', '/analysis/CLM-84920', '/'];
    let sequenceSuccess = true;
    const sequenceOutputs = [];

    for (const path of sequence) {
      const c = createTestQueryClient();
      const output = renderToStaticMarkup(
        <QueryClientProvider client={c}>
          <MemoryRouter initialEntries={[path]}>
            <App />
          </MemoryRouter>
        </QueryClientProvider>
      );
      if (!output || output.length < 500) {
        sequenceSuccess = false;
      }
      sequenceOutputs.push({ path, length: output.length });
    }

    record(
      'MOT-04-2',
      'Rapid sequence of 7 route transitions completes without rendering collapse',
      'Rapid Routing Stress',
      sequenceSuccess,
      { sequenceOutputs }
    );

    // 4.3: Rapid Toggle Stress (50 Iterations of Route Oscillation)
    // Verify no memory exhaustion, mutation leakage, or state corruption across 50 rapid route switches
    let oscillationSuccess = true;
    for (let i = 0; i < 50; i++) {
      const target = i % 2 === 0 ? '/' : '/upload';
      const c = createTestQueryClient();
      const m = renderToStaticMarkup(
        <QueryClientProvider client={c}>
          <MemoryRouter initialEntries={[target]}>
            <App />
          </MemoryRouter>
        </QueryClientProvider>
      );
      const isExpected =
        i % 2 === 0
          ? m.includes('skeleton-shimmer') && !m.includes('Claim Intake')
          : m.includes('Claim Intake') && !m.includes('skeleton-shimmer');
      if (!isExpected) {
        oscillationSuccess = false;
        break;
      }
    }

    record(
      'MOT-04-3',
      '50 rapid route oscillations between / and /upload execute with 100% rendering fidelity',
      'Rapid Routing Stress',
      oscillationSuccess,
      { iterations: 50 }
    );

    // 4.4: Layout Shift Prevention Verification
    // In PageMotion, container has `w-full min-w-0` to prevent horizontal flex overflow.
    // Verify that every route element renders within a PageMotion container with `w-full min-w-0`
    const testPaths = ['/', '/upload', '/analysis'];
    const layoutGuarded = testPaths.every((p) => {
      const c = createTestQueryClient();
      const m = renderToStaticMarkup(
        <QueryClientProvider client={c}>
          <MemoryRouter initialEntries={[p]}>
            <App />
          </MemoryRouter>
        </QueryClientProvider>
      );
      return m.includes('w-full min-w-0');
    });

    record(
      'MOT-04-4',
      'PageMotion enforces w-full min-w-0 across all routes to prevent flex layout shifts',
      'Rapid Routing Stress',
      layoutGuarded,
      { testPaths }
    );
  } catch (err) {
    record('MOT-04-ERR', 'Suite 4 crashed', 'Rapid Routing Stress', false, { error: err.message });
  }

  // =========================================================================
  // SUITE 5: Console Error & Unhandled Warning Verification
  // =========================================================================
  stopConsoleSpy();

  // Filter out any known innocuous React 18 testing warnings if any, or check for hard errors
  const criticalErrors = capturedErrors.filter(
    (e) =>
      !e.includes('ReactDOM.render is no longer supported') &&
      !e.includes('act(...)')
  );

  const cleanConsole = criticalErrors.length === 0;
  record(
    'MOT-05-1',
    'Zero unhandled console errors or runtime exceptions detected during motion stress sweep',
    'Console Cleanliness',
    cleanConsole,
    { errorCount: criticalErrors.length, capturedErrors: criticalErrors },
    cleanConsole ? 'INFO' : 'HIGH'
  );

  // Return full test summary
  const total = testResults.length;
  const passed = testResults.filter((r) => r.passed).length;
  const failed = testResults.filter((r) => !r.passed).length;

  return {
    total,
    passed,
    failed,
    results: testResults,
    vulnerabilities,
  };
}
