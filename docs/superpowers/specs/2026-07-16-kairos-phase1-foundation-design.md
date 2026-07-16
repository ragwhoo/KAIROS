# Kairos — Phase 1: Foundation Design Spec

**Date:** 2026-07-16
**Product:** Kairos — Premium Student-Centric Learning & Productivity Platform
**Phase:** 1 — Foundation (Polished Shell)

---

## Product Vision

Kairos is a student-centric operating system that combines planning, productivity, note-taking, AI assistance, scheduling, analytics, learning, and gamification into one seamless experience. It replaces the fragmented workflow of Google Calendar, Notion, Todoist, Apple Notes, and ChatGPT with a single intelligent workspace.

Phase 1 builds the polished shell — the visual foundation, design system, folder structure, and reusable primitives that all subsequent phases build upon.

---

## Visual Design Philosophy

- Dark-first, cinematic aesthetic inspired by high-end AI products and modern gamified interfaces
- Black (`#000000`) background for premium, immersive feel
- Violet (`#7D39EB`) as the primary accent — communicates innovation, AI, creativity, intelligence
- Lime (`#C6FF33`) as secondary accent — energy, growth, achievement, gamification, success
- White (`#FFFFFF`) for typography — clean, readable, maximum contrast
- Every interaction feels alive: neon glows, animated gradients, glassmorphism, micro-interactions
- Tasteful motion — animation has purpose, improves usability, never distracts

---

## Architecture

### Deployment Model
- **Single deployable:** Next.js 14 App Router with API Routes
- **Hosting:** Vercel (serverless functions for API routes)
- **No authentication in Phase 1**

### Tech Stack
| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| UI Primitives | shadcn/ui (custom themed) |
| Animation | Framer Motion |
| State Management | Zustand |
| Font | Plus Jakarta Sans (400, 500, 600, 700, 800) |
| Database | Prisma ORM + PostgreSQL (Phase 2) |
| Charts | Recharts (Phase 4) |
| AI | OpenAI Responses API (Phase 3) |
| Dates | date-fns |

---

## Folder Structure

```
kairos/
├── app/                        # Next.js App Router
│   ├── (dashboard)/            # Dashboard layout group
│   │   ├── today/              # Route stub (Phase 2)
│   │   ├── overview/           # Route stub (Phase 4)
│   │   ├── calendar/           # Route stub (Phase 2)
│   │   └── tasks/              # Route stub (Phase 2)
│   ├── api/                    # Route handlers (Phase 2)
│   │   ├── tasks/
│   │   ├── notes/
│   │   └── subjects/
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                     # shadcn/ui primitives
│   └── features/               # Feature-specific components
├── features/                   # Isolated feature modules (Phase 2+)
│   ├── calendar/
│   ├── tasks/
│   ├── notes/
│   └── ai/
├── hooks/                      # Shared React hooks
├── lib/                        # Utilities & client config
├── services/                   # API service clients (Phase 2)
├── styles/                     # Global styles & design tokens
├── types/                      # Shared TypeScript types & Zod schemas
├── store/                      # Zustand stores
├── database/                   # Prisma schema & migrations (Phase 2)
└── prisma/                     # Prisma config (Phase 2)
```

---

## Color System

### Core Palette
| Color | Hex | Role |
|-------|-----|------|
| Black | `#000000` | Primary background, immersive canvas |
| Violet | `#7D39EB` | Primary accent, interactive elements, AI, branding |
| Lime | `#C6FF33` | Secondary accent, CTAs, XP, achievements, success, gamification |
| White | `#FFFFFF` | Typography, icons, high-contrast elements |

### Surface Hierarchy (Dark Mode)
| Surface | Value | Usage |
|---------|-------|-------|
| Page Background | `#000000` | Root level |
| Surface 1 | `rgba(255,255,255,0.04)` | Cards, task items, stat blocks |
| Surface 2 | `rgba(255,255,255,0.08)` | Elevated elements, hover states |
| Surface 3 | `rgba(255,255,255,0.12)` | Modals, dropdowns |
| Border | `rgba(255,255,255,0.06)` | Subtle dividers, card borders |
| Border Hover | `rgba(125,57,235,0.3)` | Interactive element borders on hover |

