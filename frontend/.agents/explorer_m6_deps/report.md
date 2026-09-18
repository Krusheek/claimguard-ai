# Milestone 6 Technical Implementation Plan: Dependencies & Design Tokens

## Executive Summary
This report provides the exact, unambiguous instructions and file modifications required for Milestone 6 (Dependencies & Tokens). It covers:
1. Installing four essential libraries: `framer-motion`, `sonner`, `clsx`, and `tailwind-merge`.
2. Extending `tailwind.config.js` with micro-interaction scale token (`scale-101`) and ultra-soft diffused elevation shadows (`diffused`, `diffused-hover`).
3. Adding `.card-diffused`, `.card-diffused-hover`, and `.border-crisp` component utilities to `src/index.css`.
4. Creating a standard class merge utility `src/lib/utils.js` (`cn` helper) to empower Milestones 7 & 8.
5. Updating SSR test runner tooling (`tests/run-stress-tests.mjs`) to recognize the new external dependencies during Rollup bundling.
6. Step-by-step verification commands to ensure zero regressions and complete pipeline readiness.

---

## 1. Package Installation Plan

### Target Environment & Constraints
- **Framework**: React 18.3.1
- **Bundler**: Vite 6.0.3
- **Package Manager**: `npm` (with `package-lock.json` present at frontend root)
- **Target File**: `c:\Users\krusheek\Desktop\SIH\claimguard-ai\frontend\package.json`

### Required Packages
1. **`framer-motion`**: Hardware-accelerated UI transitions, page routing motion, slide-over drawer animations, and spring stepper physics. Target version: `^11.18.2` (fully compatible with React 18.3.1).
2. **`sonner`**: Stacked toast notification engine with rich color styles. Target version: `^1.7.4`.
3. **`clsx`**: Lightweight conditional class construct utility. Target version: `^2.1.1`.
4. **`tailwind-merge`**: Utility function to merge Tailwind CSS classes without style conflicts. Target version: `^2.6.0`.

### Execution Method A: CLI Command (Preferred)
In PowerShell at `c:\Users\krusheek\Desktop\SIH\claimguard-ai\frontend`:
```powershell
npm install framer-motion@^11.18.2 sonner@^1.7.4 clsx@^2.1.1 tailwind-merge@^2.6.0
```

### Execution Method B: Direct File Edit to `package.json`
If running interactively is constrained or if preparing the file directly before `npm install`:

**File**: `c:\Users\krusheek\Desktop\SIH\claimguard-ai\frontend\package.json`

**Lines 12–21**:
```json
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.0",
    "@tanstack/react-query": "^5.62.0",
    "axios": "^1.7.9",
    "react-dropzone": "^14.3.5",
    "lucide-react": "^0.460.0",
    "react-hot-toast": "^2.4.1",
    "framer-motion": "^11.18.2",
    "sonner": "^1.7.4",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0"
  },
```

Then run:
```powershell
npm install
```

---

## 2. Tailwind Configuration Extension Plan

### Target File
`c:\Users\krusheek\Desktop\SIH\claimguard-ai\frontend\tailwind.config.js`

### Token Specifications
1. **Scale**:
   - Class: `scale-101`
   - Value: `1.01`
   - Theme Path: `theme.extend.scale`
   - Purpose: Subtle, non-jarring hover micro-interaction for metric cards, buttons, and clickable table rows.

2. **Box Shadow (Ultra-Soft Diffused)**:
   - Token 1: `'diffused': '0 4px 20px 0 rgba(0, 0, 0, 0.03)'`
   - Token 2: `'diffused-hover': '0 8px 30px 0 rgba(0, 0, 0, 0.06)'`
   - Theme Path: `theme.extend.boxShadow`
   - Purpose: Eliminates harsh dark drop-shadows, creating premium fintech / enterprise healthtech diffused depth.

### Exact File Edit

In `tailwind.config.js`, update `theme.extend` to include `scale` and the two new `boxShadow` tokens:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      scale: {
        '101': '1.01',
      },
      colors: {
        brand: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7', // Primary interactive
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
          navy: '#0F172A', // Slate 900
          midnight: '#0B1120',
          accent: '#2563EB',
        },
        medical: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          500: '#14B8A6',
          600: '#0D9488', // Clinical teal
          700: '#0F766E',
          cyan: '#06B6D4',
          slate: '#1E293B',
        },
        status: {
          pass: {
            DEFAULT: '#059669',
            bg: '#ECFDF5',
            border: '#A7F3D0',
            text: '#047857',
          },
          warning: {
            DEFAULT: '#D97706',
            bg: '#FFFBEB',
            border: '#FDE68A',
            text: '#B45309',
          },
          fail: {
            DEFAULT: '#E11D48',
            bg: '#FFF1F2',
            border: '#FECDD3',
            text: '#BE123C',
          },
          info: {
            DEFAULT: '#2563EB',
            bg: '#EFF6FF',
            border: '#BFDBFE',
            text: '#1D4ED8',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'card': '0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)',
        'elevation': '0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
        'inner-subtle': 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'diffused': '0 4px 20px 0 rgba(0, 0, 0, 0.03)',
        'diffused-hover': '0 8px 30px 0 rgba(0, 0, 0, 0.06)',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        }
      },
      animation: {
        shimmer: 'shimmer 1.8s infinite',
        'pulse-slow': 'pulseSlow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
```

---

## 3. Global CSS Extensions (`src/index.css`)

### Target File
`c:\Users\krusheek\Desktop\SIH\claimguard-ai\frontend\src\index.css`

### Classes to Add
Under `@layer components`:
1. `.card-diffused`: Standard container styling utilizing `theme('boxShadow.diffused')` with high-density 1px border.
2. `.card-diffused-hover`: Hover state applying `theme('boxShadow.diffused-hover')`.
3. `.border-crisp`: Explicit 1px border utility with `border-slate-200/80` for high contrast without visual clutter.

### Exact File Content
Replace `src/index.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-slate-50 text-slate-900 font-sans antialiased;
    font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
  }

  /* Custom enterprise scrollbars */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-track {
    background: #F1F5F9;
  }
  ::-webkit-scrollbar-thumb {
    background: #CBD5E1;
    border-radius: 9999px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #94A3B8;
  }
}

