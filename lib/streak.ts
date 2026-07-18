import { db } from "@/lib/db"
import { startOfDay, differenceInCalendarDays } from "date-fns"

export async function updateStreak() {
  const today = startOfDay(new Date())
  let progress = await db.userProgress.findFirst()

  if (!progress) {
    await db.userProgress.create({
      data: {
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: today,
      },
    })
    return { current: 1, longest: 1, streakExtended: false, newStreak: true }
  }

  const lastActive = progress.lastActiveDate
  if (!lastActive) {
    await db.userProgress.update({
      where: { id: progress.id },
      data: {
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: today,
      },
    })
    return { current: 1, longest: 1, streakExtended: false, newStreak: true }
  }

  const diff = differenceInCalendarDays(today, startOfDay(lastActive))

  if (diff === 0) {
    return {
      current: progress.currentStreak,
      longest: progress.longestStreak,
      streakExtended: false,
      newStreak: false,
    }
  }

  if (diff === 1) {
    const newStreak = progress.currentStreak + 1
    const newLongest = Math.max(newStreak, progress.longestStreak)
    await db.userProgress.update({
      where: { id: progress.id },
      data: {
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastActiveDate: today,
      },
    })
    return { current: newStreak, longest: newLongest, streakExtended: true, newStreak: false }
  }

  await db.userProgress.update({
    where: { id: progress.id },
    data: {
      currentStreak: 1,
      lastActiveDate: today,
    },
  })
  return {
    current: 1,
    longest: progress.longestStreak,
    streakExtended: false,
    newStreak: true,
  }
}

export async function getStreakStatus() {
  const progress = await db.userProgress.findFirst()

  if (!progress || !progress.lastActiveDate) {
    return { current: 0, longest: 0, atRisk: false }
  }

  const diff = differenceInCalendarDays(startOfDay(new Date()), startOfDay(progress.lastActiveDate))
  const atRisk = diff === 1

  return {
    current: progress.currentStreak,
    longest: progress.longestStreak,
    atRisk,
  }
}
