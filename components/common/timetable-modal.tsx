"use client"

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
import type { Timeslot as OneToOneTimeslot } from "@/types/timeslot.ts"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TimetableModalProps {
  title: string
  subjects: Subject[]
  isOpen: boolean
  onClose: () => void
  isOneToOneMode?: boolean
  oneToOneSlots?: OneToOneTimeslot[]
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const DAY_MAP: { [key: string]: number } = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
}

const MIN_HOUR = 9
const MAX_HOUR = 24 // 9 AM to 11 PM range
const HOURS = Array.from({ length: MAX_HOUR - MIN_HOUR }, (_, i) => i + MIN_HOUR)
const REM_PER_MINUTE = 4 / 60 // Each hour is h-16 (4rem), so 4rem/60min

export function TimetableModal({ title, subjects, isOpen, onClose, isOneToOneMode = false, oneToOneSlots = [] }: TimetableModalProps) {
  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number)
    return hours * 60 + minutes
  }

  const formatTime = (time: string) => {
    const date = new Date(`1970-01-01T${time}`)
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl bg-white">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="relative">
          {/* Day Headers */}
          <div className="flex sticky top-0 z-20 bg-white">
            <div className="w-14 md:w-20 flex-shrink-0" /> {/* Spacer */}
            <div className="flex-grow grid grid-cols-7">
              {DAYS.map((day) => (
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
                      {new Date(`1970-01-01T${String(hour).padStart(2, "0")}:00`).toLocaleTimeString(
                        "en-US",
                        {
                          hour: "numeric",
                          hour12: true,
                        },
                      )}
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
                  {isOneToOneMode && oneToOneSlots.length > 0
                    ? oneToOneSlots.map((slot, index) => {
                        const dayIndex = DAY_MAP[slot.day]
                        if (dayIndex === undefined) return null

                        const startMinutes = timeToMinutes(slot.startTime)
                        const endMinutes = timeToMinutes(slot.endTime)

                        const top = (startMinutes - MIN_HOUR * 60) * REM_PER_MINUTE
                        const height = (endMinutes - startMinutes) * REM_PER_MINUTE

                        if (endMinutes < MIN_HOUR * 60 || startMinutes >= MAX_HOUR * 60) return null

                        return (
                          <div
                            key={`${slot.subjectCode}-${slot.timeslotId ?? index}`}
                            className="absolute p-1 rounded-md bg-blue-100 border border-blue-300 text-blue-800 overflow-hidden z-10"
                            style={{
                              left: `calc(${(100 / 7) * dayIndex}% + 2px)`,
                              width: `calc(${(100 / 7)}% - 4px)`,
                              top: `${top}rem`,
                              height: `${height}rem`,
                            }}
                          >
                            <p className="font-semibold text-[10px] leading-tight">{slot.subjectCode.toUpperCase()}</p>
                            <p className="text-[10px] leading-tight">{slot.studentName}</p>
                            <p className="text-[10px] leading-tight">
                              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                            </p>
                          </div>
                        )
                      })
                    : subjects.flatMap((subject) =>
                        subject.timeSlots.map((slot, index) => {
                          const dayIndex = DAY_MAP[slot.day]
                          if (dayIndex === undefined) return null

                          const startMinutes = timeToMinutes(slot.startTime)
                          const endMinutes = timeToMinutes(slot.endTime)

                          const top = (startMinutes - MIN_HOUR * 60) * REM_PER_MINUTE
                          const height = (endMinutes - startMinutes) * REM_PER_MINUTE

                          if (endMinutes < MIN_HOUR * 60 || startMinutes >= MAX_HOUR * 60) return null

                          return (
                            <div
                              key={`${subject.code}-${index}`}
                              className="absolute p-1 rounded-md bg-blue-100 border border-blue-300 text-blue-800 overflow-hidden z-10"
                              style={{
                                left: `calc(${(100 / 7) * dayIndex}% + 2px)`,
                                width: `calc(${(100 / 7)}% - 4px)`,
                                top: `${top}rem`,
                                height: `${height}rem`,
                              }}
                            >
                              <p className="font-semibold text-[10px] leading-tight">{subject.code.toUpperCase()}</p>
                              <p className="text-[10px] leading-tight">
                                {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                              </p>
                            </div>
                          )
                        }),
                      )}
                </div>
              </div>
            </div>
          </ScrollArea>
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