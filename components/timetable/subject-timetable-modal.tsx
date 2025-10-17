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
import { cn, getSubjectColor } from "@/lib/utils"

interface Props {
  title: string
  subject: Subject
  isOpen: boolean
  onClose: () => void
  normalSlots: Timeslot[]
  oneToOneSlots: Timeslot[]
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const

const TIME_WINDOWS = [
  { start: "20:15", end: "21:15", label: "20:15–21:15" },
  { start: "21:20", end: "22:20", label: "21:20–22:20" },
] as const

type TimeWindowIndex = 0 | 1

function getTimeWindowIndex(startTime: string, endTime: string): TimeWindowIndex | null {
  const s = startTime.slice(0, 5)
  const e = endTime.slice(0, 5)
  if (s === TIME_WINDOWS[0].start && e === TIME_WINDOWS[0].end) return 0
  if (s === TIME_WINDOWS[1].start && e === TIME_WINDOWS[1].end) return 1
  return null
}

function getBaseAbbrevFromSubjectField(subjectField: string): string {
  const normalized = subjectField
    .replace(/\b(BM|DLP)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()

  if (normalized.startsWith("kimia")) return "KIM"
  if (normalized.startsWith("fizik")) return "FIZ"
  if (normalized.startsWith("biology") || normalized.startsWith("biologi")) return "BIO"
  if (normalized.startsWith("add math")) return "AM"
  if (normalized.startsWith("matematik")) return "MM"
  if (normalized.startsWith("bahasa malaysia")) return "BM"
  if (normalized.startsWith("bahasa inggeris")) return "BI"
  if (normalized.startsWith("sejarah")) return "SEJ"
  if (normalized.startsWith("geografi")) return "GEO"
  if (normalized.startsWith("sains")) return "SC"
  return subjectField.slice(0, 3).toUpperCase()
}

export default function SubjectTimetableModal({ title, subject, isOpen, onClose, normalSlots = [], oneToOneSlots = [] }: Props) {
  const isOneToOneMode = subject.type === "1 to 1"

  const subjectByCode = useMemo(() => {
    const map = new Map<string, Subject>()
    map.set(subject.code, subject)
    return map
  }, [subject])

  // Normal mode grid: day -> windowIndex -> boolean (presence)
  const normalModeGrid = useMemo(() => {
    const grid: Record<string, Record<number, boolean>> = {}
    for (const day of DAYS) grid[day] = { 0: false, 1: false }
    for (const slot of normalSlots) {
      const idx = getTimeWindowIndex(slot.startTime, slot.endTime)
      if (idx === null) continue
      grid[slot.day][idx] = true
    }
    return grid
  }, [normalSlots])

  const oneToOneWindowsByDay = useMemo(() => {
    const result: Record<(typeof DAYS)[number], string[]> = {
      Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [],
    }
    const dayToSet: Record<(typeof DAYS)[number], Set<string>> = {
      Monday: new Set(), Tuesday: new Set(), Wednesday: new Set(), Thursday: new Set(), Friday: new Set(), Saturday: new Set(), Sunday: new Set(),
    }
    for (const slot of oneToOneSlots) {
      dayToSet[slot.day as (typeof DAYS)[number]].add(`${slot.startTime}–${slot.endTime}`)
    }
    for (const day of DAYS) {
      const labels = Array.from(dayToSet[day])
      labels.sort((a, b) => a.localeCompare(b))
      result[day] = labels
    }
    return result
  }, [oneToOneSlots])

  type OneToOneEntry = { subjectCode: string; teacherName: string }
  const oneToOneGrid = useMemo(() => {
    const result: Record<(typeof DAYS)[number], Record<string, OneToOneEntry[]>> = {
      Monday: {}, Tuesday: {}, Wednesday: {}, Thursday: {}, Friday: {}, Saturday: {}, Sunday: {},
    }
    for (const slot of oneToOneSlots) {
      const label = `${slot.startTime}–${slot.endTime}`
      const day = slot.day as (typeof DAYS)[number]
      if (!result[day][label]) result[day][label] = []
      result[day][label].push({ subjectCode: slot.subjectCode, teacherName: slot.teacherName })
    }
    return result
  }, [oneToOneSlots])

  const abbrev = getBaseAbbrevFromSubjectField(subject.subject)
  const colorClass = getSubjectColor(abbrev)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl bg-white">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {isOneToOneMode ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr>
                  {DAYS.map((day) => (
                    <th key={day} className="border px-2 py-2 text-center" colSpan={(oneToOneWindowsByDay[day]?.length || 0) || 1}>
                      {day}
                    </th>
                  ))}
                </tr>
                <tr>
                  {DAYS.flatMap((day) => {
                    const windows = oneToOneWindowsByDay[day]
                    if (!windows || windows.length === 0) {
                      return (
                        <th key={`${day}-empty`} className="border px-2 py-1 text-center text-xs text-muted-foreground">—</th>
                      )
                    }
                    return windows.map((label) => (
                      <th key={`${day}-${label}`} className="border px-2 py-1 text-center text-xs text-muted-foreground">{label}</th>
                    ))
                  })}
                </tr>
              </thead>
              <tbody>
                <tr className="align-top">
                  {DAYS.flatMap((day) => {
                    const windows = oneToOneWindowsByDay[day]
                    const safeWindows = windows && windows.length > 0 ? windows : [""]
                    return safeWindows.map((label) => {
                      const entries = (oneToOneGrid[day]?.[label] ?? []) as OneToOneEntry[]
                      return (
                        <td key={`${day}-${label || "empty"}`} className="border px-2 py-2">
                          <div className="flex flex-col gap-1">
                            {entries.length === 0 ? (
                              <span className="text-xs text-muted-foreground">-</span>
                            ) : (
                              entries.map((entry, idx) => (
                                <div
                                  key={`${entry.subjectCode}-${idx}`}
                                  className={cn("rounded-md border px-2 py-1 leading-tight", "text-xs", colorClass)}
                                >
                                  <div className="flex items-center gap-1 flex-wrap">
                                    <span className="font-semibold">{abbrev}</span>
                                    <span className="opacity-70">•</span>
                                    <span className="font-mono">{subject.code}</span>
                                  </div>
                                  {entry.teacherName && (
                                    <div className="opacity-80 text-[10px]">{entry.teacherName}</div>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </td>
                      )
                    })
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr>
                  {DAYS.map((day) => (
                    <th key={day} className="border px-2 py-2 text-center" colSpan={2}>{day}</th>
                  ))}
                </tr>
                <tr>
                  {DAYS.flatMap((day) => (
                    TIME_WINDOWS.map((tw) => (
                      <th key={`${day}-${tw.label}`} className="border px-2 py-1 text-center text-xs text-muted-foreground">{tw.label}</th>
                    ))
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="align-top">
                  {DAYS.flatMap((day) => (
                    ([0, 1] as TimeWindowIndex[]).map((idx) => (
                      <td key={`${day}-${idx}`} className="border px-2 py-2">
                        <div className="flex flex-col gap-1">
                          {normalModeGrid[day]?.[idx] ? (
                            <div className={cn("rounded-md border px-2 py-1 leading-tight", "text-xs", colorClass)}>
                              <div className="flex items-center gap-1 flex-wrap">
                                <span className="font-semibold">{abbrev}</span>
                                <span className="opacity-70">•</span>
                                <span className="font-mono">{subject.code}</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </div>
                      </td>
                    ))
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


