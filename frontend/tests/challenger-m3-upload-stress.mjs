/**
 * ClaimGuard AI — Challenger M3 Upload Studio & Validation Adversarial Stress Suite
 * Author: challenger_m3_1 (teamwork_preview_challenger)
 * 
 * Adversarially probes:
 * 1. Boundary file sizes: 0-byte, 25MB exact (26,214,400 bytes), 25MB + 1 byte (26,214,401 bytes), negative sizes, NaN, undefined.
 * 2. MIME type & extension whitelist: Whitelisted (PDF, JPEG, PNG, TIFF) vs unwhitelisted (.exe, .zip, .svg, .js, .html), empty extension, case sensitivity, spoofed MIME.
 * 3. Filename auto-tagging heuristics: Ambiguous filenames (hospital_bill_and_policy.pdf, policy_rejection_letter.pdf), uppercase, special characters, substring collisions (daycare vs care).
 * 4. Readiness check calculations: 0/3, 1/3, 2/3, 3/3 states; percentage calculation; button disabled/enabled state; SSR renders.
 * 5. Sample Apollo claim loader data integrity: Top-level fields, tripartite PDF docs, metadata line items, sum insured, and arithmetic reconciliation.
 * 6. DocumentCard format helpers and SSR component rendering across all states.
 */

import { build } from 'vite';
import path from 'path';
import fs from 'fs';

const projectRoot = path.resolve('.');

// ANSI Color definitions
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const MAGENTA = '\x1b[35m';
const GRAY = '\x1b[90m';

async function runUploadStress() {
  const startTime = Date.now();

  console.log(`\n${BOLD}${CYAN}══════════════════════════════════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}${CYAN}   CHALLENGER M3: UPLOAD STUDIO & VALIDATION ENGINE STRESS HARNESS        ${RESET}`);
  console.log(`${BOLD}${CYAN}══════════════════════════════════════════════════════════════════════════${RESET}\n`);

  // Step 1: Compile SSR bundle using Vite
  console.log(`${GRAY}[1/3] Compiling SSR test bundle for BatchDropzone, DocumentCard & ReadinessCheck...${RESET}`);
  const outDir = path.join(projectRoot, 'node_modules', '.stress-test-bundle-m3-upload');

  await build({
    root: projectRoot,
    build: {
      ssr: true,
      lib: {
        entry: path.join(projectRoot, 'tests', 'challenger-m3-upload-harness.jsx'),
        formats: ['es'],
        fileName: 'challenger-m3-upload-harness',
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

  // Step 2: Import compiled harness
  console.log(`${GRAY}[2/3] Loading compiled SSR harness into Node.js runtime...${RESET}`);
  const bundlePath = path.join(outDir, 'challenger-m3-upload-harness.js');
  const { runUploadStressTests } = await import(`file://${bundlePath}`);

  // Step 3: Execute tests
  console.log(`${GRAY}[3/3] Executing adversarial test scenarios...${RESET}\n`);
  const { testResults, vulnerabilities } = runUploadStressTests();

  // Group results by category
  const categories = {};
  for (const t of testResults) {
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
        if (t.details && t.details.note) {
          console.log(`     ${YELLOW}Finding:${RESET} ${t.details.note}`);
        }
        if (t.details && t.details.error) {
          console.log(`     ${RED}Error:${RESET} ${t.details.error}`);
        }
      }
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  // Summary Report
  console.log(`\n${BOLD}${CYAN}══════════════════════════════════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}${CYAN}                         CHALLENGE AUDIT SUMMARY                         ${RESET}`);
  console.log(`${BOLD}${CYAN}══════════════════════════════════════════════════════════════════════════${RESET}`);
  console.log(`  Total Test Scenarios : ${BOLD}${testResults.length}${RESET}`);
  console.log(`  Passed               : ${GREEN}${passedTotal}${RESET}`);
  console.log(`  Adversarial Findings : ${failedTotal > 0 ? YELLOW : GREEN}${failedTotal}${RESET}`);
  console.log(`  Execution Time       : ${duration}s`);
  console.log(`${BOLD}${CYAN}──────────────────────────────────────────────────────────────────────────${RESET}`);

  if (vulnerabilities.length > 0) {
    console.log(`\n${BOLD}${YELLOW}IDENTIFIED BEHAVIORAL LIMITATIONS & ADVERSARIAL FINDINGS (${vulnerabilities.length}):${RESET}`);
    vulnerabilities.forEach((v, idx) => {
      const sevColor = v.severity === 'CRITICAL' || v.severity === 'HIGH' ? RED : YELLOW;
      console.log(`\n${idx + 1}. [${sevColor}${v.severity}${RESET}] ${BOLD}${v.id}: ${v.title}${RESET}`);
      if (v.details.note) {
        console.log(`   ${YELLOW}Detail:${RESET} ${v.details.note}`);
      }
      if (v.details.error) {
        console.log(`   ${RED}Error:${RESET} ${v.details.error}`);
      }
    });
  } else {
    console.log(`\n${BOLD}${GREEN}✔ ALL ADVERSARIAL CHECKS CONFIRMED RESILIENT WITH ZERO DEFECTS.${RESET}`);
  }

  console.log(`\n${BOLD}${CYAN}══════════════════════════════════════════════════════════════════════════${RESET}\n`);

  return {
    testResults,
    vulnerabilities,
    passedTotal,
    failedTotal,
    duration,
  };
}

runUploadStress().catch((err) => {
  console.error(`${RED}Stress test harness execution failed:${RESET}`, err);
  process.exit(1);
});
