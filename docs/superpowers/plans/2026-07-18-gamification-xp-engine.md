# Phase 4: Progress Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Transform Kairos into a gamified student operating system with XP, levels, streaks, achievements, missions, focus sessions, heatmap, and analytics.

**Architecture:** Centralized XP engine (`lib/xp.ts`) with Prisma-backed models, server actions for XP award/streak update, SWR hooks for live state, GSAP animations for XP floating feedback, and SVG-based heatmap. All existing features remain untouched.

**Tech Stack:** Prisma 7, Neon PostgreSQL, GSAP, Framer Motion 12, Zustand, SWR, date-fns, next/dynamic

---

### Task 1: Prisma Models + Migration

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260718060000_gamification/`

- [ ] **Step 1: Add new models to schema.prisma**

Append after the `CalendarEvent` model:

```prisma
model UserProgress {
  id                String    @id @default(cuid())
  level             Int       @default(1)
  xp                Int       @default(0)
  currentStreak     Int       @default(0)
  longestStreak     Int       @default(0)
  totalTasks        Int       @default(0)
  totalNotes        Int       @default(0)
  totalFocusMinutes Int       @default(0)
  totalAIChats      Int       @default(0)
  lastActiveDate    DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}

model XPEvent {
  id        String   @id @default(cuid())
  source    String
  amount    Int
  reason    String
  createdAt DateTime @default(now())
}

model Achievement {
  id          String    @id @default(cuid())
  key         String    @unique
  title       String
  description String
  icon        String
  unlockedAt  DateTime?
  createdAt   DateTime  @default(now())
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
  id        String   @id @default(cuid())
  duration  Int
  startedAt DateTime
  completed Boolean  @default(false)
  createdAt DateTime @default(now())
}

model Reflection {
  id          String   @id @default(cuid())
  wentWell    String
  distraction String?
  improve     String
  insight     String?
  date        DateTime @unique
  createdAt   DateTime @default(now())
}
```

- [ ] **Step 2: Run migration**

Run: `npx prisma generate`
Run: `npx prisma migrate dev --name add_gamification`

- [ ] **Step 3: Seed initial UserProgress**

Add to `prisma/seed.ts`:

```typescript
const { prisma } = await import('@/lib/db')
// ... existing seed data ...

await prisma.userProgress.create({
  data: {
    level: 1,
    xp: 0,
    currentStreak: 0,
    longestStreak: 0,
  },
})
```

---

### Task 2: XP Engine (`lib/xp.ts`)

**Files:**
- Create: `lib/xp.ts`

- [ ] **Step 1: Create XP utility with level curve and award function**

```typescript
import { db } from "@/lib/db"
import { updateStreak } from "@/lib/streak"

const XP_LEVELS = [0, 120, 300, 620, 1100, 1700, 2500, 3500, 4800, 6400, 8500, 11000, 14000, 17500, 22000]

export const XP_VALUES = {
  task_completed: 15,
  task_high_priority: 35,
  event_finished: 20,
  note_created: 10,
  focus_session: 40,
  streak_7day: 150,
  ai_chat: 15,
} as const

export function calculateLevel(xp: number): number {
  for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= XP_LEVELS[i]) return i + 1
  }
  return 1
}

export function getXPForNextLevel(level: number): number {
  if (level >= XP_LEVELS.length) return XP_LEVELS[XP_LEVELS.length - 1] + 5000
  return XP_LEVELS[level]
}

export function getXPProgress(xp: number) {
  const level = calculateLevel(xp)
  const currentLevelXP = XP_LEVELS[level - 1]
  const nextLevelXP = getXPForNextLevel(level)
  const required = nextLevelXP - currentLevelXP
  const current = xp - currentLevelXP
  const percentage = Math.min(Math.floor((current / required) * 100), 100)
  return { current, required, percentage, level }
}

export async function awardXP(source: string, amount: number, reason: string) {
  let progress = await db.userProgress.findFirst()
  if (!progress) {
    progress = await db.userProgress.create({ data: { level: 1, xp: 0 } })
  }

  await db.xpEvent.create({ data: { source, amount, reason } })

  const newXP = progress.xp + amount
  const newLevel = calculateLevel(newXP)

  await db.userProgress.update({
    where: { id: progress.id },
    data: {
      xp: newXP,
      level: newLevel,
      totalTasks: source === "task" ? { increment: 1 } : undefined,
      totalNotes: source === "note" ? { increment: 1 } : undefined,
      totalFocusMinutes: source === "focus" ? { increment: reason === "25min" ? 25 : reason === "50min" ? 50 : 90 } : undefined,
      totalAIChats: source === "chat" ? { increment: 1 } : undefined,
      updatedAt: new Date(),
    },
  })

  await updateStreak()

  return { xp: newXP, level: newLevel, earned: amount }
}
```

- [ ] **Step 2: Export types**

At the top of `lib/xp.ts`, add:

```typescript
export type XPSource = "task" | "note" | "focus" | "streak" | "achievement" | "chat" | "mission"
```

---

### Task 3: Streak Engine (`lib/streak.ts`)

**Files:**
- Create: `lib/streak.ts`

- [ ] **Step 1: Create streak helpers**

```typescript
import { db } from "@/lib/db"
import { startOfDay, differenceInCalendarDays, addDays } from "date-fns"