### Text Hierarchy
| Level | Color | Usage |
|-------|-------|-------|
| Primary | `#FFFFFF` | Headings, titles, nav labels |
| Secondary | `#999999` / `rgba(255,255,255,0.6)` | Body text, descriptions |
| Tertiary | `#666666` / `rgba(255,255,255,0.4)` | Captions, metadata, placeholders |

### Violet Shades
| Shade | Value | Usage |
|-------|-------|-------|
| 50 | `rgba(125,57,235,0.08)` | Subtle background, hover surfaces |
| 100 | `rgba(125,57,235,0.15)` | Tag backgrounds, selection states |
| 400 | `#9263F0` | Hover state for interactive elements |
| 500 | `#7D39EB` | Primary accent (base) |
| 600 | `#6A2FC8` | Active/pressed states |
| Glow | `rgba(125,57,235,0.3)` | Box-shadow, neon effects |

### Lime Shades
| Shade | Value | Usage |
|-------|-------|-------|
| 50 | `rgba(198,255,51,0.08)` | Subtle background, hover surfaces |
| 100 | `rgba(198,255,51,0.12)` | Tag backgrounds, XP indicators |
| 400 | `#D4FF5C` | Hover state |
| 500 | `#C6FF33` | Primary lime (base) |
| 600 | `#A8E00F` | Active/pressed |
| Glow | `rgba(198,255,51,0.3)` | Box-shadow, neon effects |

### Semantic Colors
| Role | Color | Purpose |
|------|-------|---------|
| Focus | `#7D39EB` | Primary activity, studying, active |
| Success/Done | `#C6FF33` | Completed tasks, streaks, achievements |
| Warning | `#FF9F0A` | Approaching deadlines, medium priority |
| Danger | `#FF3B5C` | Overdue, high priority, destructive actions |

---

## Typography

**Font:** Plus Jakarta Sans (Variable, weights 400–800)

| Element | Size | Weight | Letter Spacing | Line Height |
|---------|------|--------|----------------|-------------|
| Page Title / Greeting | 40–56px | 700 | -0.02em | 1.1 |
| Section Heading | 18–24px | 600 | -0.01em | 1.2 |
| Card Title | 15px | 600 | normal | 1.3 |
| Body | 14–15px | 400 | normal | 1.5 |
| Small / Caption | 11–12px | 500 | +0.01em | 1.4 |
| Tag / Label | 11px | 600 | +0.02em | 1.0 |

---

## Spacing

8px grid system. Key values: 8, 12, 16, 20, 24, 32, 40, 48, 64.

- Page padding: 24–32px (responsive)
- Card padding: 16–20px
- Section gap: 32px
- Element gap: 8–12px
- Stack gap: 16–24px

---

## Corner Radius

| Level | Value | Elements |
|-------|-------|----------|
| xs | 6px | Tags, small badges |
| sm | 8px | Checkboxes |
| md | 12–14px | Inputs, task cards |
| lg | 16px | Cards, stat blocks, buttons |
| xl | 20px | Glass panels, modals |
| full | 9999px | Level badges, avatar rings |

---

## Shadows & Glows

| Level | Value | Usage |
|-------|-------|-------|
| Card | `0 8px 24px rgba(125,57,235,0.12)` | Task cards on hover |
| Neon (violet) | `0 0 24px rgba(125,57,235,0.3)` | Primary buttons, active elements |
| Neon (lime) | `0 0 24px rgba(198,255,51,0.3)` | Gamified CTAs, XP elements |
| Glass | `inset 0 0 0 1px rgba(255,255,255,0.08)` | Glass panel borders |

---

## Layout Shell

### Navigation
- Sidebar (hidden on mobile, overlay on small screens)
- Dark surface, subtle border-right
- Violet active indicator
- Navigation items: Today, Overview, Calendar, Tasks, Notes, AI Assistant
- Bottom section: Level badge, XP bar, Settings

### Page Structure
- Full-width content area
- Max content width: 600–720px (reading-focused)
- Centered layout on large screens
- Generous whitespace throughout

### Key UI Patterns

**Greeting Header:** Large typography with gradient accent on the greeting word (Violet → Lime)

**Level/XP Bar:** Compact bar at top of dashboard. Level badge (avatar ring style with gradient + level number), progress track (violet→lime gradient), XP text in lime.

