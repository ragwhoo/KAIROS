"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
} from "date-fns"
import { PageTransition } from "@/components/features/page-transition"
import { useCalendarEvents, createEvent, deleteEvent } from "@/hooks/use-calendar-events"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [eventTitle, setEventTitle] = useState("")
  const [eventTime, setEventTime] = useState("09:00")
  const { events, mutate } = useCalendarEvents()

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const handleAddEvent = async () => {
    if (!eventTitle.trim() || !selectedDate) return
    const [hours, minutes] = eventTime.split(":").map(Number)
    const startTime = new Date(selectedDate)
    startTime.setHours(hours, minutes, 0, 0)
    const endTime = new Date(startTime)
    endTime.setHours(hours + 1, minutes, 0, 0)

    await createEvent({
      title: eventTitle.trim(),
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      allDay: false,
    })
    setEventTitle("")
    setShowAddForm(false)
    mutate()
  }

  const getEventsForDay = (day: Date) =>
    events.filter((e) => isSameDay(new Date(e.startTime), day))

  return (
    <PageTransition>
      <div className="px-10 pt-20 pb-28">
        <div className="flex items-center gap-3 mb-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#7D39EB] to-[#C6FF33]">
            <CalendarIcon className="h-5 w-5 text-black" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
            <p className="text-sm text-text-tertiary">Your schedule, deadlines, and events</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">{format(currentDate, "MMMM yyyy")}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-1 border border-border text-text-tertiary hover:text-foreground hover:bg-surface-2 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="rounded-lg px-3 py-1.5 text-xs font-medium bg-surface-1 border border-border text-text-secondary hover:text-foreground hover:bg-surface-2 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-1 border border-border text-text-tertiary hover:text-foreground hover:bg-surface-2 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-border overflow-hidden">
          <div className="grid grid-cols-7 border-b border-border">
            {weekDays.map((day) => (
              <div key={day} className="p-3 text-center text-xs font-medium text-text-tertiary">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day) => {
              const dayEvents = getEventsForDay(day)
              const inCurrentMonth = isSameMonth(day, currentDate)
              const isTodayCell = isToday(day)
              const isSelected = selectedDate && isSameDay(day, selectedDate)

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => {
                    setSelectedDate(day)
                    setShowAddForm(true)
                  }}
                  className={cn(
                    "min-h-20 p-2 border-b border-r border-border text-left transition-colors hover:bg-surface-1",
                    !inCurrentMonth && "opacity-30",
                    isTodayCell && "bg-primary-50",
                    isSelected && "ring-1 ring-primary ring-inset"
                  )}
                >
                  <span
                    className={cn(
                      "text-xs font-medium",
                      isTodayCell ? "text-primary" : "text-text-secondary"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className="truncate rounded px-1 py-0.5 text-[10px] font-medium bg-primary-100 text-primary"
                      >
                        {event.allDay ? "All day" : format(new Date(event.startTime), "h:mm")}{" "}
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <p className="text-[10px] text-text-tertiary px-1">
                        +{dayEvents.length - 2} more
                      </p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {showAddForm && selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
          >
            <div className="rounded-2xl border border-border bg-surface-2 p-4 space-y-3 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">
                  Add event - {format(selectedDate, "EEE, d MMM")}
                </span>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex h-6 w-6 items-center justify-center rounded-lg text-text-tertiary hover:text-foreground hover:bg-surface-1 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <Input
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddEvent()}
                placeholder="Event title..."
                autoFocus
                className="border-0 bg-surface-1"
              />
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="border-0 bg-surface-1 w-auto"
                />
                <Button variant="primary" size="sm" onClick={handleAddEvent} className="flex-1">
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {events.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-6">All Events</h2>
            <div className="space-y-2">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="group flex items-center gap-3 rounded-xl bg-surface-1 border border-border p-3"
                >
                  <div className="flex flex-col items-center justify-center w-16 shrink-0">
                    <span className="text-xs text-text-tertiary">
                      {format(new Date(event.startTime), "MMM d")}
                    </span>
                    <span className="text-sm font-bold">
                      {format(new Date(event.startTime), "h:mm a")}
                    </span>
                  </div>
                  <div className="w-px h-10 bg-border" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{event.title}</p>
                    {event.subject && (
                      <p className="text-xs text-text-tertiary">{event.subject}</p>
                    )}
                  </div>
                  <button
                    onClick={async () => {
                      await deleteEvent(event.id)
                      mutate()
                    }}
                    className="opacity-0 group-hover:opacity-100 flex h-7 w-7 items-center justify-center rounded-lg text-text-tertiary hover:text-destructive hover:bg-destructive/10 transition-all"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