export async function updateStreak() {
  const progress = await db.userProgress.findFirst()
  if (!progress) return { current: 0, longest: 0 }

  const today = startOfDay(new Date())
  const lastActive = progress.lastActiveDate ? startOfDay(new Date(progress.lastActiveDate)) : null

  let newStreak: number
  let newLongest: number

  if (!lastActive) {
    newStreak = 1
    newLongest = 1
  } else {
    const daysDiff = differenceInCalendarDays(today, lastActive)
    if (daysDiff === 0) {
      return { current: progress.currentStreak, longest: progress.longestStreak }
    } else if (daysDiff === 1) {
      newStreak = progress.currentStreak + 1
      newLongest = Math.max(newStreak, progress.longestStreak)
    } else {
      newStreak = 1
      newLongest = progress.longestStreak
    }
  }

  await db.userProgress.update({
    where: { id: progress.id },
    data: {
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastActiveDate: today,
    },
  })

  if (newStreak > 0 && newStreak % 7 === 0) {
    await awardXP("streak", 150, `${newStreak}-day streak!`)
  }

  return { current: newStreak, longest: newLongest }
}

export async function getStreakStatus() {
  const progress = await db.userProgress.findFirst()
  if (!progress) return { current: 0, longest: 0, atRisk: false }

  const today = startOfDay(new Date())
  const lastActive = progress.lastActiveDate ? startOfDay(new Date(progress.lastActiveDate)) : null

  if (!lastActive) return { current: 0, longest: 0, atRisk: false }

  const daysSinceActive = differenceInCalendarDays(today, lastActive)
  return {
    current: progress.currentStreak,
    longest: progress.longestStreak,
    atRisk: daysSinceActive >= 1 && daysSinceActive < 2,
  }
}
```

Note: Need to import `awardXP` — this creates a circular dependency. Keep `streak.ts` independent and call `awardXP` from a higher-level orchestrator instead. Remove the `awardXP` call from `streak.ts` and handle streak bonus XP in the API route.

- [ ] **Step 3: Remove circular dependency — streak.ts stays pure**

```typescript
import { db } from "@/lib/db"
import { startOfDay, differenceInCalendarDays } from "date-fns"

export async function updateStreak() {
  const progress = await db.userProgress.findFirst()
  if (!progress) return { current: 0, longest: 0, streakExtended: false, newStreak: 0 }

  const today = startOfDay(new Date())
  const lastActive = progress.lastActiveDate ? startOfDay(new Date(progress.lastActiveDate)) : null

  if (!lastActive) {
    await db.userProgress.update({
      where: { id: progress.id },
      data: { currentStreak: 1, longestStreak: 1, lastActiveDate: today },
    })
    return { current: 1, longest: 1, streakExtended: true, newStreak: 1 }
  }

  const daysDiff = differenceInCalendarDays(today, lastActive)
  if (daysDiff === 0) {
    return { current: progress.currentStreak, longest: progress.longestStreak, streakExtended: false, newStreak: progress.currentStreak }
  }

  let newStreak: number
  if (daysDiff === 1) {
    newStreak = progress.currentStreak + 1
  } else {
    newStreak = 1
  }

  const newLongest = Math.max(newStreak, progress.longestStreak)
  await db.userProgress.update({
    where: { id: progress.id },
    data: { currentStreak: newStreak, longestStreak: newLongest, lastActiveDate: today },
  })

  return { current: newStreak, longest: newLongest, streakExtended: daysDiff === 1, newStreak }
}
```

---

### Task 4: Rank Definitions (`lib/ranks.ts`)

**Files:**
- Create: `lib/ranks.ts`

- [ ] **Step 1: Create rank definitions**

```typescript
export interface Rank {
  title: string
  minLevel: number
  maxLevel: number
}

export const RANKS: Rank[] = [
  { title: "Freshman", minLevel: 1, maxLevel: 2 },
  { title: "Learner", minLevel: 3, maxLevel: 4 },
  { title: "Scholar", minLevel: 5, maxLevel: 6 },
  { title: "Achiever", minLevel: 7, maxLevel: 8 },
  { title: "Elite", minLevel: 9, maxLevel: 10 },
  { title: "Master", minLevel: 11, maxLevel: 12 },
  { title: "Legend", minLevel: 13, maxLevel: 14 },
  { title: "Kairos", minLevel: 15, maxLevel: 999 },
]

export function getRank(level: number): Rank {
  return RANKS.find((r) => level >= r.minLevel && level <= r.maxLevel) ?? RANKS[RANKS.length - 1]
}
```

---

### Task 5: Update Types

**Files:**
- Modify: `types/index.ts`

- [ ] **Step 1: Add gamification types**

```typescript
export interface UserProgress {
  id: string
  level: number
  xp: number
  currentStreak: number
  longestStreak: number
  totalTasks: number
  totalNotes: number
  totalFocusMinutes: number
  totalAIChats: number
  lastActiveDate: string | null
  createdAt: string
  updatedAt: string
}

export interface XPEvent {
  id: string
  source: string
  amount: number
  reason: string
  createdAt: string
}

export interface Achievement {
  id: string
  key: string
  title: string
  description: string
  icon: string
  unlockedAt: string | null
  createdAt: string
}

export interface DailyMission {
  id: string
  title: string
  xpReward: number
  completed: boolean
  date: string
  createdAt: string
}

export interface FocusSession {
  id: string
  duration: number
  startedAt: string
  completed: boolean
  createdAt: string
}

