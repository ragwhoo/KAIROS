import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"

const adapter = new PrismaLibSql({ url: "file:./dev.db" })
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.task.deleteMany()
  await prisma.note.deleteMany()
  await prisma.calendarEvent.deleteMany()

  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const inThreeHours = new Date(now)
  inThreeHours.setHours(inThreeHours.getHours() + 3)
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 2)

  await prisma.task.createMany({
    data: [
      { title: "Finish DBMS Assignment", priority: "high", subject: "DBMS", dueDate: tomorrow.toISOString(), estimatedMinutes: 45, status: "todo" },
      { title: "Review Math Notes", priority: "low", subject: "Mathematics", estimatedMinutes: 30, status: "todo" },
      { title: "Submit Lab Report", priority: "medium", subject: "Physics", dueDate: inThreeHours.toISOString(), estimatedMinutes: 20, status: "todo" },
      { title: "Pay Library Fine", priority: "high", dueDate: yesterday.toISOString(), estimatedMinutes: 5, status: "todo" },
      { title: "Read Chapter 5 - Normalization", priority: "low", subject: "DBMS", estimatedMinutes: 60, status: "todo" },
    ],
  })

  await prisma.note.createMany({
    data: [
      { title: "DBMS - Normalization", content: "1NF: No repeating groups\n2NF: No partial dependencies\n3NF: No transitive dependencies\nBCNF: Every determinant is a candidate key", subject: "DBMS", pinned: true },
      { title: "Math - Integration Formulas", content: "∫x^n dx = x^(n+1)/(n+1)\n∫e^x dx = e^x\n∫1/x dx = ln(x)", subject: "Mathematics", pinned: true },
      { title: "Physics - Lab Report Notes", content: "Experiment: Ohm's Law\nV = IR\nGraph: V vs I should be linear", subject: "Physics" },
      { title: "Study Schedule", content: "Mon-Fri: 2 hours each subject\nWeekend: Revision + Mock tests" },
    ],
  })

  await prisma.calendarEvent.createMany({
    data: [
      { title: "DBMS Lecture", startTime: new Date(now.setHours(9, 0, 0, 0)).toISOString(), endTime: new Date(now.setHours(10, 0, 0, 0)).toISOString(), subject: "DBMS", allDay: false },
      { title: "Math Tutorial", startTime: new Date(now.setHours(14, 0, 0, 0)).toISOString(), endTime: new Date(now.setHours(15, 0, 0, 0)).toISOString(), subject: "Mathematics", allDay: false },
      { title: "DBMS Exam", startTime: new Date(tomorrow.setHours(10, 0, 0, 0)).toISOString(), endTime: new Date(tomorrow.setHours(12, 0, 0, 0)).toISOString(), subject: "DBMS", allDay: false },
      { title: "Project Deadline", startTime: new Date(tomorrow.setHours(23, 59, 0, 0)).toISOString(), endTime: new Date(tomorrow.setHours(23, 59, 0, 0)).toISOString(), allDay: true },
    ],
  })

  console.log("Seed data inserted successfully")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
