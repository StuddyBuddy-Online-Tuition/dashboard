"use client"

import { useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Subject } from "@/types/subject"
import type { Timeslot } from "@/types/timeslot"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn, getAbbrev, getSubjectColor } from "@/lib/utils"

interface TimetableModalProps {
  title: string
  subjects: Subject[]
  isOpen: boolean
  onClose: () => void
  isOneToOneMode?: boolean
  oneToOneSlots?: Timeslot[]
  normalSlots?: Timeslot[]
}

// Align day ordering to Monday → Sunday (same as master timetable)
const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const
const DAYS_FULL = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const
const DAY_TO_INDEX: Record<string, number> = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6,
}

// Night time windows used in master timetable
const TIME_WINDOWS = [
  { start: "20:15", end: "21:15", label: "20:15–21:15" },
  { start: "21:20", end: "22:20", label: "21:20–22:20" },
] as const

type TimeWindowIndex = 0 | 1

function getTimeWindowIndex(startTime: string, endTime: string): TimeWindowIndex | null {
  if (startTime === TIME_WINDOWS[0].start && endTime === TIME_WINDOWS[0].end) return 0
  if (startTime === TIME_WINDOWS[1].start && endTime === TIME_WINDOWS[1].end) return 1
  return null
}

// subject helpers are imported from utils