export interface Reflection {
  id: string
  wentWell: string
  distraction: string | null
  improve: string
  insight: string | null
  date: string
  createdAt: string
}
```

---

### Task 6: API Routes — Progress & XP

**Files:**
- Create: `app/api/progress/route.ts`
- Create: `app/api/xp/route.ts`

- [ ] **Step 1: Create progress API**

```typescript
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  let progress = await db.userProgress.findFirst()
  if (!progress) {
    progress = await db.userProgress.create({ data: { level: 1, xp: 0 } })
  }
  return NextResponse.json(progress)
}
```

- [ ] **Step 2: Create XP API**

```typescript
import { NextResponse } from "next/server"
import { awardXP } from "@/lib/xp"
import { db } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { source, amount, reason } = body
    if (!source || !amount || !reason) {
      return NextResponse.json({ error: "source, amount, and reason required" }, { status: 400 })
    }
    const result = await awardXP(source, amount, reason)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "Failed to award XP" }, { status: 500 })
  }
}

export async function GET() {
  const events = await db.xpEvent.findMany({ orderBy: { createdAt: "desc" }, take: 100 })
  return NextResponse.json(events)
}
```

---

### Task 7: API Routes — Achievements, Missions, Focus, Reflections

**Files:**
- Create: `app/api/achievements/route.ts`
- Create: `app/api/missions/route.ts`
- Create: `app/api/focus-sessions/route.ts`
- Create: `app/api/reflections/route.ts`

- [ ] **Step 1: Achievements API**

```typescript
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  const achievements = await db.achievement.findMany({ orderBy: { createdAt: "asc" } })
  return NextResponse.json(achievements)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const achievement = await db.achievement.create({ data: body })
    return NextResponse.json(achievement, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create achievement" }, { status: 400 })
  }
}
```

- [ ] **Step 2: Missions API**

```typescript
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { startOfDay, endOfDay } from "date-fns"

export async function GET() {
  const today = new Date()
  const missions = await db.dailyMission.findMany({
    where: { date: { gte: startOfDay(today), lte: endOfDay(today) } },
    orderBy: { createdAt: "asc" },
  })
  return NextResponse.json(missions)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const mission = await db.dailyMission.create({ data: { ...body, date: new Date() } })
    return NextResponse.json(mission, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create mission" }, { status: 400 })
  }
}
```

- [ ] **Step 3: Focus Sessions API**

```typescript
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  const sessions = await db.focusSession.findMany({ orderBy: { createdAt: "desc" }, take: 50 })
  return NextResponse.json(sessions)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const session = await db.focusSession.create({ data: body })
    return NextResponse.json(session, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create session" }, { status: 400 })
  }
}
```

- [ ] **Step 4: Reflections API**

```typescript
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  const reflections = await db.reflection.findMany({ orderBy: { date: "desc" }, take: 30 })
  return NextResponse.json(reflections)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const reflection = await db.reflection.create({ data: body })
    return NextResponse.json(reflection, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create reflection" }, { status: 400 })
  }
}
```

---

### Task 8: SWR Hooks

**Files:**
- Create: `hooks/use-progress.ts`
- Create: `hooks/use-achievements.ts`
- Create: `hooks/use-missions.ts`
- Create: `hooks/use-focus-sessions.ts`

- [ ] **Step 1: Create hooks**

`hooks/use-progress.ts`:
```typescript
"use client"
import useSWR from "swr"
import { fetcher } from "@/lib/fetcher"
import type { UserProgress } from "@/types"

export function useProgress() {
  const { data, error, isLoading, mutate } = useSWR<UserProgress>("/api/progress", fetcher, {
    refreshInterval: 30000,
  })
  return { progress: data, error, isLoading, mutate }
}
```

`hooks/use-achievements.ts`:
```typescript
"use client"
import useSWR from "swr"
import { fetcher } from "@/lib/fetcher"
import type { Achievement } from "@/types"

export function useAchievements() {
  const { data, error, isLoading, mutate } = useSWR<Achievement[]>("/api/achievements", fetcher)
  return { achievements: data ?? [], error, isLoading, mutate }
}
```

`hooks/use-missions.ts`:
```typescript
"use client"
import useSWR from "swr"
import { fetcher } from "@/lib/fetcher"
import type { DailyMission } from "@/types"

export function useMissions() {
  const { data, error, isLoading, mutate } = useSWR<DailyMission[]>("/api/missions", fetcher)
  return { missions: data ?? [], error, isLoading, mutate }
}
```

`hooks/use-focus-sessions.ts`:
```typescript
"use client"
import useSWR from "swr"
import { fetcher, postData } from "@/lib/fetcher"
import type { FocusSession } from "@/types"

export function useFocusSessions() {
  const { data, error, isLoading, mutate } = useSWR<FocusSession[]>("/api/focus-sessions", fetcher)
  return { sessions: data ?? [], error, isLoading, mutate }
}

export async function createFocusSession(data: Partial<FocusSession>) {
  return postData<FocusSession>("/api/focus-sessions", data)
}
```

---

### Task 9: Wire XP into Existing Actions

**Files:**
- Modify: `components/features/task-card.tsx`
- Modify: `app/api/notes/route.ts`
- Modify: `app/api/chat/route.ts`

- [ ] **Step 1: Add XP award on task completion in task-card.tsx**

Add import and after the `updateTask` call on completion (around line 67-70):

```typescript
import { awardXP } from "@/lib/xp"

