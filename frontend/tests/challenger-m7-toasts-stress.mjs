/**
 * ClaimGuard AI — Challenger M7 Toasts & Skeletons Modernization Adversarial Stress Suite
 * Author: challenger_m7_2 (teamwork_preview_challenger)
 * 
 * Scope: Adversarial stress-testing of Milestone 7 toasts and skeleton modernization:
 * 1. Empirically verify 0 occurrences of `react-hot-toast` across all files in `src/`.
 * 2. Empirically verify 0 occurrences of `animate-spin` across all files in `src/`.
 * 3. Stress-test Sonner toasts: multi-toasts, stacked display, action buttons, and pipeline sequential toast IDs.
 * 4. Stress-test Concentric Auditor Scanner HUD and pulsing beacons: verify smooth CSS animation and 0 SSR rendering errors.
 * 5. Deliver a clear verdict: APPROVE or REQUEST_CHANGES with empirical logs in handoff.md and send_message.
 */

import { build } from 'vite';
import path from 'path';
import fs from 'fs';

const projectRoot = path.resolve('.');
const srcDir = path.join(projectRoot, 'src');

// ANSI Color definitions
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const MAGENTA = '\x1b[35m';
const GRAY = '\x1b[90m';

function getAllSourceFiles(dir, exts = ['.js', '.jsx', '.ts', '.tsx']) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getAllSourceFiles(full, exts));
    } else if (exts.some((e) => entry.name.endsWith(e))) {
      results.push(full);
    }
  }
  return results;
}