@layer components {
  /* Enterprise Card Standard */
  .card-enterprise {
    @apply bg-white rounded-xl border border-slate-200/90 transition-all duration-200;
    box-shadow: theme('boxShadow.card');
  }
  .card-enterprise-hover {
    @apply hover:border-slate-300;
  }
  .card-enterprise-hover:hover {
    box-shadow: theme('boxShadow.card-hover');
  }

  /* Ultra-Soft Diffused Card Standard */
  .card-diffused {
    @apply bg-white rounded-xl border border-slate-200/80 transition-all duration-200;
    box-shadow: theme('boxShadow.diffused');
  }
  .card-diffused-hover {
    @apply hover:border-slate-300 transition-all duration-200;
  }
  .card-diffused-hover:hover {
    box-shadow: theme('boxShadow.diffused-hover');
  }

  /* Crisp 1px Enterprise Border */
  .border-crisp {
    @apply border border-slate-200/80;
  }

  /* Monospace Financial Numerals */
  .font-financial {
    @apply font-mono tracking-tight tabular-nums;
  }

  /* Glass Acrylic Bar */
  .glass-header {
    @apply bg-white/85 backdrop-blur-md border-b border-slate-200/90;
  }

  /* Shimmer Skeleton Base */
  .skeleton-shimmer {
    @apply relative overflow-hidden bg-slate-200/80 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent;
  }
}
```

---

## 4. Class Composition Utility Helper (`src/lib/utils.js`)

To bridge `clsx` and `tailwind-merge` cleanly into the application architecture for Milestones 7 & 8, create:

### Target File
`c:\Users\krusheek\Desktop\SIH\claimguard-ai\frontend\src\lib\utils.js`

### Content
```javascript
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS classes resolving precedence collisions with clsx logic
 * @param {...any} inputs
 * @returns {string}
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

This enables patterns such as:
```jsx
<div className={cn("card-diffused transition-transform duration-200 hover:scale-101", className)}>
```

---

## 5. Test Runner Tooling Synchronization

### Target File
`c:\Users\krusheek\Desktop\SIH\claimguard-ai\frontend\tests\run-stress-tests.mjs`

### Rationale
In `tests/run-stress-tests.mjs`, Vite builds an SSR library bundle of `tests/component-harness.jsx` using Rollup. When components start importing `framer-motion`, `sonner`, `clsx`, or `tailwind-merge`, Rollup will attempt to resolve and bundle them during the SSR build unless they are designated in `rollupOptions.external`.

### Exact Modification in `tests/run-stress-tests.mjs`
At lines 23–25:

```javascript
// REPLACE:
      rollupOptions: {
        external: ['react', 'react-dom', 'react-dom/server', 'react-router-dom', '@tanstack/react-query', 'lucide-react', 'react-hot-toast', 'axios', 'react-dropzone'],
      },

// WITH:
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
```

Note regarding `tests/check-imports.mjs`:
`check-imports.mjs` dynamically reads dependencies from `package.json`. Once the packages are in `package.json`, `check-imports.mjs` will automatically consider imports from `framer-motion`, `sonner`, `clsx`, and `tailwind-merge` valid.

---

## 6. Worker Execution Checklist & Verification Commands

Worker can execute the following steps in sequence:

| Step | Action | Target / Command |
|---|---|---|
| 1 | Install Packages | `npm install framer-motion@^11.18.2 sonner@^1.7.4 clsx@^2.1.1 tailwind-merge@^2.6.0` |
| 2 | Update Tailwind Config | Add `scale.101`, `boxShadow.diffused`, `boxShadow.diffused-hover` to `tailwind.config.js` |
| 3 | Update CSS | Add `.card-diffused`, `.card-diffused-hover`, `.border-crisp` to `src/index.css` |
| 4 | Create Utility Helper | Create `src/lib/utils.js` exporting `cn(...)` |
| 5 | Update Stress Runner | Add external dependencies to `tests/run-stress-tests.mjs` |
| 6 | Verify Import Integrity | `node tests/check-imports.mjs` |
| 7 | Verify Production Build | `npm run build` |
| 8 | Verify Token Compilation | `node tests/token-resolver.test.mjs` |
| 9 | Run Full Test Suite | `npm test` (`node tests/runner.mjs`) |
| 10 | Run SSR Stress Suite | `node tests/run-stress-tests.mjs` |