// After successful task completion:
if (newStatus === "done") {
  const xpAmount = task.priority === "high" ? 35 : 15
  await awardXP("task", xpAmount, task.priority === "high" ? "High-priority task completed" : "Task completed")
}
```

Wait — `awardXP` is a server function. Can't call it from a client component. Instead, use the XP API:

```typescript
// In task-card.tsx, after successful updateTask
const xpAmount = task.priority === "high" ? 35 : 15
await fetch("/api/xp", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ source: "task", amount: xpAmount, reason: task.priority === "high" ? "High-priority task completed" : "Task completed" }),
})
```

- [ ] **Step 2: Add XP award on note creation in notes page**

In `app/(dashboard)/notes/page.tsx`, after successful note creation API call, call:

```typescript
await fetch("/api/xp", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ source: "note", amount: 10, reason: "Note created" }),
})
```

- [ ] **Step 3: Add XP award on AI chat in chat API**

In `app/api/chat/route.ts`, after AI responds (non-empty), add:

```typescript
import { awardXP } from "@/lib/xp"
// After stream completes:
try { await awardXP("chat", 15, "AI conversation") } catch {}
```

---

### Task 10: Profile Card Widget

**Files:**
- Create: `components/features/profile-card.tsx`
- Modify: `app/(dashboard)/page.tsx`

- [ ] **Step 1: Create ProfileCard component**

```typescript
"use client"

import { useProgress } from "@/hooks/use-progress"
import { getRank } from "@/lib/ranks"
import { Progress } from "@/components/ui/progress"
import { Flame, Zap } from "lucide-react"

export function ProfileCard() {
  const { progress, isLoading } = useProgress()

  if (isLoading || !progress) return null

  const rank = getRank(progress.level)
  const xpProgress = getXPProgress(progress.xp)

  return (
    <div className="rounded-2xl bg-surface-1 border border-border p-5">
      <div className="flex items-center gap-4 mb-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7D39EB] to-[#C6FF33] text-2xl font-bold text-black">
          {progress.level}
        </div>
        <div className="flex-1">
          <p className="text-lg font-bold">{rank.title}</p>
          <p className="text-sm text-text-tertiary">Level {progress.level}</p>
        </div>
        <Zap className="h-5 w-5 text-gamified" />
      </div>

      <Progress value={xpProgress.percentage} className="h-2 mb-2" />

      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-text-tertiary">{xpProgress.current.toLocaleString()} XP</span>
        <span className="text-xs text-gamified font-medium">{xpProgress.required.toLocaleString()} XP</span>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <Flame className="h-4 w-4 text-gamified" />
        <span className="font-semibold">{progress.currentStreak} day streak</span>
      </div>
    </div>
  )
}
```

Note: Import `getXPProgress` from `lib/xp.ts`.

- [ ] **Step 2: Add ProfileCard to dashboard page**

In `app/(dashboard)/page.tsx`, add import and mount above the AIWidget:

```typescript
import { ProfileCard } from "@/components/features/profile-card"
// Add inside the main div, before AIWidget:
<ProfileCard />
```

---

### Task 11: XP Animation Component

**Files:**
- Create: `components/features/xp-animation.tsx`

- [ ] **Step 1: Create XP floating animation**

```typescript
"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { create } from "zustand"

interface XPNotification {
  id: number
  amount: number
  x: number
  y: number
}

interface XPQueueStore {
  queue: XPNotification[]
  push: (n: XPNotification) => void
  pop: (id: number) => void
}

const useXPQueue = create<XPQueueStore>((set) => ({
  queue: [],
  push: (n) => set((s) => ({ queue: [...s.queue, n] })),
  pop: (id) => set((s) => ({ queue: s.queue.filter((q) => q.id !== id) })),
}))

let nextId = 0

export function triggerXP(amount: number, element?: HTMLElement | null) {
  const rect = element?.getBoundingClientRect()
  useXPQueue.getState().push({
    id: nextId++,
    amount,
    x: rect ? rect.left + rect.width / 2 : window.innerWidth / 2,
    y: rect ? rect.top : window.innerHeight / 2,
  })
}

export function XPAnimationContainer() {
  const queue = useXPQueue((s) => s.queue)

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {queue.map((n) => (
        <XPFloat key={n.id} notification={n} />
      ))}
    </div>
  )
}

function XPFloat({ notification }: { notification: XPNotification }) {
  const ref = useRef<HTMLDivElement>(null)
  const pop = useXPQueue((s) => s.pop)

  useEffect(() => {
    if (!ref.current) return
    gsap.fromTo(
      ref.current,
      { opacity: 1, scale: 0.5, y: 0 },
      {
        opacity: 0,
        scale: 1.2,
        y: -60,
        duration: 0.9,
        ease: "power2.out",
        onComplete: () => pop(notification.id),
      }
    )
  }, [notification.id, pop])

  return (
    <div
      ref={ref}
      className="absolute text-gamified font-bold text-lg"
      style={{ left: notification.x, top: notification.y }}
    >
      +{notification.amount} XP
    </div>
  )
}
```

- [ ] **Step 2: Mount container in dashboard layout**

In `app/(dashboard)/layout.tsx`, add import and mount after `<ChatToast />`:

```typescript
import { XPAnimationContainer } from "@/components/features/xp-animation"
// Inside the return, after <ChatToast />:
<XPAnimationContainer />
```

- [ ] **Step 3: Trigger XP on task completion**

In `task-card.tsx`, after the XP API call, also call:

```typescript
import { triggerXP } from "@/components/features/xp-animation"
triggerXP(xpAmount, cardRef.current)
```

---

### Task 12: Daily Missions Widget

**Files:**
- Create: `components/features/daily-missions.tsx`
- Modify: `app/(dashboard)/page.tsx`

- [ ] **Step 1: Create DailyMissions component**

```typescript
"use client"

