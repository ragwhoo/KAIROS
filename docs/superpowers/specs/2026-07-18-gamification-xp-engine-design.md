# Phase 4: Progress Engine — Gamification & XP System

**Date:** 2026-07-18
**Status:** Approved Design
**Stack:** Next.js 16, Prisma 7, Neon PostgreSQL, GSAP, Framer Motion 12, Zustand, SWR

---

## Overview

Transform Kairos into a gamified student operating system with XP, levels, streaks, achievements, daily missions, focus sessions, and analytics. Every action feels rewarding. Design language stays minimal/premium — no cartoon UI, no childish graphics.

---

## Architecture

### New Files

| File | Purpose |
|------|---------|
| `lib/xp.ts` | Central XP engine — awardXP, calculateLevel, getXPForNextLevel |
| `lib/streak.ts` | Streak helpers — updateStreak, getStreakStatus |
| `lib/achievements.ts` | Achievement definitions, unlock logic, achievement registry |
| `lib/missions.ts` | Daily mission generation from tasks/events/AI |
| `lib/ranks.ts` | Student rank definitions and XP thresholds |
| `hooks/use-progress.ts` | SWR hook for UserProgress data |
| `hooks/use-achievements.ts` | SWR hook for achievements |
| `hooks/use-missions.ts` | SWR hook for daily missions |
| `hooks/use-focus-sessions.ts` | SWR hook for focus session logs |
| `components/features/profile-card.tsx` | Dashboard XP/level/streak widget |
| `components/features/xp-animation.tsx` | GSAP floating "+XP" animation overlay |
| `components/features/daily-missions.tsx` | Daily mission cards on dashboard |
| `components/features/achievement-card.tsx` | Unlockable achievement display |
| `components/features/achievement-unlock.tsx` | Animated unlock notification |
| `components/features/heatmap.tsx` | GitHub-style 365-day productivity SVG heatmap |
| `components/features/focus-session.tsx` | Pomodoro timer modal (25/50/90 min presets) |
| `components/features/skill-tree.tsx` | Category progress bars for skill areas |
| `components/features/weekly-report.tsx` | AI-generated weekly summary card |
| `components/features/reflection-modal.tsx` | End-of-day reflection modal |
| `components/features/stats-section.tsx` | Enhanced dashboard stats section |
| `app/api/progress/route.ts` | GET/POST UserProgress |
| `app/api/xp/route.ts` | POST award XP, GET XP history |
| `app/api/achievements/route.ts` | GET/POST achievements |
| `app/api/missions/route.ts` | GET missions for today |
| `app/api/focus-sessions/route.ts` | CRUD focus sessions |
| `app/api/reflections/route.ts` | CRUD reflections |

### New Prisma Models

```prisma
model UserProgress {
  id               String   @id @default(cuid())
  level            Int      @default(1)
  xp               Int      @default(0)
  currentStreak    Int      @default(0)
  longestStreak    Int      @default(0)
  totalTasks       Int      @default(0)
  totalNotes       Int      @default(0)
  totalFocusMinutes Int     @default(0)
  totalAIChats     Int      @default(0)
  lastActiveDate   DateTime?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

model XPEvent {
  id        String   @id @default(cuid())
  source    String   // "task", "note", "focus", "streak", "achievement", "chat", "mission"
  amount    Int
  reason    String
  createdAt DateTime @default(now())
}

model Achievement {
  id          String   @id @default(cuid())
  key         String   @unique
  title       String
  description String
  icon        String
  unlockedAt  DateTime?
  createdAt   DateTime @default(now())
}

model DailyMission {
  id        String   @id @default(cuid())
  title     String
  xpReward  Int
  completed Boolean  @default(false)
  date      DateTime @default(now())
  createdAt DateTime @default(now())
}

model FocusSession {
  id         String   @id @default(cuid())
  duration   Int      // minutes
  startedAt  DateTime
  completed  Boolean  @default(false)
  createdAt  DateTime @default(now())
}

model Reflection {
  id        String   @id @default(cuid())
  wentWell  String
  distraction String?
  improve   String
  insight   String?
  date      DateTime @unique
  createdAt DateTime @default(now())
}
```

### Zustand Store Additions

Extend `useDashboardStore` with live XP, level, streak, and achievement state alongside existing fields.

