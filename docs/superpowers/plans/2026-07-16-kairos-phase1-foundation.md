# Kairos Phase 1 — Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the polished visual shell of Kairos — design system, layout, reusable UI primitives, and dashboard homepage.

**Architecture:** Next.js 14 App Router with API Routes. Dark-first design with black background, violet accent (#7D39EB), lime gamification (#C6FF33). All UI primitives from shadcn/ui, custom themed. State via Zustand. Animations via Framer Motion.

**Tech Stack:** Next.js 14, TypeScript (strict), Tailwind CSS, shadcn/ui, Framer Motion, Zustand, Plus Jakarta Sans, date-fns, Lucide Icons

---

## File Structure

```
kairos/
├── app/
│   ├── (dashboard)/
│   │   ├── today/page.tsx             # Route stub
│   │   ├── overview/page.tsx          # Route stub
│   │   ├── calendar/page.tsx          # Route stub
│   │   ├── tasks/page.tsx             # Route stub
│   │   ├── layout.tsx                 # Dashboard layout (sidebar + content)
│   │   └── page.tsx                   # Main dashboard homepage
│   ├── api/                           # Not created in Phase 1
│   ├── globals.css                    # Global styles, theme CSS variables
│   ├── layout.tsx                     # Root layout (font, metadata)
│   └── page.tsx                       # Redirects to / (dashboard)
├── components/
│   ├── ui/                            # shadcn/ui primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── avatar.tsx
│   │   ├── progress.tsx
│   │   ├── checkbox.tsx
│   │   ├── separator.tsx
│   │   └── sheet.tsx
│   └── features/
│       ├── greeting-header.tsx
│       ├── xp-bar.tsx
│       ├── ai-widget.tsx
│       ├── stat-card.tsx
│       ├── cta-row.tsx
│       ├── task-card.tsx
│       ├── task-list.tsx
│       ├── add-task-button.tsx
│       └── glass-panel.tsx
├── features/
│   └── layout/
│       ├── sidebar.tsx
│       └── sidebar-item.tsx
├── hooks/
│   └── use-mounted.ts
├── lib/
│   └── utils.ts                       # cn() helper
├── store/
│   └── use-dashboard-store.ts         # UI state (active tab, etc.)
├── types/
│   └── index.ts                       # Shared types
├── styles/                            # Not needed (CSS in globals.css + tailwind)
├── tailwind.config.ts                 # Custom theme tokens
├── tsconfig.json                      # Path aliases (auto-generated)
├── components.json                    # shadcn/ui config
└── package.json                       # Dependencies
```

---

### Task 1: Scaffold Next.js Project

**Files:**
- Create: (entire project skeleton via CLI)

- [ ] **Step 1: Create Next.js project**

Run: `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm`
Workdir: `C:\Users\raghu\Desktop\kairos`

Expected: Next.js project scaffolded with TypeScript, Tailwind, App Router, `src/` directory, `@/*` import alias.

- [ ] **Step 2: Install core dependencies**

Run: `npm install framer-motion zustand lucide-react date-fns class-variance-authority clsx tailwind-merge @radix-ui/react-slot @radix-ui/react-checkbox @radix-ui/react-separator @radix-ui/react-dialog @radix-ui/react-avatar @radix-ui/react-progress @radix-ui/react-select`

- [ ] **Step 3: Install dev dependencies**

Run: `npm install -D @types/node`

- [ ] **Step 4: Move pages out of src/ to app/ at root**

Run: `Move-Item -Path "src\app" -Destination "." -Force; Remove-Item -Path "src" -Recurse -Force`

Update `tsconfig.json` — ensure paths still point correctly to `./app/*`, `./components/*`, etc.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js 14 project with TypeScript, Tailwind, core deps"
```

---

### Task 2: Configure shadcn/ui

- [ ] **Step 1: Create components.json**

Write `components.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

- [ ] **Step 2: Create lib/utils.ts**

Write `lib/utils.ts`:

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 3: Commit**

```bash
git add components.json lib/utils.ts
git commit -m "feat: configure shadcn/ui and add cn() utility"
```

---

### Task 3: Configure Tailwind Theme

**Files:**
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Replace tailwind.config.ts content**

Write `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      colors: {
        border: "rgba(255,255,255,0.06)",
        input: "rgba(255,255,255,0.06)",
        ring: "#7D39EB",
        background: "#000000",
        foreground: "#FFFFFF",
        primary: {
          DEFAULT: "#7D39EB",
          foreground: "#FFFFFF",
          hover: "#9263F0",
          active: "#6A2FC8",
        },
        secondary: {
          DEFAULT: "rgba(255,255,255,0.06)",
          foreground: "#FFFFFF",
          hover: "rgba(255,255,255,0.1)",
        },
        gamified: {
          DEFAULT: "#C6FF33",
          foreground: "#000000",
          hover: "#D4FF5C",
          active: "#A8E00F",
        },
        destructive: {
          DEFAULT: "#FF3B5C",
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#FF9F0A",
          foreground: "#000000",
        },
        success: {
          DEFAULT: "#C6FF33",
          foreground: "#000000",
        },
        muted: {
          DEFAULT: "rgba(255,255,255,0.04)",
          foreground: "#666666",
        },
        accent: {
          DEFAULT: "rgba(125,57,235,0.15)",
          foreground: "#7D39EB",
        },
        card: {
          DEFAULT: "rgba(255,255,255,0.04)",
          foreground: "#FFFFFF",
        },
        surface: {
          1: "rgba(255,255,255,0.04)",
          2: "rgba(255,255,255,0.08)",
          3: "rgba(255,255,255,0.12)",
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#999999",
          tertiary: "#666666",
        },
      },
      borderRadius: {
        xs: "6px",
        sm: "8px",
        md: "12px",
        lg: "14px",
        xl: "16px",
        "2xl": "20px",
        "3xl": "24px",
      },
      boxShadow: {
        "card-hover": "0 8px 24px rgba(125,57,235,0.12)",
        "neon-violet": "0 0 24px rgba(125,57,235,0.3)",
        "neon-lime": "0 0 24px rgba(198,255,51,0.3)",
        glass: "inset 0 0 0 1px rgba(255,255,255,0.08)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
```

- [ ] **Step 2: Commit**

```bash
git add tailwind.config.ts
git commit -m "feat: configure Tailwind theme with Kairos color system and custom tokens"
```

---

### Task 4: Set Up Global CSS

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Replace globals.css content**

Write `app/globals.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground font-sans antialiased;
    font-feature-settings: "cv02", "cv03", "cv04", "cv11";
  }

  ::selection {
    background: rgba(125, 57, 235, 0.3);
    color: #ffffff;
  }

  ::-webkit-scrollbar {
    width: 6px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.08);
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.15);
  }
}

@layer utilities {
  .text-gradient {
    @apply bg-clip-text text-transparent bg-gradient-to-r from-[#7D39EB] to-[#C6FF33];
  }

  .glass {
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .glass-strong {
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.12);
  }

  .neon-glow-violet {
    box-shadow: 0 0 24px rgba(125, 57, 235, 0.3);
  }

  .neon-glow-lime {
    box-shadow: 0 0 24px rgba(198, 255, 51, 0.3);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/globals.css
git commit -m "feat: set up global CSS with dark theme, fonts, scrollbar, and utility classes"
```

---

### Task 5: Create Root Layout with Font

**Files:**
- Create: `lib/fonts.ts`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create font configuration**

Write `lib/fonts.ts`:

```typescript
// Font is loaded via @import in globals.css.
// This file provides CSS variable names for reference.
export const fontSans = "Plus Jakarta Sans"
```

- [ ] **Step 2: Create root layout**

Write `app/layout.tsx`:

```tsx
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Kairos",
  description: "Your academic operating system",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background antialiased">
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Create root page (redirect)**

Write `app/page.tsx`:

```tsx
import { redirect } from "next/navigation"

export default function RootPage() {
  redirect("/")
}
```

Wait — this would cause a redirect loop. Since the dashboard is at `/(dashboard)/page.tsx` which maps to `/`, this root page should not exist or simply renders nothing. Let me fix: `app/page.tsx` actually serves as the dashboard homepage when there's no route conflict. The `(dashboard)` route group's `page.tsx` serves at `/`. So we don't need a redirect. Just ensure the root `app/page.tsx` doesn't exist (the dashboard group's page handles `/`).

Actually, with Next.js App Router, `app/(dashboard)/page.tsx` handles the `/` route. The root `app/page.tsx` would conflict. So we should NOT create `app/page.tsx`. Let me just ensure the dashboard layout group's page handles `/`.

- [ ] **Step 4: Commit**

```bash
git add lib/fonts.ts app/layout.tsx
git commit -m "feat: create root layout with dark mode and font"
```

---

### Task 6: Create UI Primitives — Button, Badge, Separator

**Files:**
- Create: `components/ui/button.tsx`
- Create: `components/ui/badge.tsx`
- Create: `components/ui/separator.tsx`

- [ ] **Step 1: Create Button component**

Write `components/ui/button.tsx`:

```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-[#7D39EB] to-[#6951e3] text-white hover:shadow-[0_0_24px_rgba(125,57,235,0.3)] hover:translate-y-[-1px]",
        gamified:
          "bg-[#C6FF33] text-black font-bold hover:shadow-[0_0_24px_rgba(198,255,51,0.3)] hover:translate-y-[-1px]",
        secondary:
          "bg-surface-1 text-foreground border border-border hover:bg-surface-2 hover:border-[rgba(125,57,235,0.3)]",
        ghost:
          "text-text-secondary hover:text-foreground hover:bg-surface-1",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-[#e0324a]",
      },
      size: {
        default: "h-11 px-5 py-3",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-13 rounded-xl px-8 py-4 text-base",
        icon: "h-11 w-11 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

- [ ] **Step 2: Create Badge component**

Write `components/ui/badge.tsx`:

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-xs font-semibold transition-colors duration-200",
  {
    variants: {
      variant: {
        focus: "bg-[rgba(125,57,235,0.15)] text-[#7D39EB]",
        success: "bg-[rgba(198,255,51,0.12)] text-[#C6FF33]",
        warning: "bg-[rgba(255,159,10,0.12)] text-[#FF9F0A]",
        danger: "bg-[rgba(255,59,92,0.12)] text-[#FF3B5C]",
        subject: "bg-surface-1 text-text-secondary",
        outline: "border border-border text-text-secondary",
      },
    },
    defaultVariants: {
      variant: "subject",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
```

- [ ] **Step 3: Create Separator component**

Write `components/ui/separator.tsx`:

```tsx
"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"
import { cn } from "@/lib/utils"

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }
```

- [ ] **Step 4: Commit**

```bash
git add components/ui/button.tsx components/ui/badge.tsx components/ui/separator.tsx
git commit -m "feat: add Button, Badge, and Separator UI primitives with Kairos variants"
```

---

### Task 7: Create UI Primitives — Card, Input, Avatar, Progress, Checkbox

**Files:**
- Create: `components/ui/card.tsx`
- Create: `components/ui/input.tsx`
- Create: `components/ui/avatar.tsx`
- Create: `components/ui/progress.tsx`
- Create: `components/ui/checkbox.tsx`

- [ ] **Step 1: Create Card component**

Write `components/ui/card.tsx`:

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl bg-surface-1 border border-border",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4", className)} {...props} />
))
CardContent.displayName = "CardContent"

export { Card, CardContent }
```

- [ ] **Step 2: Create Input component**

Write `components/ui/input.tsx`:

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl bg-surface-1 border border-border px-4 py-3 text-sm text-foreground placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
```

- [ ] **Step 3: Create Avatar component**

Write `components/ui/avatar.tsx`:

```tsx
"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cn } from "@/lib/utils"

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-surface-2 text-sm font-medium text-text-secondary",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
```

- [ ] **Step 4: Create Progress component**

Write `components/ui/progress.tsx`:

```tsx
"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-1.5 w-full overflow-hidden rounded-full bg-surface-2",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 rounded-full bg-gradient-to-r from-[#7D39EB] to-[#C6FF33] transition-all duration-500 ease-out"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
```

- [ ] **Step 5: Create Checkbox component**

Write `components/ui/checkbox.tsx`:

```tsx
"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-5 w-5 shrink-0 rounded-md border-2 border-text-tertiary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[#C6FF33] data-[state=checked]:border-[#C6FF33] data-[state=checked]:text-black transition-all duration-200",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-3.5 w-3.5 stroke-[3]" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
```

- [ ] **Step 6: Commit**

```bash
git add components/ui/card.tsx components/ui/input.tsx components/ui/avatar.tsx components/ui/progress.tsx components/ui/checkbox.tsx
git commit -m "feat: add Card, Input, Avatar, Progress, and Checkbox UI primitives"
```

---

### Task 8: Create Layout Components (Sidebar + Dashboard Layout)

**Files:**
- Create: `features/layout/sidebar-item.tsx`
- Create: `features/layout/sidebar.tsx`
- Create: `app/(dashboard)/layout.tsx`

- [ ] **Step 1: Create SidebarItem component**

Write `features/layout/sidebar-item.tsx`:

```tsx
"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"

interface SidebarItemProps {
  icon: LucideIcon
  label: string
  href: string
}

export function SidebarItem({ icon: Icon, label, href }: SidebarItemProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-[rgba(125,57,235,0.15)] text-[#7D39EB]"
          : "text-text-secondary hover:text-foreground hover:bg-surface-1"
      )}
    >
      <Icon
        className={cn(
          "h-5 w-5 transition-all duration-200",
          isActive && "text-[#7D39EB]"
        )}
      />
      <span>{label}</span>
      {isActive && (
        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[#7D39EB]" />
      )}
    </Link>
  )
}
```

- [ ] **Step 2: Create Sidebar component**

Write `features/layout/sidebar.tsx`:

```tsx
"use client"

import {
  LayoutDashboard,
  Calendar,
  ListTodo,
  Notebook,
  Sparkles,
  BarChart3,
  Settings,
} from "lucide-react"
import { SidebarItem } from "./sidebar-item"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"

const navItems = [
  { icon: LayoutDashboard, label: "Home", href: "/" },
  { icon: ListTodo, label: "Today", href: "/today" },
  { icon: Calendar, label: "Calendar", href: "/calendar" },
  { icon: Notebook, label: "Notes", href: "/notes" },
  { icon: Sparkles, label: "AI Assistant", href: "/ai" },
  { icon: BarChart3, label: "Overview", href: "/overview" },
]

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-30 flex h-full w-60 flex-col border-r border-border bg-background">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 pt-6 pb-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7D39EB] to-[#C6FF33] text-sm font-bold text-black">
          K
        </div>
        <span className="text-lg font-bold tracking-tight">Kairos</span>
      </div>

      <Separator className="mx-4 w-auto" />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <SidebarItem
            key={item.href}
            icon={item.icon}
            label={item.label}
            href={item.href}
          />
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-gradient-to-br from-[#7D39EB] to-[#C6FF33] p-[2px]">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-black text-xs text-white">
                RK
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Scholar</p>
            <p className="text-xs text-text-tertiary">Level 7</p>
          </div>
          <Settings className="h-4 w-4 text-text-tertiary hover:text-foreground cursor-pointer transition-colors" />
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-text-tertiary">1,240 XP</span>
            <span className="text-xs text-[#C6FF33] font-medium">2,000</span>
          </div>
          <Progress value={62} className="h-1.5" />
        </div>
      </div>
    </aside>
  )
}
```

- [ ] **Step 3: Create Dashboard Layout**

Write `app/(dashboard)/layout.tsx`:

```tsx
import { Sidebar } from "@/features/layout/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-60 flex-1">
        {children}
      </main>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add features/layout/sidebar-item.tsx features/layout/sidebar.tsx app/\(dashboard\)/layout.tsx
git commit -m "feat: add sidebar navigation and dashboard layout shell"
```

---

### Task 9: Create Dashboard Components — Greeting, Stats, XP Bar

**Files:**
- Create: `components/features/greeting-header.tsx`
- Create: `components/features/stat-card.tsx`
- Create: `components/features/xp-bar.tsx`

- [ ] **Step 1: Create GreetingHeader component**

Write `components/features/greeting-header.tsx`:

```tsx
"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"

export function GreetingHeader() {
  const [greeting, setGreeting] = useState("Evening")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Morning")
    else if (hour < 17) setGreeting("Afternoon")
    else setGreeting("Evening")
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-[40px] font-bold leading-[1.1] tracking-[-0.02em]">
          Good{" "}
          <span className="bg-gradient-to-r from-[#7D39EB] to-[#C6FF33] bg-clip-text text-transparent">
            {greeting}
          </span>
        </h1>
        <p className="mt-1.5 text-sm text-text-secondary">
          {format(new Date(), "EEEE, d MMMM")} &middot; 3 tasks remaining
        </p>
      </div>
      <div className="rounded-full bg-gradient-to-br from-[#7D39EB] to-[#C6FF33] p-[2px]">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
          RK
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create StatCard component**

Write `components/features/stat-card.tsx`:

```tsx
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: string | number
  accent?: "default" | "violet" | "lime"
}

export function StatCard({ label, value, accent = "default" }: StatCardProps) {
  return (
    <div className="flex-1 rounded-2xl bg-surface-1 border border-border p-4">
      <p className="text-xs font-medium uppercase tracking-[0.05em] text-text-tertiary">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-2xl font-bold",
          accent === "violet" && "text-[#7D39EB]",
          accent === "lime" && "text-[#C6FF33]",
          accent === "default" && "text-foreground"
        )}
      >
        {value}
      </p>
    </div>
  )
}
```

- [ ] **Step 3: Create XPBar component**

Write `components/features/xp-bar.tsx`:

```tsx
import { Progress } from "@/components/ui/progress"

export function XPBar() {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="flex items-center gap-1.5 rounded-full bg-[rgba(125,57,235,0.15)] border border-[rgba(125,57,235,0.2)] pr-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#7D39EB] to-[#C6FF33] text-[10px] font-bold text-black">
          7
        </div>
        <span className="text-xs font-semibold text-[#7D39EB]">Scholar</span>
      </div>
      <Progress value={62} className="flex-1 h-1.5" />
      <span className="text-xs font-semibold text-[#C6FF33] whitespace-nowrap">
        1,240 / 2,000 XP
      </span>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add components/features/greeting-header.tsx components/features/stat-card.tsx components/features/xp-bar.tsx
git commit -m "feat: add GreetingHeader, StatCard, and XPBar dashboard components"
```

---

### Task 10: Create Dashboard Components — AI Widget

**Files:**
- Create: `components/features/ai-widget.tsx`

- [ ] **Step 1: Create AIWidget component**

Write `components/features/ai-widget.tsx`:

```tsx
"use client"

import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AIWidget() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[rgba(125,57,235,0.2)] p-5 mb-6"
      style={{
        background: "linear-gradient(135deg, rgba(125,57,235,0.12), rgba(198,255,51,0.06))",
      }}
    >
      {/* Radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 80% 50%, rgba(125,57,235,0.1), transparent 70%)",
        }}
      />

      <div className="relative">
        <div className="flex items-center gap-2.5 mb-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#7D39EB] to-[#C6FF33]">
            <Sparkles className="h-4 w-4 text-black" />
          </div>
          <span className="text-sm font-semibold text-[#7D39EB]">Kairos AI</span>
          <span className="h-1.5 w-1.5 rounded-full bg-[#C6FF33] animate-pulse" />
        </div>

        <p className="text-sm text-[rgba(255,255,255,0.7)] leading-relaxed mb-3.5">
          You have a DBMS exam in 6 days. I&apos;ve prepared a revision plan covering all 4 modules. Want me to schedule it?
        </p>

        <div className="flex gap-2">
          <Button variant="primary" size="sm">Review Plan</Button>
          <Button variant="secondary" size="sm">Schedule It</Button>
          <Button
            variant="secondary"
            size="sm"
            className="bg-[rgba(198,255,51,0.1)] text-[#C6FF33] border-[rgba(198,255,51,0.15)] hover:bg-[rgba(198,255,51,0.2)]"
          >
            Later
          </Button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/features/ai-widget.tsx
git commit -m "feat: add AIWidget component with glass styling and glow effects"
```

---

### Task 11: Create Dashboard Components — CTA Row, Glass Panel

**Files:**
- Create: `components/features/cta-row.tsx`
- Create: `components/features/glass-panel.tsx`

- [ ] **Step 1: Create CTARow component**

Write `components/features/cta-row.tsx`:

```tsx
import { Button } from "@/components/ui/button"
import { Plus, ListChecks, BarChart3 } from "lucide-react"

export function CTARow() {
  return (
    <div className="flex gap-2 mb-6">
      <Button variant="primary" size="default" className="flex-1 gap-2">
        <ListChecks className="h-4 w-4" />
        View Today
      </Button>
      <Button variant="gamified" size="default" className="flex-1 gap-2">
        <Plus className="h-4 w-4" />
        Quick Task
      </Button>
      <Button variant="secondary" size="default" className="flex-1 gap-2">
        <BarChart3 className="h-4 w-4" />
        Overview
      </Button>
    </div>
  )
}
```

- [ ] **Step 2: Create GlassPanel component**

Write `components/features/glass-panel.tsx`:

```tsx
import type { ReactNode } from "react"

interface GlassPanelProps {
  title: string
  subtitle?: string
  children: ReactNode
}

export function GlassPanel({ title, subtitle, children }: GlassPanelProps) {
  return (
    <div className="rounded-2xl p-6 mb-6 glass">
      <h3 className="text-xl font-semibold mb-0.5">{title}</h3>
      {subtitle && (
        <p className="text-sm text-text-secondary mb-4">{subtitle}</p>
      )}
      {children}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/features/cta-row.tsx components/features/glass-panel.tsx
git commit -m "feat: add CTARow and GlassPanel dashboard components"
```

---

### Task 12: Create Task Components

**Files:**
- Create: `components/features/task-card.tsx`
- Create: `components/features/task-list.tsx`
- Create: `components/features/add-task-button.tsx`

- [ ] **Step 1: Create TaskCard component**

Write `components/features/task-card.tsx`:

```tsx
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { Paperclip, Clock } from "lucide-react"

interface TaskCardProps {
  title: string
  priority: "focus" | "success" | "warning" | "danger"
  subject?: string
  dueText?: string
  dueUrgent?: boolean
  attachments?: number
  timeEstimate?: string
  progress?: number
  completed?: boolean
  xpReward?: number
}

const priorityColors = {
  focus: "border-l-[#7D39EB]",
  success: "border-l-[#C6FF33]",
  warning: "border-l-[#FF9F0A]",
  danger: "border-l-[#FF3B5C]",
}

const priorityBadgeVariant = {
  focus: "focus" as const,
  success: "success" as const,
  warning: "warning" as const,
  danger: "danger" as const,
}

const priorityLabels = {
  focus: "Focus",
  success: "Done",
  warning: "Caution",
  danger: "Urgent",
}

export function TaskCard({
  title,
  priority,
  subject,
  dueText,
  dueUrgent,
  attachments,
  timeEstimate,
  progress: progressValue,
  completed = false,
  xpReward,
}: TaskCardProps) {
  const [isCompleted, setIsCompleted] = useState(completed)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl bg-surface-1 border border-border border-l-[3px] p-4 transition-all duration-200 hover:border-[rgba(125,57,235,0.3)] hover:shadow-[0_8px_24px_rgba(125,57,235,0.12)] hover:translate-y-[-1px]",
        priorityColors[priority],
        isCompleted && "opacity-60"
      )}
    >
      <div className="flex gap-3 items-start">
        <Checkbox
          checked={isCompleted}
          onCheckedChange={() => setIsCompleted(!isCompleted)}
          className="mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <h4
            className={cn(
              "text-sm font-semibold",
              isCompleted && "line-through text-text-tertiary"
            )}
          >
            {title}
          </h4>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <Badge variant={priorityBadgeVariant[priority]}>
              ● {priorityLabels[priority]}
            </Badge>
            {subject && <Badge variant="subject">{subject}</Badge>}
          </div>
          <div className="flex items-center gap-4 mt-2.5 text-xs text-text-tertiary">
            {attachments !== undefined && (
              <span className="flex items-center gap-1">
                <Paperclip className="h-3 w-3" />
                {attachments} file{attachments !== 1 ? "s" : ""}
              </span>
            )}
            {timeEstimate && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeEstimate} est.
              </span>
            )}
            {dueText && (
              <span className={cn(dueUrgent && "text-[#FF3B5C] font-medium")}>
                {dueText}
              </span>
            )}
            {xpReward && (
              <span className="text-[#C6FF33] font-semibold">
                +{xpReward} XP
              </span>
            )}
          </div>
          {progressValue !== undefined && (
            <Progress value={progressValue} className="mt-3 h-1" />
          )}
        </div>
      </div>
    </motion.div>
  )
}
```

- [ ] **Step 2: Create TaskList component**

Write `components/features/task-list.tsx`:

```tsx
import { TaskCard } from "./task-card"

const sampleTasks = [
  {
    title: "Finish DBMS Assignment",
    priority: "focus" as const,
    subject: "DBMS",
    dueText: "Due tomorrow",
    attachments: 2,
    timeEstimate: "45m",
    progress: 65,
  },
  {
    title: "Review Math Notes",
    priority: "success" as const,
    subject: "Mathematics",
    xpReward: 25,
    completed: true,
  },
  {
    title: "Submit Lab Report",
    priority: "warning" as const,
    subject: "Physics",
    dueText: "Due in 3h",
    attachments: 1,
    timeEstimate: "20m",
    progress: 40,
  },
  {
    title: "Pay Library Fine",
    priority: "danger" as const,
    dueText: "Overdue by 2 days",
    dueUrgent: true,
    progress: 25,
  },
]

export function TaskList() {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-semibold">Today&apos;s Tasks</h2>
        <button className="text-xs font-medium text-[#7D39EB] hover:text-[#9263F0] transition-colors">
          View All
        </button>
      </div>
      {sampleTasks.map((task, i) => (
        <TaskCard key={i} {...task} />
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Create AddTaskButton component**

Write `components/features/add-task-button.tsx`:

```tsx
"use client"

import { Plus } from "lucide-react"

export function AddTaskButton() {
  return (
    <button className="flex w-full items-center gap-2.5 rounded-2xl border border-dashed border-[rgba(255,255,255,0.1)] p-4 text-sm font-medium text-text-tertiary transition-all duration-200 hover:border-[#7D39EB] hover:text-[#7D39EB] hover:bg-[rgba(125,57,235,0.04)]">
      <Plus className="h-5 w-5 text-[#7D39EB]" />
      <span>Add a new task...</span>
    </button>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add components/features/task-card.tsx components/features/task-list.tsx components/features/add-task-button.tsx
git commit -m "feat: add TaskCard, TaskList, and AddTaskButton components with sample data"
```

---

### Task 13: Create Dashboard Homepage

**Files:**
- Create: `app/(dashboard)/page.tsx`
- Create: `store/use-dashboard-store.ts`

- [ ] **Step 1: Create Zustand dashboard store**

Write `store/use-dashboard-store.ts`:

```typescript
import { create } from "zustand"

interface DashboardState {
  tasksCompleted: number
  studyHours: number
  xpToday: number
  streak: number
  consistency: number
}

export const useDashboardStore = create<DashboardState>(() => ({
  tasksCompleted: 4,
  studyHours: 2.5,
  xpToday: 340,
  streak: 4,
  consistency: 82,
}))
```

- [ ] **Step 2: Create Dashboard page**

Write `app/(dashboard)/page.tsx`:

```tsx
import { GreetingHeader } from "@/components/features/greeting-header"
import { XPBar } from "@/components/features/xp-bar"
import { AIWidget } from "@/components/features/ai-widget"
import { CTARow } from "@/components/features/cta-row"
import { GlassPanel } from "@/components/features/glass-panel"
import { TaskList } from "@/components/features/task-list"
import { AddTaskButton } from "@/components/features/add-task-button"
import { StatCard } from "@/components/features/stat-card"

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-[680px] px-8 py-8">
      <GreetingHeader />
      <XPBar />
      <AIWidget />

      {/* Stats */}
      <div className="flex gap-2 mb-6">
        <StatCard label="Completed" value={4} />
        <StatCard label="Study Hours" value="2.5" />
        <StatCard label="XP Today" value="+340" accent="lime" />
      </div>

      <CTARow />

      {/* Weekly Insights */}
      <GlassPanel title="This Week" subtitle="You&apos;re on a 4-day streak. Keep going!">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-black/30 border border-[rgba(255,255,255,0.04)] p-3.5">
            <p className="text-xs uppercase tracking-[0.05em] text-text-tertiary">Tasks Done</p>
            <p className="text-xl font-bold mt-1">18</p>
          </div>
          <div className="rounded-xl bg-black/30 border border-[rgba(255,255,255,0.04)] p-3.5">
            <p className="text-xs uppercase tracking-[0.05em] text-text-tertiary">Study Hours</p>
            <p className="text-xl font-bold mt-1">12.5</p>
          </div>
          <div className="rounded-xl bg-black/30 border border-[rgba(255,255,255,0.04)] p-3.5">
            <p className="text-xs uppercase tracking-[0.05em] text-text-tertiary">Streak</p>
            <p className="text-xl font-bold text-[#C6FF33] mt-1">4 days</p>
          </div>
          <div className="rounded-xl bg-black/30 border border-[rgba(255,255,255,0.04)] p-3.5">
            <p className="text-xs uppercase tracking-[0.05em] text-text-tertiary">Consistency</p>
            <p className="text-xl font-bold text-[#7D39EB] mt-1">82%</p>
          </div>
        </div>
      </GlassPanel>

      <TaskList />
      <div className="mt-3">
        <AddTaskButton />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add store/use-dashboard-store.ts app/\(dashboard\)/page.tsx
git commit -m "feat: create dashboard homepage with all sections composed"
```

---

### Task 14: Create Route Stubs

**Files:**
- Create: `app/(dashboard)/today/page.tsx`
- Create: `app/(dashboard)/overview/page.tsx`
- Create: `app/(dashboard)/calendar/page.tsx`
- Create: `app/(dashboard)/tasks/page.tsx`
- Create: `app/(dashboard)/notes/page.tsx`
- Create: `app/(dashboard)/ai/page.tsx`

- [ ] **Step 1: Create placeholder pages**

Write `app/(dashboard)/today/page.tsx`:

```tsx
import { ComingSoon } from "@/components/features/coming-soon"

export default function TodayPage() {
  return <ComingSoon title="Today" description="Your daily timeline and quick actions" />
}
```

Write `app/(dashboard)/overview/page.tsx`:

```tsx
import { ComingSoon } from "@/components/features/coming-soon"

export default function OverviewPage() {
  return <ComingSoon title="Overview" description="Analytics, progress, and achievements" />
}
```

Write `app/(dashboard)/calendar/page.tsx`:

```tsx
import { ComingSoon } from "@/components/features/coming-soon"

export default function CalendarPage() {
  return <ComingSoon title="Calendar" description="Your schedule, deadlines, and events" />
}
```

Write `app/(dashboard)/tasks/page.tsx`:

```tsx
import { ComingSoon } from "@/components/features/coming-soon"

export default function TasksPage() {
  return <ComingSoon title="Tasks" description="Manage all your tasks and assignments" />
}
```

Write `app/(dashboard)/notes/page.tsx`:

```tsx
import { ComingSoon } from "@/components/features/coming-soon"

export default function NotesPage() {
  return <ComingSoon title="Notes" description="Your notes, organized by subject" />
}
```

Write `app/(dashboard)/ai/page.tsx`:

```tsx
import { ComingSoon } from "@/components/features/coming-soon"

export default function AIPage() {
  return <ComingSoon title="AI Assistant" description="Your intelligent academic companion" />
}
```

- [ ] **Step 2: Create ComingSoon component**

Write `components/features/coming-soon.tsx`:

```tsx
import { Construction } from "lucide-react"

interface ComingSoonProps {
  title: string
  description: string
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="mx-auto max-w-[680px] px-8 py-16">
      <div className="flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-[rgba(255,255,255,0.08)] p-16">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(125,57,235,0.1)] mb-4">
          <Construction className="h-6 w-6 text-[#7D39EB]" />
        </div>
        <h1 className="text-2xl font-bold mb-1">{title}</h1>
        <p className="text-sm text-text-secondary">{description}</p>
        <p className="text-xs text-text-tertiary mt-6">Coming in Phase 2</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/\(dashboard\)/today/page.tsx app/\(dashboard\)/overview/page.tsx app/\(dashboard\)/calendar/page.tsx app/\(dashboard\)/tasks/page.tsx app/\(dashboard\)/notes/page.tsx app/\(dashboard\)/ai/page.tsx components/features/coming-soon.tsx
git commit -m "feat: add route stubs for all dashboard pages with ComingSoon component"
```

---

### Task 15: Add Framer Motion Page Transitions

**Files:**
- Create: `components/features/page-transition.tsx`

- [ ] **Step 1: Create PageTransition wrapper**

Write `components/features/page-transition.tsx`:

```tsx
"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface PageTransitionProps {
  children: ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 2: Update dashboard page to use PageTransition**

Edit `app/(dashboard)/page.tsx` — wrap the content:

Add import: `import { PageTransition } from "@/components/features/page-transition"`

Wrap the return content with `<PageTransition>...</PageTransition>`

- [ ] **Step 3: Update all route stubs to use PageTransition**

Edit `today/page.tsx`, `overview/page.tsx`, `calendar/page.tsx`, `tasks/page.tsx`, `notes/page.tsx`, `ai/page.tsx` — import and wrap with PageTransition.

- [ ] **Step 4: Commit**

```bash
git add components/features/page-transition.tsx
git commit -m "feat: add Framer Motion page transitions to all dashboard pages"
```

---

### Task 16: Create useMounted Hook

**Files:**
- Create: `hooks/use-mounted.ts`

- [ ] **Step 1: Create the hook**

Write `hooks/use-mounted.ts`:

```typescript
"use client"

import { useEffect, useState } from "react"

export function useMounted() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  return mounted
}
```

- [ ] **Step 2: Commit**

```bash
git add hooks/use-mounted.ts
git commit -m "chore: add useMounted hook for hydration safety"
```

---

### Task 17: Add .gitignore entries and Final Polish

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Add .superpowers to .gitignore**

Append to `.gitignore`:

```
# Superpowers brainstorm artifacts
.superpowers/
```

- [ ] **Step 2: Build and verify**

Run: `npm run build`
Expected: Build succeeds without errors.

- [ ] **Step 3: Commit**

```bash
git add .gitignore
git commit -m "chore: add .superpowers to gitignore and finalize Phase 1 setup"
```

---

## Spec Coverage Check

| Spec Requirement | Task |
|-----------------|------|
| Next.js 14 scaffold | Task 1 |
| TypeScript strict | Task 1 (default with create-next-app) |
| Tailwind config with custom tokens | Task 3 |
| Plus Jakarta Sans font | Task 4 (globals.css @import) |
| shadcn/ui setup | Task 2 |
| Button (3 variants) | Task 6 |
| Badge (4 semantic variants) | Task 6 |
| Card, Input, Avatar, Progress, Checkbox | Task 7 |
| Separator | Task 6 |
| Sidebar navigation (Today, Overview, Calendar, Tasks, Notes, AI) | Task 8 |
| Dashboard layout with sidebar + content | Task 8 |
| GreetingHeader with gradient text | Task 9 |
| XPBar with level badge | Task 9 |
| StatCard (3 variants) | Task 9 |
| AIWidget with glass styling | Task 10 |
| CTARow (3 buttons) | Task 11 |
| GlassPanel | Task 11 |
| TaskCard with progress, tags, metadata | Task 12 |
| TaskList with sample data | Task 12 |
| AddTaskButton | Task 12 |
| Dashboard homepage composing all sections | Task 13 |
| Route stubs (today, overview, calendar, tasks, notes, ai) | Task 14 |
| Framer Motion page transitions | Task 15 |
| Zustand store | Task 13 |
| ComingSoon placeholder | Task 14 |
| useMounted hook | Task 16 |
| Dark mode only | Task 4 (globals.css) |