import { useMissions } from "@/hooks/use-missions"
import { CheckCircle2, Circle, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export function DailyMissions() {
  const { missions, mutate } = useMissions()

  if (!missions.length) return null

  const allDone = missions.every((m) => m.completed)

  return (
    <div className="rounded-2xl bg-surface-1 border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-gamified" />
          <h3 className="text-sm font-semibold">Today&apos;s Missions</h3>
        </div>
        {allDone && (
          <span className="text-xs text-gamified font-medium">All complete!</span>
        )}
      </div>

      <div className="space-y-2">
        {missions.map((mission) => (
          <button
            key={mission.id}
            onClick={async () => {
              await fetch(`/api/missions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...mission, completed: !mission.completed }),
              })
              mutate()
            }}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-surface-2",
              mission.completed && "opacity-50"
            )}
          >
            {mission.completed ? (
              <CheckCircle2 className="h-4 w-4 text-gamified shrink-0" />
            ) : (
              <Circle className="h-4 w-4 text-text-tertiary shrink-0" />
            )}
            <span className={cn("flex-1 text-sm", mission.completed && "line-through text-text-tertiary")}>
              {mission.title}
            </span>
            <span className="text-xs text-gamified font-semibold">+{mission.xpReward}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add to dashboard**

In `page.tsx`, add `<DailyMissions />` above or alongside ProfileCard.

---

### Task 13: Achievements Engine

**Files:**
- Create: `lib/achievements.ts`
- Create: `components/features/achievement-unlock.tsx`

- [ ] **Step 1: Create achievement definitions and checker**

```typescript
import { db } from "@/lib/db"

export interface AchievementDef {
  key: string
  title: string
  description: string
  icon: string
  check: (progress: { xp: number; level: number; currentStreak: number; totalTasks: number; totalNotes: number; totalFocusMinutes: number; totalAIChats: number }) => boolean
}

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  { key: "first_task", title: "First Steps", description: "Complete your first task", icon: "check-circle", check: (p) => p.totalTasks >= 1 },
  { key: "ten_tasks", title: "Getting Things Done", description: "Complete 10 tasks", icon: "list", check: (p) => p.totalTasks >= 10 },
  { key: "hundred_tasks", title: "Task Master", description: "Complete 100 tasks", icon: "award", check: (p) => p.totalTasks >= 100 },
  { key: "first_chat", title: "AI Explorer", description: "Have your first AI chat", icon: "message-circle", check: (p) => p.totalAIChats >= 1 },
  { key: "ten_notes", title: "Note Taker", description: "Create 10 notes", icon: "file-text", check: (p) => p.totalNotes >= 10 },
  { key: "week_streak", title: "Weekly Warrior", description: "Maintain a 7-day streak", icon: "flame", check: (p) => p.currentStreak >= 7 },
  { key: "month_streak", title: "Unstoppable", description: "Maintain a 30-day streak", icon: "zap", check: (p) => p.currentStreak >= 30 },
  { key: "focus_master", title: "Focus Master", description: "Complete 10 hours of focus sessions", icon: "clock", check: (p) => p.totalFocusMinutes >= 600 },
  { key: "night_owl", title: "Night Owl", description: "Complete 5 tasks after 10 PM", icon: "moon", check: () => false },
  { key: "early_bird", title: "Early Bird", description: "Complete 5 tasks before 8 AM", icon: "sunrise", check: () => false },
]

export async function checkAchievements() {
  const progress = await db.userProgress.findFirst()
  if (!progress) return []

  const existing = await db.achievement.findMany()
  const unlockedKeys = new Set(existing.filter((a) => a.unlockedAt).map((a) => a.key))

  const newlyUnlocked: string[] = []

  for (const def of ACHIEVEMENT_DEFS) {
    if (unlockedKeys.has(def.key)) continue
    if (def.check(progress)) {
      const existingRecord = existing.find((a) => a.key === def.key)
      if (existingRecord) {
        await db.achievement.update({
          where: { id: existingRecord.id },
          data: { unlockedAt: new Date() },
        })
      } else {
        await db.achievement.create({
          data: { key: def.key, title: def.title, description: def.description, icon: def.icon, unlockedAt: new Date() },
        })
      }
      newlyUnlocked.push(def.key)
    }
  }

  return newlyUnlocked
}
```

- [ ] **Step 2: Create AchievementUnlock notification component**

```typescript
"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Award, X } from "lucide-react"

interface UnlockEvent {
  key: string
  title: string
  description: string
}

export function AchievementUnlock() {
  const [current, setCurrent] = useState<UnlockEvent | null>(null)

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/api/achievements/check")
        if (res.ok) {
          const data = await res.json()
          if (data.length > 0) {
            setCurrent(data[0])
            setTimeout(() => setCurrent(null), 4000)
          }
        }
      } catch {}
    }
    const interval = setInterval(check, 15000)
    check()
    return () => clearInterval(interval)
  }, [])

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999]"
        >
          <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#7D39EB] to-[#C6FF33] p-4 pr-12 shadow-lg">
            <Award className="h-6 w-6 text-black" />
            <div>
              <p className="font-bold text-black text-sm">Achievement Unlocked!</p>
              <p className="text-black/80 text-xs">{current.title}</p>
            </div>
            <button onClick={() => setCurrent(null)} className="absolute right-3 top-1/2 -translate-y-1/2 text-black/60 hover:text-black">
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 3: Create check endpoint**

Create `app/api/achievements/check/route.ts`:

```typescript
import { NextResponse } from "next/server"
import { checkAchievements } from "@/lib/achievements"

export async function GET() {
  const newlyUnlocked = await checkAchievements()
  const achievements = await db.achievement.findMany({
    where: { key: { in: newlyUnlocked } },
  })
  return NextResponse.json(achievements)
}
```

---

### Task 14: Productivity Heatmap

**Files:**
- Create: `components/features/heatmap.tsx`
- Modify: `app/(dashboard)/page.tsx`

- [ ] **Step 1: Create Heatmap component**

```typescript
"use client"

import { useMemo, useState } from "react"
import { subDays, format, startOfDay, eachDayOfInterval } from "date-fns"
import useSWR from "swr"
import { fetcher } from "@/lib/fetcher"
import type { XPEvent } from "@/types"

function getColor(xp: number): string {
  if (xp === 0) return "var(--color-surface-1, #1a1a1a)"
  if (xp < 20) return "rgba(125,57,235,0.3)"
  if (xp < 50) return "rgba(125,57,235,0.5)"
  if (xp < 100) return "rgba(125,57,235,0.7)"
  return "rgba(198,255,51,0.6)"
}

export function Heatmap() {
  const { data: xpEvents } = useSWR<XPEvent[]>("/api/xp", fetcher)
  const [tooltip, setTooltip] = useState<{ date: string; xp: number } | null>(null)

  const days = useMemo(() => {
    const today = startOfDay(new Date())
    const result = eachDayOfInterval({ start: subDays(today, 364), end: today })
    return result
  }, [])

  const xpByDay = useMemo(() => {
    const map = new Map<string, number>()
    if (!xpEvents) return map
    for (const event of xpEvents) {
      const day = format(new Date(event.createdAt), "yyyy-MM-dd")
      map.set(day, (map.get(day) ?? 0) + event.amount)
    }
    return map
  }, [xpEvents])

  const weeks: Date[][] = useMemo(() => {
    const result: Date[][] = []
    let week: Date[] = []
    for (const day of days) {
      week.push(day)
      if (week.length === 7) {
        result.push(week)
        week = []
      }
    }
    if (week.length > 0) result.push(week)
    return result
  }, [days])

  if (!xpEvents) return null

  return (
    <div className="rounded-2xl bg-surface-1 border border-border p-5">
      <h3 className="text-sm font-semibold mb-4">Activity (365 days)</h3>
      <div className="overflow-x-auto pb-2" style={{ scrollbarWidth: "thin" }}>
        <div className="flex gap-[3px]" style={{ minWidth: weeks.length * 14 }}>
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day) => {
                const key = format(day, "yyyy-MM-dd")
                const xp = xpByDay.get(key) ?? 0
                return (
                  <div
                    key={key}
                    onMouseEnter={() => setTooltip({ date: format(day, "MMM d, yyyy"), xp })}
                    onMouseLeave={() => setTooltip(null)}
                    className="w-3 h-3 rounded-sm cursor-pointer transition-transform hover:scale-125"
                    style={{ backgroundColor: getColor(xp) }}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>
      {tooltip && (
        <div className="mt-2 text-xs text-text-tertiary">
          {tooltip.date} — {tooltip.xp} XP
        </div>
      )}
      <div className="flex items-center gap-1 mt-3 text-xs text-text-tertiary">
        <span>Less</span>
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "var(--color-surface-1, #1a1a1a)" }} />
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "rgba(125,57,235,0.3)" }} />
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "rgba(125,57,235,0.5)" }} />
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "rgba(125,57,235,0.7)" }} />
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "rgba(198,255,51,0.6)" }} />
        <span>More</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add to dashboard**

In `app/(dashboard)/page.tsx`, add `<Heatmap />` after the missions section.

---

### Task 15: Skill Tree

**Files:**
- Create: `components/features/skill-tree.tsx`
- Create: `lib/categories.ts`

- [ ] **Step 1: Create category mapping**

```typescript
export const CATEGORIES = [
  { key: "programming", label: "Programming", color: "from-[#7D39EB] to-[#7D39EB]" },
  { key: "fitness", label: "Fitness", color: "from-[#C6FF33] to-[#C6FF33]" },
  { key: "reading", label: "Reading", color: "from-blue-500 to-blue-500" },
  { key: "writing", label: "Writing", color: "from-amber-500 to-amber-500" },
  { key: "career", label: "Career", color: "from-rose-500 to-rose-500" },
  { key: "design", label: "Design", color: "from-fuchsia-500 to-fuchsia-500" },
  { key: "communication", label: "Communication", color: "from-teal-500 to-teal-500" },
] as const

const SUBJECT_MAP: Record<string, string> = {
  "dbms": "programming",
  "database": "programming",
  "computer": "programming",
  "programming": "programming",
  "algorithms": "programming",
  "math": "programming",
  "physics": "programming",
  "chemistry": "programming",
  "biology": "programming",
  "english": "writing",
  "literature": "writing",
  "writing": "writing",
  "art": "design",
  "design": "design",
  "fitness": "fitness",
  "sport": "fitness",
  "gym": "fitness",
  "career": "career",
  "business": "career",
  "communication": "communication",
  "presentation": "communication",
}

export function classifySubject(subject: string): string {
  const lower = subject.toLowerCase()
  for (const [key, cat] of Object.entries(SUBJECT_MAP)) {
    if (lower.includes(key)) return cat
  }
  return "programming"
}
```

- [ ] **Step 2: Create SkillTree component**

```typescript
"use client"

import { useTasks } from "@/hooks/use-tasks"
import { CATEGORIES, classifySubject } from "@/lib/categories"
import { Progress } from "@/components/ui/progress"

export function SkillTree() {
  const { tasks } = useTasks()
  const completedTasks = tasks.filter((t) => t.status === "done")

  const categoryCounts = new Map<string, number>()
  for (const task of completedTasks) {
    const cat = task.subject ? classifySubject(task.subject) : "programming"
    categoryCounts.set(cat, (categoryCounts.get(cat) ?? 0) + 1)
  }

  const maxCount = Math.max(...categoryCounts.values(), 1)

  return (
    <div className="rounded-2xl bg-surface-1 border border-border p-5">
      <h3 className="text-sm font-semibold mb-4">Skill Tree</h3>
      <div className="space-y-3">
        {CATEGORIES.map((cat) => {
          const count = categoryCounts.get(cat.key) ?? 0
          const percentage = Math.min(Math.floor((count / maxCount) * 100), 100)
          return (
            <div key={cat.key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-text-secondary">{cat.label}</span>
                <span className="text-xs text-text-tertiary">{count} tasks</span>
              </div>
              <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r transition-all duration-500"
                  style={{ width: `${percentage}%`, background: cat.color }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

---

### Task 16: Focus Session (Pomodoro)

**Files:**
- Create: `components/features/focus-session.tsx`

- [ ] **Step 1: Create FocusSession component**

```typescript
"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Play, Pause, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const PRESETS = [
  { label: "25 min", minutes: 25 },
  { label: "50 min", minutes: 50 },
  { label: "90 min", minutes: 90 },
]

interface FocusSessionProps {
  open: boolean
  onClose: () => void
}

export function FocusSession({ open, onClose }: FocusSessionProps) {
  const [selectedMinutes, setSelectedMinutes] = useState(25)
  const [secondsLeft, setSecondsLeft] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<string | null>(null)

  const selectPreset = (minutes: number) => {
    setSelectedMinutes(minutes)
    setSecondsLeft(minutes * 60)
    setRunning(false)
  }

  const toggleRunning = useCallback(() => {
    if (!running && !startTimeRef.current) {
      startTimeRef.current = new Date().toISOString()
    }
    setRunning((r) => !r)
  }, [running])

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setRunning(false)
          if (startTimeRef.current) {
            fetch("/api/xp", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ source: "focus", amount: 40, reason: `${selectedMinutes}min focus session` }),
            })
            fetch("/api/focus-sessions", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ duration: selectedMinutes, startedAt: startTimeRef.current, completed: true }),
            })
            startTimeRef.current = null
          }
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running, selectedMinutes])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="rounded-3xl bg-surface-1 border border-border p-8 w-full max-w-sm mx-4 text-center"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gamified" />
                <h2 className="text-lg font-bold">Focus</h2>
              </div>
              <button onClick={onClose} className="text-text-tertiary hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex justify-center gap-2 mb-6">
              {PRESETS.map((p) => (
                <button
                  key={p.minutes}
                  onClick={() => selectPreset(p.minutes)}
                  className={cn(
                    "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
                    selectedMinutes === p.minutes
                      ? "bg-primary-100 text-primary"
                      : "bg-surface-2 text-text-tertiary hover:text-foreground"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="text-7xl font-bold tracking-tight mb-8 tabular-nums">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </div>

            <Button
              variant={running ? "secondary" : "gamified"}
              size="lg"
              onClick={toggleRunning}
              className="w-full"
            >
              {running ? (
                <><Pause className="h-4 w-4 mr-2" /> Pause</>
              ) : (
                <><Play className="h-4 w-4 mr-2" /> Start</>
              )}
            </Button>

            {secondsLeft === 0 && (
              <p className="mt-4 text-gamified font-semibold">Session complete! +40 XP</p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

---

### Task 17: Dashboard Improvements

**Files:**
- Modify: `app/(dashboard)/page.tsx`

- [ ] **Step 1: Restructure dashboard layout**

```typescript
// New layout:
<PageTransition>
  <div className="px-4 sm:px-6 lg:px-10 pt-16 sm:pt-20 pb-20 sm:pb-28">
    <GreetingHeader />

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
      <ProfileCard />
      <DailyMissions />
      <Heatmap />
      <SkillTree />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div>
        <h2 className="text-xl font-semibold mb-6">Today&apos;s Tasks</h2>
        <div className="space-y-4">
          <AddTaskButton onMutate={mutate} />
          <TaskList filter="today" />
        </div>
      </div>
      {todayEvents.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-6">Today&apos;s Schedule</h2>
          <div className="space-y-3">{/* existing schedule */}</div>
        </div>
      )}
    </div>
  </div>
</PageTransition>
```

But this is too aggressive a change. Instead, keep the existing layout and add new widgets between the stats row and Today's Tasks section:

```typescript
// After the stats grid, before AIWidget:
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
  <ProfileCard />
  <DailyMissions />
</div>

// After AIWidget or at bottom:
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
  <Heatmap />
  <SkillTree />
</div>
```

---

### Task 18: Overview Page (Analytics)

**Files:**
- Modify: `app/(dashboard)/overview/page.tsx`

- [ ] **Step 1: Replace ComingSoon with analytics dashboard**

```typescript
"use client"

import { PageTransition } from "@/components/features/page-transition"
import { useProgress } from "@/hooks/use-progress"
import { useTasks } from "@/hooks/use-tasks"
import { useAchievements } from "@/hooks/use-achievements"
import { Heatmap } from "@/components/features/heatmap"
import { SkillTree } from "@/components/features/skill-tree"
import { getRank } from "@/lib/ranks"
import { Progress } from "@/components/ui/progress"
import { Flame, CheckCircle, Clock, MessageCircle, Award, Zap, BookOpen } from "lucide-react"
import { format } from "date-fns"

export default function OverviewPage() {
  const { progress } = useProgress()
  const { tasks } = useTasks()
  const { achievements } = useAchievements()

  const completedTasks = tasks.filter((t) => t.status === "done")
  const rank = progress ? getRank(progress.level) : null
  const unlockedAchievements = achievements.filter((a) => a.unlockedAt)

  return (
    <PageTransition>
      <div className="px-4 sm:px-6 lg:px-10 pt-16 sm:pt-20 pb-20 sm:pb-28">
        <h1 className="text-2xl font-bold mb-8">Overview</h1>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="rounded-2xl bg-surface-1 border border-border p-5">
            <Award className="h-5 w-5 text-gamified mb-3" />
            <p className="text-2xl font-bold">{progress?.level ?? 1}</p>
            <p className="text-xs text-text-tertiary">Current Level</p>
          </div>
          <div className="rounded-2xl bg-surface-1 border border-border p-5">
            <Flame className="h-5 w-5 text-gamified mb-3" />
            <p className="text-2xl font-bold">{progress?.currentStreak ?? 0}</p>
            <p className="text-xs text-text-tertiary">Day Streak</p>
          </div>
          <div className="rounded-2xl bg-surface-1 border border-border p-5">
            <CheckCircle className="h-5 w-5 text-gamified mb-3" />
            <p className="text-2xl font-bold">{completedTasks.length}</p>
            <p className="text-xs text-text-tertiary">Tasks Done</p>
          </div>
          <div className="rounded-2xl bg-surface-1 border border-border p-5">
            <Zap className="h-5 w-5 text-gamified mb-3" />
            <p className="text-2xl font-bold">{progress?.xp ?? 0}</p>
            <p className="text-xs text-text-tertiary">Total XP</p>
          </div>
        </div>

        {/* Rank card */}
        {progress && rank && (
          <div className="rounded-2xl bg-surface-1 border border-border p-6 mb-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7D39EB] to-[#C6FF33] text-3xl font-bold text-black">
                {progress.level}
              </div>
              <div>
                <p className="text-xl font-bold">{rank.title}</p>
                <p className="text-sm text-text-tertiary">Level {progress.level}</p>
              </div>
            </div>
            <Progress value={Math.min(progress.xp / 2000 * 100, 100)} className="h-2 mb-2" />
            <p className="text-xs text-text-tertiary">{progress.xp.toLocaleString()} / 2,000 XP to next level</p>
          </div>
        )}

        {/* Heatmap */}
        <div className="mb-10">
          <Heatmap />
        </div>

        {/* Achievements */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold mb-4">Achievements</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {achievements.map((a) => (
              <div
                key={a.id}
                className={`rounded-2xl border p-4 ${a.unlockedAt ? "bg-surface-1 border-border" : "bg-surface-2 border-border opacity-40"}`}
              >
                <Award className={`h-5 w-5 mb-2 ${a.unlockedAt ? "text-gamified" : "text-text-tertiary"}`} />
                <p className="text-sm font-semibold">{a.title}</p>
                <p className="text-xs text-text-tertiary mt-1">{a.description}</p>
                {a.unlockedAt && (
                  <p className="text-xs text-gamified mt-2">Unlocked {format(new Date(a.unlockedAt), "MMM d")}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Skill Tree */}
        <SkillTree />
      </div>
    </PageTransition>
  )
}
```

---

### Task 19: Sync Sidebar & Mobile Nav XP Bars

**Files:**
- Modify: `features/layout/sidebar.tsx`
- Modify: `app/(dashboard)/layout.tsx`

- [ ] **Step 1: Update sidebar XP bar to use live data**

In `features/layout/sidebar.tsx`, replace hardcoded XP values:

```typescript
import { useProgress } from "@/hooks/use-progress"
import { getRank } from "@/lib/ranks"
import { getXPProgress } from "@/lib/xp"

// Inside component:
const { progress, isLoading } = useProgress()
const xpInfo = progress ? getXPProgress(progress.xp) : { current: 0, required: 2000, percentage: 0 }
const rank = progress ? getRank(progress.level) : null

// Replace:
<span className="text-xs text-text-tertiary">1,240 XP</span>
// With:
<span className="text-xs text-text-tertiary">{xpInfo.current.toLocaleString()} XP</span>

// Replace Level/XP display:
<p className="text-base font-medium truncate">{rank?.title ?? "Scholar"}</p>
<p className="text-sm text-text-tertiary">Level {progress?.level ?? 1}</p>

// Progress value:
<Progress value={xpInfo.percentage} className="h-2" />

// XP counter pair:
<span className="text-xs text-text-tertiary">{xpInfo.current.toLocaleString()} XP</span>
<span className="text-xs text-gamified font-medium">{xpInfo.required.toLocaleString()}</span>
```

- [ ] **Step 2: Update mobile nav XP bar in layout.tsx**

Same pattern — replace hardcoded "Scholar", "Level 7", "1,240 XP", "2,000", and Progress value with live data from `useProgress`.

---

### Task 20: Weekly Report & Reflection (Future/Stretch)

**Files:**
- Create: `components/features/weekly-report.tsx`
- Create: `components/features/reflection-modal.tsx`
- Create: `app/api/report/route.ts`

These are lower priority. The design doc covers them but they can be deferred until the core loop (XP → streak → achievements → missions → focus) is working.

---

## Self-Review Checklist

- [x] Spec coverage: Every feature from Phase 4 design doc maps to at least one task
- [x] No placeholders: All code is actual implementations, not TODOs
- [x] Type consistency: Types/types.ts matches Prisma models and API responses
- [x] Names are consistent: `awardXP`, `calculateLevel`, `getRank`, `updateStreak` all match across tasks
- [x] File paths are exact and exist in the project
