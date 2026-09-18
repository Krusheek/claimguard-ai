import fs from 'fs';
import path from 'path';

const projectRoot = path.resolve('.');
const cssPath = path.join(projectRoot, 'dist', 'assets');
const cssFiles = fs.readdirSync(cssPath).filter(f => f.endsWith('.css'));
if (cssFiles.length === 0) {
  console.error('No CSS files found in dist/assets!');
  process.exit(1);
}

const css = fs.readFileSync(path.join(cssPath, cssFiles[0]), 'utf8');

const targetFiles = [
  'src/components/common/Topbar.jsx',
  'src/components/common/StatusBadge.jsx',
  'src/components/common/MetricCard.jsx',
  'src/components/common/Skeletons.jsx',
  'src/components/common/ErrorState.jsx',
  'src/App.jsx',
  'src/components/StatusBadge.jsx',
  'src/components/StatsCard.jsx',
];

const extractedTokens = new Set();

for (const relFile of targetFiles) {
  const filePath = path.join(projectRoot, relFile);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    continue;
  }
  const code = fs.readFileSync(filePath, 'utf8');

  // Match className="..." and className={`...`} and className={'...'}
  const classNameMatches = code.matchAll(/className\s*=\s*(?:\{`([^`]+)`\}|"([^"]+)"|'([^']+)')/g);
  for (const m of classNameMatches) {
    const raw = m[1] || m[2] || m[3] || '';
    // Clean out template variables ${...}
    const cleaned = raw.replace(/\$\{[^}]+\}/g, ' ');
    cleaned.split(/\s+/).forEach(t => {
      const trimmed = t.trim();
      if (trimmed && !trimmed.includes('{') && !trimmed.includes('}') && !trimmed.includes(':') === false || trimmed.length > 1) {
        if (!trimmed.includes('$') && !trimmed.includes('?')) {
          extractedTokens.add({ token: trimmed, file: relFile });
        }
      }
    });
  }

  // Also extract string objects used for style mapping (e.g., variantStyles, sizeClasses, getStyle)
  const stringLiterals = code.matchAll(/(['"])([\w\-/:. %\[\]]+)\1/g);
  for (const sm of stringLiterals) {
    const val = sm[2];
    if (
      val.includes('bg-') ||
      val.includes('text-') ||
      val.includes('border-') ||
      val.includes('px-') ||
      val.includes('hover:') ||
      val.includes('shadow-')
    ) {
      val.split(/\s+/).forEach(token => {
        const trimmed = token.trim();
        if (trimmed && trimmed.length > 1 && !trimmed.includes('$')) {
          extractedTokens.add({ token: trimmed, file: relFile });
        }
      });
    }
  }
}

console.log(`Extracted ${extractedTokens.size} token occurrences across ${targetFiles.length} files.`);

// Now verify each token exists in CSS.
// Note: In CSS, characters like :, /, [, ], . are escaped with backslash.
const unresolved = [];
const resolved = [];

for (const { token, file } of extractedTokens) {
  // If token is a custom class from index.css:
  // e.g. card-enterprise, card-enterprise-hover, font-financial, glass-header, skeleton-shimmer
  // Or standard Tailwind utility.

  // Check simple substring or escaped class selector
  const escaped = token.replace(/([:/.\[\]%])/g, '\\$1');
  const simpleMatch = css.includes('.' + escaped) || css.includes(escaped) || css.includes(token);

  if (simpleMatch) {
    resolved.push({ token, file });
  } else {
    unresolved.push({ token, file });
  }
}

console.log(`Resolved: ${resolved.length}`);
console.log(`Unresolved: ${unresolved.length}`);

if (unresolved.length > 0) {
  console.log('\n--- UNRESOLVED TOKENS ---');
  for (const item of unresolved) {
    console.log(`[${item.file}] ${item.token}`);
  }
} else {
  console.log('\nAll tokens resolved successfully!');
}
