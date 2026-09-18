# Original User Request

## 2026-09-17T14:45:24Z

# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: Craft prompt → get user approval → delegate to teamwork_preview
> Requested team: [none — teamwork routes from the description]

Redesign the ClaimGuard AI React frontend to have a highly professional, production-grade UI, removing the generic "AI-generated" look and incorporating advanced data visualizations.

Working directory: c:\Users\krusheek\Desktop\SIH\claimguard-ai\frontend
Integrity mode: development

## Requirements

### R1. Enterprise UI Overhaul
Upgrade the Tailwind CSS styling, typography, color palette, and component design across the Dashboard, Upload, and Analysis pages. The design must meet modern enterprise healthcare software standards (e.g., clean, trustworthy, high information density without clutter).

### R2. Advanced Visualizations
Utilize principles for building rich, interactive data visualizations for the claim analysis results and forensics data. Instead of simple text lists, use visual indicators, progress bars, and structured cards for rule verdicts and monetary impacts.

### R3. UX Polish
Implement robust loading skeletons, error states, and smooth transitions. Ensure the multi-step upload wizard feels seamless and professional.

## Acceptance Criteria

### UI Quality
- [ ] The interface looks polished, cohesive, and significantly more professional than a basic template.
- [ ] Data is presented visually (charts, visual flags, metrics) rather than just raw text.
- [ ] Interactive elements (hover states, transitions, active states) are fully implemented across all pages.
- [ ] The application remains fully functional and successfully communicates with the existing backend API.

## 2026-09-18T03:55:30Z

# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: Craft prompt → get user approval → delegate to teamwork_preview
> Requested team: [none — teamwork routes from the description]

Elevate the ClaimGuard AI React frontend into a flawless, production-ready application by implementing smooth, professional animations and conducting a rigorous verification sweep of all recently added components.

Working directory: c:\Users\krusheek\Desktop\SIH\claimguard-ai\frontend
Integrity mode: benchmark

## Requirements

### R1. Professional UI/UX & Animations
Integrate smooth, hardware-accelerated animations using `framer-motion` for page routing, modal dialogs, dashboard metric cards, and the upload stepper. Replace spinning loaders with pulsing skeleton screens. Implement subtle micro-interactions like scale-101 on hover and soft diffused shadows.

### R2. UI Pattern Integration
Apply modern healthcare and fintech UI patterns:
- Use a strict Bento Grid layout for the dashboard.
- Implement contextual sidebars (drawers) for claim details instead of full page navigations.
- Ensure typography hierarchy using fonts like Inter, with muted slate colors for secondary data.
- Refine borders and shadows to use ultra-soft diffused styles (`0 4px 20px rgba(0,0,0,0.03)`) and 1px borders.
- Integrate stacked toast notifications (e.g., using `sonner`) for pipeline status.

### R3. Component Verification & Hardening
Audit and verify that every newly added component (charts, tables, forensics lab, API integration) works flawlessly in real-time. Fix any latent edge cases, console errors, or rendering artifacts.

## Acceptance Criteria

### UI Quality & Polish
- [ ] Page transitions and micro-interactions (hover states, loaders) execute smoothly without jank.
- [ ] The overall aesthetic matches top-tier enterprise SaaS platforms.
- [ ] No visual regressions or broken layouts exist at desktop or mobile breakpoints.

### Functional Verification
- [ ] All interactive charts and tables successfully process and render data without throwing React runtime errors.
- [ ] The backend API connection is fully resilient and handles loading/error states gracefully.

