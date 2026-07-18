export interface Category {
  key: string
  label: string
  color: string
}

export const CATEGORIES: Category[] = [
  { key: "programming", label: "Programming", color: "from-[#7D39EB] to-[#7D39EB]" },
  { key: "fitness", label: "Fitness", color: "from-[#C6FF33] to-[#C6FF33]" },
  { key: "reading", label: "Reading", color: "from-blue-500 to-blue-500" },
  { key: "writing", label: "Writing", color: "from-amber-500 to-amber-500" },
  { key: "career", label: "Career", color: "from-rose-500 to-rose-500" },
  { key: "design", label: "Design", color: "from-fuchsia-500 to-fuchsia-500" },
  { key: "communication", label: "Communication", color: "from-teal-500 to-teal-500" },
]

const SUBJECT_MAP: Record<string, string> = {
  dbms: "programming",
  database: "programming",
  computer: "programming",
  programming: "programming",
  algorithms: "programming",
  math: "programming",
  mathematics: "programming",
  physics: "programming",
  chemistry: "programming",
  biology: "programming",
  english: "writing",
  literature: "writing",
  writing: "writing",
  art: "design",
  design: "design",
  fitness: "fitness",
  sport: "fitness",
  gym: "fitness",
  career: "career",
  business: "career",
  communication: "communication",
  presentation: "communication",
}

export function classifySubject(subject: string): string {
  const lower = subject.toLowerCase()
  for (const [key, cat] of Object.entries(SUBJECT_MAP)) {
    if (lower.includes(key)) return cat
  }
  return "programming"
}
