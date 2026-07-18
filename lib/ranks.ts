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