---

## Feature Details

### 1. XP Engine (`lib/xp.ts`)

Exports:
- `awardXP(source, amount, reason)` — records XPEvent, updates UserProgress, recalculates level
- `calculateLevel(xp)` — returns level number based on exponential curve
- `getXPForNextLevel(level)` — returns XP required for next level
- `getXPProgress(xp)` — returns { current, required, percentage }

Exponential level curve:
- Level 1: 0 XP
- Level 2: 120 XP
- Level 3: 300 XP
- Level 4: 620 XP
- Level 5: 1,100 XP
- Level N: `XP_LEVELS[n-1]`

XP awards (configurable in lib/xp.ts):
- Task completed: +15 XP
- High-priority task: +35 XP
- Calendar event finished: +20 XP
- Note created: +10 XP
- Focus session completed: +40 XP
- 7-day streak: +150 XP
- AI conversation: +15 XP

### 2. Level System

Exponential growth (not linear). Implemented as a lookup table with formula fallback.

Ranks mapped to levels:
- Level 1-2: Freshman
- Level 3-4: Learner
- Level 5-6: Scholar
- Level 7-8: Achiever
- Level 9-10: Elite
- Level 11-12: Master
- Level 13-14: Legend
- Level 15+: Kairos

### 3. XP Animations

When XP is earned, a floating "+15 XP" element animates upward with GSAP:
1. Spawn at the element that triggered the XP
2. Scale up slightly, fade in
3. Move upward ~60px over 900ms
4. Fade out at the top
5. Progress bar fills with a tiny pulse

Non-blocking — uses GSAP on a portal/overlay container.

### 4. Profile Card (`components/features/profile-card.tsx`)

Dashboard widget showing:
- Current Level (large, gradient number)
- XP progress bar (from Progress component)
- "1,350 / 1,700 XP" counter
- Daily streak with fire icon
- Current rank badge

Replaces the hardcoded stat cards. Mounted in `page.tsx` dashboard.

### 5. Daily Streak (`lib/streak.ts`)

Rules:
- Complete at least one productive activity per day
- Missing one day consumes a freeze (not implemented yet — future)
- Missing two days breaks streak
- Streak freeze item: future purchasable/achievement

Helper functions:
- `updateStreak()` — checks lastActiveDate against today, increments or resets
- `getStreakStatus()` — returns { current, longest, atRisk, daysUntilReset }

### 6. Achievements (`lib/achievements.ts`)

Achievement definitions with unlock conditions checked on each XP event:

| Key | Title | Condition |
|-----|-------|-----------|
| `first_task` | First Steps | Complete 1 task |
| `ten_tasks` | Getting Things Done | Complete 10 tasks |
| `hundred_tasks` | Task Master | Complete 100 tasks |
| `first_chat` | AI Explorer | First AI chat |
| `ten_notes` | Note Taker | Create 10 notes |
| `hundred_notes` | Knowledge Base | Create 100 notes |
| `week_streak` | Weekly Warrior | 7-day streak |
| `month_streak` | Unstoppable | 30-day streak |
| `semester_survivor` | Semester Survivor | 100 tasks + 90% consistency |
| `night_owl` | Night Owl | Complete 5 tasks after 10 PM |
| `early_bird` | Early Bird | Complete 5 tasks before 8 AM |
| `focus_master` | Focus Master | 10 hours of focus sessions |

Unlock detection: After each XP award, check if any locked achievement conditions are met. If so, mark `unlockedAt` and trigger animation.

### 7. Daily Missions (`lib/missions.ts`)

Every morning (or on first page load), generate 3–6 missions based on:
- Today's tasks (due today)
- Calendar events
- AI recommendations

Missions are stored in DB with a date scope. Completed missions award XP.

Types:
- "Finish [task title]" — +40 XP
- "Attend [class name]" — +20 XP
- "Review notes" — +30 XP
- "Complete all missions today" — +100 bonus XP

### 8. Productivity Heatmap (`components/features/heatmap.tsx`)

GitHub-style SVG heatmap showing past 365 days.
- Each cell = one day, color intensity based on XP earned
- Responsive (scrolls horizontally on mobile)
- Hover tooltip: date, XP earned, tasks completed
- Color scale: empty (surface-1) → low (violet-100) → medium (violet) → high (lime)
- No external chart library — pure SVG

