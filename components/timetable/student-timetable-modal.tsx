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
  subjects: Subject[]
  isOpen: boolean
  onClose: () => void
  isOneToOneMode: boolean
  oneToOneSlots?: Timeslot[]
  normalSlots?: Timeslot[]
}

const DAYS_FULL = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const

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

function getBaseAbbrevFromCode(subjectCode: string): string {
  const code = subjectCode.replace(/\s*1:1\s*/i, "").trim().toUpperCase()
  if (code.startsWith("AM")) return "AM"
  if (code.startsWith("MM")) return "MM"
  if (code.startsWith("K")) return "KIM"
  if (code.startsWith("F")) return "FIZ"
  if (code.startsWith("B")) return "BIO"
  if (code.startsWith("SEJ")) return "SEJ"
  if (code.startsWith("GEO")) return "GEO"
  if (code.startsWith("PA")) return "PA"
  if (code.startsWith("S")) return "SC"
  return code.slice(0, 3)
}

export default function StudentTimetableModal({ title, subjects, isOpen, onClose, isOneToOneMode, oneToOneSlots = [], normalSlots = [] }: Props) {
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

  // 1-to-1 mode: compute dynamic windows per day based on student's slots
  const oneToOneWindowsByDay = useMemo(() => {
    const result: Record<(typeof DAYS_FULL)[number], string[]> = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    }
    const dayToSet: Record<(typeof DAYS_FULL)[number], Set<string>> = {
      Monday: new Set(),
      Tuesday: new Set(),
      Wednesday: new Set(),
      Thursday: new Set(),
      Friday: new Set(),
      Saturday: new Set(),
      Sunday: new Set(),
    }
    for (const slot of oneToOneSlots) {
      const label = `${slot.startTime}–${slot.endTime}`
      dayToSet[slot.day as (typeof DAYS_FULL)[number]].add(label)
    }
    for (const day of DAYS_FULL) {
      const labels = Array.from(dayToSet[day])
      labels.sort((a, b) => a.localeCompare(b))
      result[day] = labels
    }
    return result
  }, [oneToOneSlots])

  type OneToOneEntry = { subject: Subject | null; subjectCode: string; teacherName: string }
  const oneToOneGrid = useMemo(() => {
    const result: Record<(typeof DAYS_FULL)[number], Record<string, OneToOneEntry[]>> = {
      Monday: {},
      Tuesday: {},
      Wednesday: {},
      Thursday: {},
      Friday: {},
      Saturday: {},
      Sunday: {},
    }
    for (const slot of oneToOneSlots) {
      const subject = subjectByCode.get(slot.subjectCode)
      const label = `${slot.startTime}–${slot.endTime}`
      const day = slot.day as (typeof DAYS_FULL)[number]
      if (!result[day][label]) result[day][label] = []
      result[day][label].push({ subject: subject ?? null, subjectCode: slot.subjectCode, teacherName: slot.teacherName })
    }
    return result
  }, [oneToOneSlots, subjectByCode])

  const normalLegendItems = useMemo(() => {
    const map = new Map<string, { abbrev: string; colorClass: string }>()
    for (const day of DAYS_FULL) {
      const windows = normalModeGrid[day]
      if (!windows) continue
      for (const idx of [0, 1] as TimeWindowIndex[]) {
        for (const subject of windows[idx] ?? []) {
          const key = subject.subject
          if (!map.has(key)) {
            const abbrev = getBaseAbbrevFromSubjectField(subject.subject)
            map.set(key, { abbrev, colorClass: getSubjectColor(abbrev) })
          }
        }
      }
    }
    return Array.from(map, ([name, info]) => ({ name, ...info })).sort((a, b) => a.abbrev.localeCompare(b.abbrev))
  }, [normalModeGrid])

  const oneToOneLegendItems = useMemo(() => {
    const map = new Map<string, { abbrev: string; colorClass: string }>()
    for (const day of DAYS_FULL) {
      const windows = oneToOneGrid[day]
      for (const label in windows) {
        const entries = windows[label] ?? []
        for (const entry of entries) {
          const keyName = entry.subject ? entry.subject.subject : entry.subjectCode
          if (map.has(keyName)) continue
          const abbrev = entry.subject ? getBaseAbbrevFromSubjectField(entry.subject.subject) : getBaseAbbrevFromCode(entry.subjectCode)
          map.set(keyName, { abbrev, colorClass: getSubjectColor(abbrev) })
        }
      }
    }
    return Array.from(map, ([name, info]) => ({ name, ...info })).sort((a, b) => a.abbrev.localeCompare(b.abbrev))
  }, [oneToOneGrid])

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
                  {DAYS_FULL.map((day) => (
                    <th key={day} className="border px-2 py-2 text-center" colSpan={(oneToOneWindowsByDay[day]?.length || 0) || 1}>
                      {day}
                    </th>
                  ))}
                </tr>
                <tr>
                  {DAYS_FULL.flatMap((day) => {
                    const windows = oneToOneWindowsByDay[day]
                    if (!windows || windows.length === 0) {
                      return (
                        <th key={`${day}-empty`} className="border px-2 py-1 text-center text-xs text-muted-foreground">
                          —
                        </th>
                      )
                    }
                    return windows.map((label) => (
                      <th key={`${day}-${label}`} className="border px-2 py-1 text-center text-xs text-muted-foreground">
                        {label}
                      </th>
                    ))
                  })}
                </tr>
              </thead>
              <tbody>
                <tr className="align-top">
                  {DAYS_FULL.flatMap((day) => {
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
                              entries.map((entry, idx) => {
                                const abbrev = entry.subject ? getBaseAbbrevFromSubjectField(entry.subject.subject) : getBaseAbbrevFromCode(entry.subjectCode)
                                const colorClass = getSubjectColor(abbrev)
                                const key = entry.subject ? `${entry.subject.code}-${abbrev}` : `${entry.subjectCode}-${idx}`
                                return (
                                  <div
                                    key={key}
                                    className={cn(
                                      "rounded-md border px-2 py-1 leading-tight",
                                      "text-xs",
                                      colorClass,
                                    )}
                                  >
                                    <div className="flex items-center gap-1 flex-wrap">
                                      <span className="font-semibold">{abbrev}</span>
                                      <span className="opacity-70">•</span>
                                      <span className="font-mono">{entry.subject ? entry.subject.code : entry.subjectCode}</span>
                                    </div>
                                    {entry.teacherName && (
                                      <div className="opacity-80 text-[10px]">{entry.teacherName}</div>
                                    )}
                                  </div>
                                )
                              })
                            )}
                          </div>
                        </td>
                      )
                    })
                  })}
                </tr>
              </tbody>
            </table>

            {oneToOneLegendItems.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-muted-foreground mr-1">Legend:</span>
                {oneToOneLegendItems.map((item) => (
                  <div key={item.name} className={cn("flex items-center gap-1 rounded-md border px-2 py-1", item.colorClass)}>
                    <span className="font-semibold">{item.abbrev}</span>
                    <span className="opacity-70">–</span>
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
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
                  {DAYS_FULL.flatMap((day) => (
                    TIME_WINDOWS.map((tw) => (
                      <th key={`${day}-${tw.label}`} className="border px-2 py-1 text-center text-xs text-muted-foreground">
                        {tw.label}
                      </th>
                    ))
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="align-top">
                  {DAYS_FULL.flatMap((day) => (
                    ([0, 1] as TimeWindowIndex[]).map((idx) => {
                      const entries = normalModeGrid[day]?.[idx] ?? []
                      return (
                        <td key={`${day}-${idx}`} className="border px-2 py-2">
                          <div className="flex flex-col gap-1">
                            {entries.length === 0 ? (
                              <span className="text-xs text-muted-foreground">-</span>
                            ) : (
                              entries.map((subject) => {
                                const abbrev = getBaseAbbrevFromSubjectField(subject.subject)
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
                    })
                  ))}
                </tr>
              </tbody>
            </table>

            {normalLegendItems.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-muted-foreground mr-1">Legend:</span>
                {normalLegendItems.map((item) => (
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
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


