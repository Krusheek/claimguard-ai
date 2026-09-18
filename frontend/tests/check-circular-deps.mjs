import fs from 'fs';
import path from 'path';

const projectRoot = path.resolve('.');
const srcDir = path.join(projectRoot, 'src');

function getAllFiles(dir, exts = ['.js', '.jsx', '.ts', '.tsx']) {
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
const graph = new Map();

for (const file of allFiles) {
  const code = fs.readFileSync(file, 'utf8');
  const dir = path.dirname(file);
  const imports = [];
  const importMatches = code.matchAll(/(?:import\s+(?:.*?\s+from\s+)?|export\s+(?:.*?\s+from\s+)?|import\()(['"])([^'"]+)\1/g);

  for (const m of importMatches) {
    const spec = m[2];
    if (spec.startsWith('.')) {
      // Relative import
      let resolved = path.resolve(dir, spec);
      if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
        const indexCandidates = ['.js', '.jsx', '.ts', '.tsx'].map(ext => path.join(resolved, `index${ext}`));
        const found = indexCandidates.find(c => fs.existsSync(c));
        if (found) resolved = found;
      } else {
        const fileCandidates = ['', '.js', '.jsx', '.ts', '.tsx'].map(ext => resolved + ext);
        const found = fileCandidates.find(c => fs.existsSync(c) && !fs.statSync(c).isDirectory());
        if (found) resolved = found;
      }
      imports.push(resolved);
    }
  }
  graph.set(file, imports);
}

// DFS cycle detection
const visited = new Map(); // 0: unvisited, 1: visiting, 2: visited
const cycles = [];

function dfs(node, pathStack) {
  visited.set(node, 1);
  pathStack.push(node);

  const neighbors = graph.get(node) || [];
  for (const neighbor of neighbors) {
    if (visited.get(neighbor) === 1) {
      const cycleStart = pathStack.indexOf(neighbor);
      cycles.push(pathStack.slice(cycleStart).concat(neighbor));
    } else if (!visited.get(neighbor)) {
      dfs(neighbor, pathStack);
    }
  }

  pathStack.pop();
  visited.set(node, 2);
}

for (const node of graph.keys()) {
  if (!visited.get(node)) {
    dfs(node, []);
  }
}

console.log(`Scanned ${allFiles.length} modules in src/`);
if (cycles.length === 0) {
  console.log('✅ ZERO circular dependencies found in src/!');
} else {
  console.error(`❌ Found ${cycles.length} circular dependencies:`);
  for (const c of cycles) {
    console.error(c.map(p => path.relative(projectRoot, p)).join(' -> '));
  }
}