### 9. Skill Tree (`components/features/skill-tree.tsx`)

AI auto-classifies tasks into categories:
- Programming, Fitness, Reading, Writing, Career, Design, Communication

Each category shows a progress bar based on completed tasks tagged to it.

Classification: AI tool call in the chat system assigns a `category` field. Stored per task. For now, tasks with `subject` field map to closest category.

### 10. Focus Session (`components/features/focus-session.tsx`)

Pomodoro-style timer modal:
- 25 / 50 / 90 minute presets
- Full-screen minimal mode with timer, pause/resume, cancel
- Completion awards +40 XP
- Logged to FocusSession model
- Keyboard shortcut to invoke

### 11. Weekly Report

Generated every Sunday via AI:
- Reads task/note/event/focus data from past 7 days
- Generates summary card with stats + personalized recommendation
- Stored in DB, shown on dashboard

### 12. End of Day Reflection

Modal triggered when user appears idle or at a configurable time:
- Questions: "What went well?", "What distracted you?", "What will you improve tomorrow?"
- AI generates a short insight from the reflection text
- Stored in Reflection model

### 13. Dashboard Improvements

Enhanced dashboard layout:
- Welcome section (existing GreetingHeader)
- Profile Card (XP/level/streak)
- Daily Missions
- Recent Achievements (latest 3)
- Task list (existing)
- Schedule (existing)
- Heatmap preview (current month only as preview strip)
- Everything responsive, no clutter

### 14. Student Ranks

| Rank | Level Range | XP Required |
|------|-------------|-------------|
| Freshman | 1-2 | 0-299 |
| Learner | 3-4 | 300-619 |
| Scholar | 5-6 | 620-1,099 |
| Achiever | 7-8 | 1,100-1,999 |
| Elite | 9-10 | 2,000-3,499 |
| Master | 11-12 | 3,500-5,499 |
| Legend | 13-14 | 5,500-8,499 |
| Kairos | 15+ | 8,500+ |

---

## Integration Points

### Existing Files to Modify

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add 6 new models |
| `store/use-dashboard-store.ts` | Add live gamification state (or remove hardcoded fields if migrating to API) |
| `app/(dashboard)/page.tsx` | Integrate profile card, missions, heatmap preview, achievements |
| `app/(dashboard)/layout.tsx` | XP bar in sidebar reads from API instead of hardcoded values |
| `app/(dashboard)/layout.tsx` | Mobile nav overlay XP bar reads from API |
| `app/(dashboard)/overview/page.tsx` | Replace ComingSoon with full analytics dashboard |
| `components/features/task-card.tsx` | Wire task completion to awardXP |
| `components/features/xp-bar.tsx` | Read live data from useProgress hook |
| `components/features/ai-widget.tsx` | May feed into daily mission generation |
| `features/layout/sidebar.tsx` | XP bar reads from useProgress |
| `app/api/chat/route.ts` | AI generates missions, weekly reports, reflection insights |

### No Breaking Changes

- All existing API routes remain untouched
- Existing models unchanged (only additive)
- Existing components remain functional, new ones sit alongside

---

## Performance Considerations

- Heatmap: SVG only, no canvas. DOM stays light (365 rects + tooltip overlay). Virtualize on mobile.
- XP animations: GSAP on a portal div. Max 3 concurrent animations. Oldest gets culled if queue exceeds.
- Weekly report: Generated lazily on first Sunday visit, cached for the day.
- Focus session: Single component, modal pattern (mounted only when active).
- SWR for all data fetching with appropriate stale times.
- Lazy load heavy components (heatmap, focus session, reflection modal) with next/dynamic.

---

## Implementation Order

1. Prisma models + migration
2. XP engine (`lib/xp.ts`)
3. Streak engine (`lib/streak.ts`)
4. API routes for progress, XP, achievements, missions, focus
5. SWR hooks
6. Integrate XP into existing actions (task completion, note creation)
7. Profile Card widget
8. XP animations
9. Daily Missions
10. Achievements engine + unlock detection
11. Productivity Heatmap
12. Skill Tree
13. Focus Session
14. Dashboard improvements
15. Weekly Report
16. End of Day Reflection
17. Overview page analytics