async function runToastsAndSkeletonsStress() {
  const startTime = Date.now();

  console.log(`\n${BOLD}${CYAN}══════════════════════════════════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}${CYAN}   CHALLENGER M7-2: TOASTS & SKELETON MODERNIZATION ADVERSARIAL SUITE     ${RESET}`);
  console.log(`${BOLD}${CYAN}══════════════════════════════════════════════════════════════════════════${RESET}\n`);

  const staticResults = [];
  const allFiles = getAllSourceFiles(srcDir);

  console.log(`${GRAY}[1/4] Scanning ${allFiles.length} source files in src/ for legacy dependencies & spinners...${RESET}`);

  // 1. Static Scan: 0 occurrences of react-hot-toast in src/
  const reactHotToastMatches = [];
  for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('react-hot-toast')) {
      reactHotToastMatches.push(path.relative(projectRoot, file));
    }
  }

  staticResults.push({
    id: 'STATIC-01',
    category: 'Source Cleanliness',
    title: 'Zero occurrences of react-hot-toast across all files in src/',
    passed: reactHotToastMatches.length === 0,
    severity: 'CRITICAL',
    details: reactHotToastMatches.length > 0 ? { offendingFiles: reactHotToastMatches } : null,
  });

  // 2. Static Scan: 0 occurrences of animate-spin in src/
  const animateSpinMatches = [];
  for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('animate-spin')) {
      animateSpinMatches.push(path.relative(projectRoot, file));
    }
  }

  staticResults.push({
    id: 'STATIC-02',
    category: 'Source Cleanliness',
    title: 'Zero occurrences of legacy animate-spin across all files in src/',
    passed: animateSpinMatches.length === 0,
    severity: 'CRITICAL',
    details: animateSpinMatches.length > 0 ? { offendingFiles: animateSpinMatches } : null,
  });

  // 3. Static Scan: Sonner imports are strictly named imports (`import { toast } from 'sonner'`)
  const defaultSonnerImports = [];
  const sonnerImportPattern = /import\s+([^{}\n]+)\s+from\s+['"]sonner['"]/g;
  for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const matches = [...content.matchAll(sonnerImportPattern)];
    for (const m of matches) {
      if (!m[1].includes('{')) {
        defaultSonnerImports.push({ file: path.relative(projectRoot, file), importMatch: m[0] });
      }
    }
  }

  staticResults.push({
    id: 'STATIC-03',
    category: 'Source Cleanliness',
    title: 'Strict named imports for Sonner (avoids default import TypeError)',
    passed: defaultSonnerImports.length === 0,
    severity: 'HIGH',
    details: defaultSonnerImports.length > 0 ? { defaultImports: defaultSonnerImports } : null,
  });

  // 4. CSS Design Tokens & Keyframes Verification
  const tailwindConfigPath = path.join(projectRoot, 'tailwind.config.js');
  const indexCssPath = path.join(projectRoot, 'src', 'index.css');

  let cssTokensValid = false;
  try {
    const tailwindCode = fs.readFileSync(tailwindConfigPath, 'utf8');
    const indexCssCode = fs.readFileSync(indexCssPath, 'utf8');

    const hasShimmerKeyframe = tailwindCode.includes('shimmer:') && tailwindCode.includes("translateX(100%)");
    const hasPulseSlowKeyframe = tailwindCode.includes('pulseSlow:') && tailwindCode.includes("pulse-slow");
    const hasScale101 = tailwindCode.includes("'101': '1.01'") || tailwindCode.includes('"101": "1.01"');
    const hasDiffusedShadow = tailwindCode.includes('diffused') && tailwindCode.includes('0 4px 20px');
    const hasSkeletonShimmerClass = indexCssCode.includes('.skeleton-shimmer');

    cssTokensValid = hasShimmerKeyframe && hasPulseSlowKeyframe && hasScale101 && hasDiffusedShadow && hasSkeletonShimmerClass;
  } catch (err) {
    cssTokensValid = false;
  }

  staticResults.push({
    id: 'STATIC-04',
    category: 'Source Cleanliness',
    title: 'CSS tokens configured: shimmer keyframe, pulseSlow keyframe, scale-101, diffused shadow, .skeleton-shimmer',
    passed: cssTokensValid,
    severity: 'HIGH',
  });

  // Step 2: Compile SSR bundle using Vite
  console.log(`${GRAY}[2/4] Compiling SSR test bundle for Sonner & Skeletons stress tests...${RESET}`);
  const outDir = path.join(projectRoot, 'node_modules', '.stress-test-bundle-m7-toasts');

  await build({
    root: projectRoot,
    build: {
      ssr: true,
      lib: {
        entry: path.join(projectRoot, 'tests', 'challenger-m7-toasts-harness.jsx'),
        formats: ['es'],
        fileName: 'challenger-m7-toasts-harness',
      },
      outDir,
      emptyOutDir: true,
      rollupOptions: {
        external: [
          'react',
          'react-dom',
          'react-dom/server',
          'react-router-dom',
          '@tanstack/react-query',
          'lucide-react',
          'react-hot-toast',
          'axios',
          'react-dropzone',
          'framer-motion',
          'sonner',
          'clsx',
          'tailwind-merge',
        ],
      },
    },
  });

  // Step 3: Import compiled harness
  console.log(`${GRAY}[3/4] Loading compiled SSR harness into Node.js runtime...${RESET}`);
  const bundlePath = path.join(outDir, 'challenger-m7-toasts-harness.js');
  const { runToastsAndSkeletonsStressTests } = await import(`file://${bundlePath}?t=${Date.now()}`);

  // Step 4: Execute tests
  console.log(`${GRAY}[4/4] Executing adversarial test scenarios...${RESET}\n`);
  const { testResults: runtimeResults, vulnerabilities: runtimeVulns } = runToastsAndSkeletonsStressTests();

  const allTestResults = [...staticResults, ...runtimeResults];
  const allVulnerabilities = [
    ...staticResults.filter((r) => !r.passed),
    ...runtimeVulns,
  ];

  // Group results by category
  const categories = {};
  for (const t of allTestResults) {
    if (!categories[t.category]) categories[t.category] = [];
    categories[t.category].push(t);
  }

  let passedTotal = 0;
  let failedTotal = 0;

  for (const [catName, tests] of Object.entries(categories)) {
    console.log(`\n${BOLD}${MAGENTA}▶ Category: ${catName}${RESET}`);
    for (const t of tests) {
      if (t.passed) {
        passedTotal++;
        console.log(`  ${GREEN}✔ [PASS]${RESET} ${BOLD}${t.id}${RESET}: ${t.title}`);
      } else {
        failedTotal++;
        const sevColor = t.severity === 'CRITICAL' || t.severity === 'HIGH' ? RED : YELLOW;
        console.log(`  ${RED}✖ [${sevColor}${t.severity}${RED}]${RESET} ${BOLD}${t.id}${RESET}: ${t.title}`);
        if (t.details && t.details.error) {
          console.log(`     ${RED}Error:${RESET} ${t.details.error}`);
        }
        if (t.details && t.details.offendingFiles) {
          console.log(`     ${YELLOW}Offending Files:${RESET} ${JSON.stringify(t.details.offendingFiles)}`);
        }
      }
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  // Summary Report
  console.log(`\n${BOLD}${CYAN}══════════════════════════════════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}${CYAN}                CHALLENGER M7-2 AUDIT SUMMARY & VERDICT                  ${RESET}`);
  console.log(`${BOLD}${CYAN}══════════════════════════════════════════════════════════════════════════${RESET}`);
  console.log(`  Total Test Scenarios : ${BOLD}${allTestResults.length}${RESET}`);
  console.log(`  Passed               : ${GREEN}${passedTotal}${RESET}`);
  console.log(`  Adversarial Findings : ${failedTotal > 0 ? RED : GREEN}${failedTotal}${RESET}`);
  console.log(`  Execution Time       : ${duration}s`);
  console.log(`${BOLD}${CYAN}──────────────────────────────────────────────────────────────────────────${RESET}`);

  if (allVulnerabilities.length > 0) {
    console.log(`\n${BOLD}${RED}VERDICT: REQUEST_CHANGES — ${allVulnerabilities.length} VULNERABILITIES IDENTIFIED:${RESET}`);
    allVulnerabilities.forEach((v, idx) => {
      const sevColor = v.severity === 'CRITICAL' || v.severity === 'HIGH' ? RED : YELLOW;
      console.log(`\n${idx + 1}. [${sevColor}${v.severity}${RESET}] ${BOLD}${v.id}: ${v.title}${RESET}`);
      if (v.details) {
        console.log(`   ${YELLOW}Detail:${RESET} ${JSON.stringify(v.details)}`);
      }
    });
  } else {
    console.log(`\n${BOLD}${GREEN}✔ VERDICT: APPROVE — ALL M7 TOASTS & SKELETON ADVERSARIAL STRESS SCENARIOS PASSED WITH ZERO DEFECTS.${RESET}`);
  }

  console.log(`\n${BOLD}${CYAN}══════════════════════════════════════════════════════════════════════════${RESET}\n`);

  if (failedTotal > 0) {
    process.exit(1);
  }
}

runToastsAndSkeletonsStress().catch((err) => {
  console.error(`${RED}Milestone 7 toasts stress test harness failed:${RESET}`, err);
  process.exit(1);
});
