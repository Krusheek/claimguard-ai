import { build } from 'vite';
import path from 'path';
import fs from 'fs';
import { spawnSync } from 'child_process';

const projectRoot = path.resolve('.');

async function main() {
  console.log('Building SSR test bundle for components...');
  const outDir = path.join(projectRoot, 'node_modules', '.stress-test-bundle');

  await build({
    root: projectRoot,
    build: {
      ssr: true,
      lib: {
        entry: path.join(projectRoot, 'tests', 'component-harness.jsx'),
        formats: ['es'],
        fileName: 'component-harness',
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
          'react-dropzone',
          'react-hot-toast',
          'axios',
          'framer-motion',
          'sonner',
          'clsx',
          'tailwind-merge',
        ],
      },
    },
  });

  console.log('Running component stress tests in SSR runtime...');
  const bundlePath = path.join(outDir, 'component-harness.js');
  const { runComponentTests } = await import(`file://${bundlePath}?t=${Date.now()}`);

  const results = runComponentTests();
  let passed = 0;
  let failed = 0;

  for (const r of results) {
    if (r.pass) {
      console.log(`  ✔ PASS: ${r.name}`);
      passed++;
    } else {
      console.error(`  ✖ FAIL: ${r.name}`);
      console.error(`     Error: ${r.error}`);
      failed++;
    }
  }

  console.log(`\n======================================================`);
  console.log(`Component Stress Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }

  // Execute Challenger Stress Test Suites
  const challengerSuites = [
    'tests/challenger-m1-stress.mjs',
    'tests/challenger-m2-charts-stress.mjs',
    'tests/challenger-m2-table-stress.mjs',
    'tests/challenger-m3-upload-stress.mjs',
    'tests/challenger-m7-motion-stress.mjs',
    'tests/challenger-m7-toasts-stress.mjs',
  ];

  console.log('\n======================================================');
  console.log('Executing Milestone Challenger Stress Test Suites...');
  console.log('======================================================\n');

  let challengerFailures = 0;
  for (const suite of challengerSuites) {
    console.log(`\n▶ Running Challenger Suite: ${suite}`);
    const proc = spawnSync(process.execPath, [path.join(projectRoot, suite)], {
      cwd: projectRoot,
      stdio: 'pipe',
      shell: false,
      encoding: 'utf8',
    });
    if (proc.status !== 0) {
      console.error(`✖ Challenger Suite Failed (${suite}) with exit code ${proc.status}`);
      console.error('STDOUT:', proc.stdout);
      console.error('STDERR:', proc.stderr);
      challengerFailures++;
    } else {
      console.log(proc.stdout);
      console.log(`✔ Challenger Suite Passed (${suite})`);
    }
  }

  if (challengerFailures > 0) {
    console.error(`\n✖ ${challengerFailures} challenger suites failed.`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Stress test harness failed:', err);
  process.exit(1);
});