**AI Widget:** Glass-styled card with violet border, gradient background, pulsing indicator dot, suggestion text, action buttons (violet secondary, lime CTA). Subtle radial gradient glow overlay.

**Stat Cards:** Subtle white surface (`rgba(255,255,255,0.04)`), border, label, value. Lime for gamified stats (XP, streak), violet for academic stats.

**CTA Buttons:** Full-width row of 2-3 large buttons. Primary (violet gradient), Gamified (lime gradient), Secondary (subtle surface).

**Task Cards:** Left-accent border (semantic color), row layout, custom checkbox (lime on completion), priority tag (colored), subject tag, metadata row (attachments, time estimate, due date), optional progress bar (violet→lime gradient, or solid for urgent).

**Glass Panel:** Larger content containers with backdrop-filter blur, subtle border, used for insights, weekly stats.

---

## Component Primitives (Phase 1 Deliverables)

### shadcn/ui Components to Customize
- Button (3 variants: primary/violet gradient, gamified/lime, secondary/ghost)
- Card (with and without glass variant)
- Input (dark theme, violet focus ring)
- Dialog/Sheet (glass overlay, violet accent)
- Badge/Tag (4 semantic variants: focus, success/lime, warning, danger)
- Avatar (with gradient ring variant)
- Progress (gradient bar)
- Separator
- Checkbox (custom violet focus, lime checked)
- Select (dark theme)

### Custom Components
- GreetingHeader
- XPBar (level badge + progress)
- AIWidget
- StatCard
- CTARow
- TaskCard (with progress, tags, metadata)
- AddTaskButton
- GlassPanel
- Sidebar (with user section, nav items, XP footer)
- PriorityTag
- SubjectTag



---

## Animation Principles

- **Duration:** 150–200ms for micro-interactions, 300ms for transitions
- **Easing:** ease-out for enter, ease-in for exit
- **Hover:** translateY(-1px), subtle glow, border color shift
- **Page transitions:** Fade + slight scale (Framer Motion AnimatePresence)
- **Task completion:** Checkmark animation, card fade to reduced opacity
- **XP counter:** Animated number count-up
- **AI pulse:** Gentle opacity pulse on indicator dot (2s cycle)
- **Gradient animation:** Subtle shifting on gradient backgrounds (optional, sparingly)

---

## Phase 1 Scope Summary

**In scope:**
- Next.js project scaffold with TypeScript
- Tailwind CSS configuration with custom theme tokens
- Plus Jakarta Sans font integration
- shadcn/ui setup with dark theme customization
- All reusable UI primitives (buttons, cards, inputs, tags, etc.)
- Layout shell with sidebar navigation
- Dashboard page with greeting, XP bar, AI widget, stats, task list
- Placeholder pages for route stubs (Phase 2+ pages show "Coming Soon" state)
- Framer Motion animations and transitions
- Dark mode only (light mode deferred)

**Out of scope (Phase 2):**
- Database and Prisma schema
- API routes
- Authentication
- Calendar functionality
- Task persistence
- Notes system
- Attachments

---

## Design Decisions Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Dark-first | Black bg | Premium, cinematic, immersive for students; reduces eye strain |
| Accent color | Violet (#7D39EB) | Communicates AI, creativity, intelligence; stands out from blue-dominated competitors |
| Gamification accent | Lime (#C6FF33) | High energy, visible on dark, distinct from violet; creates clear visual hierarchy |
| Font | Plus Jakarta Sans | Modern, geometric, highly readable; variable weights give flexibility |
| Glassmorphism | Selective | Used only for AI widget and insights panels — adds depth without clutter |
| Gradient usage | Controlled | Violet→Lime gradients only on accent elements (not on text or surfaces) |
| No Auth | Deferred | Keeps Phase 1 focused on visual shell and design system |

---

## Future Phases (Overview)

1. **Phase 2 — Core Engine:** Calendar, Tasks, Notes, Attachments, Today View with DB persistence
2. **Phase 3 — AI Layer:** Natural language scheduling, exam planner, daily reflection, smart rescheduling
3. **Phase 4 — Analytics:** XP, levels, achievements, heatmaps, graphs, progress tracking
4. **Phase 5 — Gamification:** Full achievement system, streaks, daily/weekly challenges
5. **Phase 6 — Polish:** Accessibility, responsiveness, performance, loading/error/empty states, dark mode refinements
