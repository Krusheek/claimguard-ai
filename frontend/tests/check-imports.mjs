import fs from 'fs';
import path from 'path';

const projectRoot = path.resolve('.');
const srcDir = path.join(projectRoot, 'src');
const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
const installedDeps = new Set([
  ...Object.keys(packageJson.dependencies || {}),
  ...Object.keys(packageJson.devDependencies || {}),
  'react', 'react/jsx-runtime', 'react-dom', 'react-dom/client'
]);

// Mandatory Milestone 6 dependencies that must be declared in package.json
const requiredM6Deps = [
  'framer-motion',
  'sonner',
  'clsx',
  'tailwind-merge'
];

let hasErrors = false;

// 1. Proactive check: Verify Milestone 6 dependencies in package.json
console.log('Validating required Milestone 6 dependencies...');
const missingM6Deps = requiredM6Deps.filter(dep => !installedDeps.has(dep));
if (missingM6Deps.length > 0) {
  console.error(`❌ Missing required Milestone 6 dependencies in package.json:`, missingM6Deps);
  hasErrors = true;
} else {
  console.log(`✔ All required Milestone 6 dependencies declared: ${requiredM6Deps.join(', ')}`);
}

// 2. Physical check: Verify presence in node_modules
const missingNodeModules = requiredM6Deps.filter(dep => {
  const depPath = path.join(projectRoot, 'node_modules', dep);
  return !fs.existsSync(depPath);
});
if (missingNodeModules.length > 0) {
  console.error(`❌ Milestone 6 dependencies missing from node_modules (run npm install):`, missingNodeModules);
  hasErrors = true;
} else {
  console.log('✔ All required Milestone 6 packages verified in node_modules');
}

function getAllFiles(dir, exts = ['.js', '.jsx', '.ts', '.tsx', '.css']) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(getAllFiles(full, exts));
    } else if (exts.some(ext => entry.name.endsWith(ext))) {
      files.push(full);
    }
  }
  return files;
}

const allFiles = getAllFiles(srcDir);
const unresolvedImports = [];

// 3. Scan all import and export statements in src/
for (const file of allFiles) {
  if (file.endsWith('.css')) continue;
  const code = fs.readFileSync(file, 'utf8');
  const dir = path.dirname(file);
  const importMatches = code.matchAll(/(?:import\s+(?:.*?\s+from\s+)?|export\s+(?:.*?\s+from\s+)?|import\()(['"])([^'"]+)\1/g);

  for (const m of importMatches) {
    const spec = m[2];
    if (spec.startsWith('.')) {
      // Relative import resolution
      let resolved = path.resolve(dir, spec);
      let exists = false;
      if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
        const candidates = ['.js', '.jsx', '.ts', '.tsx', '.css'].map(ext => path.join(resolved, `index${ext}`));
        exists = candidates.some(c => fs.existsSync(c));
      } else {
        const candidates = ['', '.js', '.jsx', '.ts', '.tsx', '.css'].map(ext => resolved + ext);
        exists = candidates.some(c => fs.existsSync(c) && !fs.statSync(c).isDirectory());
      }
      if (!exists) {
        unresolvedImports.push({ file: path.relative(projectRoot, file), spec, type: 'relative' });
      }
    } else {
      // Package import resolution
      const pkgName = spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0];
      if (!installedDeps.has(pkgName)) {
        unresolvedImports.push({ file: path.relative(projectRoot, file), spec, type: 'package' });
      }
    }
  }
}

console.log(`Checked all import specs across ${allFiles.length} files in src/`);
if (unresolvedImports.length === 0) {
  console.log('✅ All imports resolve successfully to existing files or installed packages!');
} else {
  console.error(`❌ Found ${unresolvedImports.length} unresolved imports:`, unresolvedImports);
  hasErrors = true;
}

if (hasErrors) {
  process.exit(1);
}