export function TimetableModal({ title, subjects, isOpen, onClose, isOneToOneMode = false, oneToOneSlots = [], normalSlots = [] }: TimetableModalProps) {
  // In 1-to-1 mode, show all hours (0–24). Otherwise, the hourly grid is not used.
  const MIN_HOUR = isOneToOneMode ? 0 : 9
  const MAX_HOUR = 24
  const HOURS = useMemo(() => Array.from({ length: MAX_HOUR - MIN_HOUR }, (_, i) => i + MIN_HOUR), [MIN_HOUR])

  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number)
    return hours * 60 + minutes
  }

  const formatTime = (time: string) => {
    const date = new Date(`1970-01-01T${time}`)
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
  }

  // Build a Subject lookup from props
  const subjectByCode = useMemo(() => {
    const map = new Map<string, Subject>()
    for (const s of subjects) map.set(s.code, s)
    return map
  }, [subjects])

  // Normal mode grid: day -> windowIndex -> Subject[]
  const normalModeGrid = useMemo(() => {
    const grid: Record<string, Record<number, Subject[]>> = {}
    for (const day of DAYS_FULL) {
      grid[day] = { 0: [], 1: [] }
    }
    for (const slot of normalSlots) {
      const idx = getTimeWindowIndex(slot.startTime, slot.endTime)
      if (idx === null) continue
      const subject = subjectByCode.get(slot.subjectCode)
      if (!subject) continue
      grid[slot.day][idx].push(subject)
    }
    return grid
  }, [normalSlots, subjectByCode])

  const legendItems = useMemo(() => {
    const map = new Map<string, { abbrev: string; colorClass: string }>()
    for (const day of DAYS_FULL) {
      const windows = normalModeGrid[day]
      if (!windows) continue
      for (const idx of [0, 1] as TimeWindowIndex[]) {
        for (const subject of windows[idx] ?? []) {
          if (!map.has(subject.name)) {
            const abbrev = getAbbrev(subject.name)
            map.set(subject.name, { abbrev, colorClass: getSubjectColor(abbrev) })
          }
        }
      }
    }
    return Array.from(map, ([name, info]) => ({ name, ...info })).sort((a, b) => a.abbrev.localeCompare(b.abbrev))
  }, [normalModeGrid])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl bg-white">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="relative">
          {isOneToOneMode ? (
            <>
              {/* Day Headers */}
              <div className="flex sticky top-0 z-20 bg-white">
                <div className="w-14 md:w-20 flex-shrink-0" />
                <div className="flex-grow grid grid-cols-7">
                  {DAYS_SHORT.map((day) => (
                    <div key={day} className="text-center font-medium py-2 border-b border-l">
                      {day}
                    </div>
                  ))}
                </div>
              </div>

              <ScrollArea className="h-[70vh]">
                <div className="flex text-sm pt-1">
                  {/* Time Column */}
                  <div className="w-14 md:w-20 flex-shrink-0">
                    {HOURS.map((hour) => (
                      <div key={hour} className="h-16 text-right pr-2 border-r">
                        <span className="relative -top-2 text-xs text-gray-500">
                          {new Date(`1970-01-01T${String(hour).padStart(2, "0")}:00`).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            hour12: true,
                          })}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Schedule Area */}
                  <div className="flex-grow relative">
                    {/* Background Grid Lines */}
                    <div className="absolute inset-0 grid grid-cols-7">
                      {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className="border-l h-full">
                          {HOURS.map((hour) => (
                            <div key={hour} className="h-16 border-t" />
                          ))}
                        </div>
                      ))}
                    </div>

                    {/* Time Slots Container */}
                    <div className="absolute inset-0">
                      {oneToOneSlots.map((slot, index) => {
                        const dayIndex = DAY_TO_INDEX[slot.day]
                        if (dayIndex === undefined) return null

                        const startMinutes = timeToMinutes(slot.startTime)
                        const endMinutes = timeToMinutes(slot.endTime)

                        const remPerMinute = 4 / 60
                        const topRem = (startMinutes - MIN_HOUR * 60) * remPerMinute
                        const heightRem = (endMinutes - startMinutes) * remPerMinute

                        if (endMinutes < MIN_HOUR * 60 || startMinutes >= MAX_HOUR * 60) return null

                        const subject = subjectByCode.get(slot.subjectCode)
                        const abbrev = subject ? getAbbrev(subject.name) : slot.subjectCode.slice(0, 3).toUpperCase()
                        const colorClass = getSubjectColor(abbrev)

                        return (
                          <div
                            key={`${slot.subjectCode}-${slot.timeslotId ?? index}`}
                            className={cn("absolute p-1 rounded-md border overflow-hidden z-10", colorClass)}
                            style={{
                              left: `calc(${(100 / 7) * dayIndex}% + 2px)`,
                              width: `calc(${100 / 7}% - 4px)`,
                              top: `${topRem}rem`,
                              height: `${heightRem}rem`,
                            }}
                          >
                            <p className="font-semibold text-[10px] leading-tight">{abbrev}</p>
                            {slot.studentName && <p className="text-[10px] leading-tight">{slot.studentName}</p>}
                            <p className="text-[10px] leading-tight">
                              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr>
                    {DAYS_FULL.map((day) => (
                      <th key={day} className="border px-2 py-2 text-center" colSpan={2}>
                        {day}
                      </th>
                    ))}
                  </tr>
                  <tr>
                    {DAYS_FULL.flatMap((day) =>
                      TIME_WINDOWS.map((tw) => (
                        <th key={`${day}-${tw.label}`} className="border px-2 py-1 text-center text-xs text-muted-foreground">
                          {tw.label}
                        </th>
                      )),
                    )}
                  </tr>
                </thead>
                <tbody>
                  <tr className="align-top">
                    {DAYS_FULL.flatMap((day) =>
                      ([0, 1] as TimeWindowIndex[]).map((idx) => {
                        const entries = normalModeGrid[day]?.[idx] ?? []
                        return (
                          <td key={`${day}-${idx}`} className="border px-2 py-2">
                            <div className="flex flex-col gap-1">
                              {entries.length === 0 ? (
                                <span className="text-xs text-muted-foreground">-</span>
                              ) : (
                                entries.map((subject) => {
                                  const abbrev = getAbbrev(subject.name)
                                  const colorClass = getSubjectColor(abbrev)
                                  return (
                    <div
                                      key={`${subject.code}-${abbrev}`}
                                      className={cn(
                                        "rounded-md border px-2 py-1 leading-tight",
                                        "text-xs",
                                        colorClass,
                                      )}
                                    >
                                      <div className="flex items-center gap-1 flex-wrap">
                                        <span className="font-semibold">{abbrev}</span>
                                        <span className="opacity-70">•</span>
                                        <span className="font-mono">{subject.code}</span>
                                      </div>
                      
                                    </div>
                                  )
                                })
                              )}
                            </div>
                          </td>
                        )
                      }),
                    )}
                  </tr>
                </tbody>
              </table>

              {/* Legend */}
              {legendItems.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-muted-foreground mr-1">Legend:</span>
                  {legendItems.map((item) => (
                    <div key={item.name} className={cn("flex items-center gap-1 rounded-md border px-2 py-1", item.colorClass)}>
                      <span className="font-semibold">{item.abbrev}</span>
                      <span className="opacity-70">–</span>
                      <span>{item.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 