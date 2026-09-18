/**
 * tests/challenger-m7-motion-stress.mjs
 * Milestone 7 Challenger: Framer Motion Transitions & Routing Adversarial Runner
 *
 * Runs:
 * 1. PageMotion contract & variant conformance
 * 2. Full application route rendering across all routes
 * 3. Mobile menu drawer entry/exit animation & presence structure
 * 4. <AnimatePresence mode="wait"> rapid path transitions & layout shift prevention
 * 5. Console error and unhandled rejection monitoring
 */

import { build } from 'vite';
import path from 'path';

const projectRoot = path.resolve('.');

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const GRAY = '\x1b[90m';

async function main() {
  const startTime = Date.now();

  console.log(`\n${BOLD}${CYAN}══════════════════════════════════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}${CYAN}   CHALLENGER M7: MOTION TRANSITIONS & ROUTING ADVERSARIAL HARNESS        ${RESET}`);
  console.log(`${BOLD}${CYAN}══════════════════════════════════════════════════════════════════════════${RESET}\n`);

  console.log(`${GRAY}[1/3] Compiling SSR test bundle for PageMotion, App, and Routes...${RESET}`);
  const outDir = path.join(projectRoot, 'node_modules', '.stress-test-bundle-m7-motion');

  await build({
    root: projectRoot,
    build: {
      ssr: true,
      lib: {
        entry: path.join(projectRoot, 'tests', 'challenger-m7-motion-harness.jsx'),
        formats: ['es'],
        fileName: 'challenger-m7-motion-harness',
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

  console.log(`${GRAY}[2/3] Loading compiled SSR harness into Node.js runtime...${RESET}`);
  const bundlePath = path.join(outDir, 'challenger-m7-motion-harness.js');
  const { runMotionStressHarness } = await import(`file://${bundlePath}`);

  console.log(`${GRAY}[3/3] Executing adversarial motion stress scenarios...${RESET}\n`);
  const report = runMotionStressHarness();

  let currentCategory = '';
  for (const r of report.results) {
    if (r.category !== currentCategory) {
      currentCategory = r.category;
      console.log(`\n${BOLD}${YELLOW}▶ Category: ${currentCategory}${RESET}`);
    }

    if (r.passed) {
      console.log(`  ${GREEN}✔ [PASS]${RESET} ${r.id}: ${r.title}`);
    } else {
      console.log(`  ${RED}✖ [FAIL]${RESET} ${r.id}: ${r.title}`);
      if (r.details?.error) {
        console.log(`     ${RED}Error: ${r.details.error}${RESET}`);
      }
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(`\n${BOLD}${CYAN}══════════════════════════════════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}${CYAN}                         CHALLENGE AUDIT SUMMARY                         ${RESET}`);
  console.log(`${BOLD}${CYAN}══════════════════════════════════════════════════════════════════════════${RESET}`);
  console.log(`  Total Test Scenarios : ${report.total}`);
  console.log(`  Passed               : ${report.passed}`);
  console.log(`  Failed               : ${report.failed}`);
  console.log(`  Execution Time       : ${elapsed}s`);
  console.log(`${BOLD}${CYAN}──────────────────────────────────────────────────────────────────────────${RESET}\n`);

  if (report.failed > 0) {
    console.error(`${RED}✖ ADVERSARIAL STRESS TEST FAILED WITH ${report.failed} VULNERABILITIES.${RESET}\n`);
    process.exit(1);
  } else {
    console.log(`${GREEN}✔ ALL ADVERSARIAL MOTION CHECKS CONFIRMED RESILIENT WITH ZERO DEFECTS.${RESET}\n`);
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Adversarial motion runner failed:', err);
  process.exit(1);
});
