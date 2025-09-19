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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect, useCallback } from "react"
import type { Subject } from "@/types/subject"
import type { Timeslot } from "@/types/timeslot"
import { DAY_OPTIONS } from "@/data/subject-constants"
import { Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { timeslots as allTimeslots } from "@/data/timeslots"
import { students as allStudents } from "@/data/students"
import type { Timeslot as OneToOneTimeslot } from "@/types/timeslot"
import type { Student } from "@/types/student"

// Constrained night windows for non 1-to-1 mode
const NIGHT_WINDOWS = [
  { key: "early", label: "20:15 – 21:15", startTime: "20:15", endTime: "21:15" },
  { key: "late", label: "21:20 – 22:20", startTime: "21:20", endTime: "22:20" },
] as const

type NightWindowKey = (typeof NIGHT_WINDOWS)[number]["key"]

function getWindowKeyFromTimes(startTime: string, endTime: string): NightWindowKey {
  const match = NIGHT_WINDOWS.find((w) => w.startTime === startTime && w.endTime === endTime)
  return (match?.key ?? "early") as NightWindowKey
}

interface TimeSlotModalProps {
  subject: Subject
  isOpen: boolean
  onClose: () => void
  onSave: (timeSlots: Timeslot[]) => void
  isOneToOneMode?: boolean
  onSaveOneToOne?: (slots: OneToOneTimeslot[]) => void
}

export function TimeSlotModal({ subject, isOpen, onClose, onSave, isOneToOneMode = false, onSaveOneToOne }: TimeSlotModalProps) {
  const [timeSlots, setTimeSlots] = useState<Timeslot[]>([])
  const [oneToOneStudents, setOneToOneStudents] = useState<Student[]>([])
  const [oneToOneSlots, setOneToOneSlots] = useState<OneToOneTimeslot[]>([])

  useEffect(() => {
    if (!subject) return

    // Initialize normal mode time slots from unified dataset
    const normal = allTimeslots.filter(
      (t) => t.subjectCode === subject.code && t.studentId === null && t.studentName === null,
    )
    setTimeSlots(JSON.parse(JSON.stringify(normal)))

    // Initialize 1-to-1 students and slots
    const eligibleStudents = allStudents.filter(
      (s) => Array.isArray(s.subjects) && s.subjects.includes(subject.code) && Array.isArray(s.modes) && s.modes.includes("1 TO 1"),
    )
    setOneToOneStudents(eligibleStudents)

    const slotsForSubject = allTimeslots.filter(
      (t) => t.subjectCode === subject.code && t.studentId !== null && t.studentName !== null,
    )
    setOneToOneSlots(JSON.parse(JSON.stringify(slotsForSubject)))

  }, [subject])

  const handleTimeSlotChange = useCallback((index: number, field: keyof Timeslot, value: string) => {
    setTimeSlots((prev) => {
      const newTimeSlots = [...prev]
      newTimeSlots[index] = { ...newTimeSlots[index], [field]: value }
      return newTimeSlots
    })
  }, [])

  const addTimeSlot = useCallback(() => {
    // Default to the early night window
    setTimeSlots((prev) => [
      ...prev,
      {
        timeslotId: `new-${Date.now()}`,
        subjectCode: subject.code,
        day: "Monday",
        startTime: NIGHT_WINDOWS[0].startTime,
        endTime: NIGHT_WINDOWS[0].endTime,
        teacherName: "",
        studentId: null,
        studentName: null,
      },
    ])
  }, [subject.code])

  const removeTimeSlot = useCallback((index: number) => {
    setTimeSlots((prev) => prev.filter((_, i) => i !== index))
  }, [])

  // 1-to-1 handlers
  const handleOneToOneSlotChange = useCallback(
    (index: number, field: keyof OneToOneTimeslot, value: string) => {
      setOneToOneSlots((prev) => {
        const next = [...prev]
        const updated = { ...next[index] }
        if (field === "studentId") {
          const selected = oneToOneStudents.find((s) => s.studentId === value)
          updated.studentId = value
          updated.studentName = selected ? selected.name : ""
        } else if (field === "day" || field === "startTime" || field === "endTime") {
          ;(updated as any)[field] = value
        }
        next[index] = updated
        return next
      })
    },
    [oneToOneStudents],
  )

  const addOneToOneSlot = useCallback(() => {
    const defaultStudent = oneToOneStudents[0]
    setOneToOneSlots((prev) => [
      ...prev,
      {
        timeslotId: `new-${Date.now()}`,
        subjectCode: subject.code,
        studentId: defaultStudent ? defaultStudent.studentId : "",
        studentName: defaultStudent ? defaultStudent.name : "",
        day: "Monday",
        startTime: "09:00",
        endTime: "10:00",
        teacherName: "",
      },
    ])
  }, [oneToOneStudents, subject.code])

  const removeOneToOneSlot = useCallback((index: number) => {
    setOneToOneSlots((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleSave = () => {
    if (isOneToOneMode) {
      onSaveOneToOne?.(oneToOneSlots)
      onClose()
      return
    }
    onSave(timeSlots)
    onClose()
  }

  // Non 1-to-1: switch time window for a slot
  const handleTimeWindowChange = useCallback((index: number, key: NightWindowKey) => {
    const windowDef = NIGHT_WINDOWS.find((w) => w.key === key)!
    setTimeSlots((prev) => {
      const next = [...prev]
      next[index] = {
        ...next[index],
        startTime: windowDef.startTime,
        endTime: windowDef.endTime,
      }
      return next
    })
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white">
        <DialogHeader>
          <DialogTitle>
            {isOneToOneMode ? `Edit 1-to-1 Schedule for ${subject.name}` : `Edit Schedule for ${subject.name}`}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-6">
          {isOneToOneMode ? (
            <>
              <div>
                <Label className="text-lg font-medium">1-to-1 Time Slots</Label>
                <div className="space-y-4 mt-2 max-h-[400px] overflow-y-auto pr-2">
                  {oneToOneSlots.map((slot, index) => (
                    <div key={slot.timeslotId ?? index} className="grid grid-cols-12 gap-2 items-center p-2 rounded-md border">
                      <div className="col-span-3">
                        <Select
                          onValueChange={(value) => handleOneToOneSlotChange(index, "day", value as any)}
                          value={slot.day}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Day" />
                          </SelectTrigger>
                          <SelectContent>
                            {DAY_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => handleOneToOneSlotChange(index, "startTime", e.target.value)}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => handleOneToOneSlotChange(index, "endTime", e.target.value)}
                        />
                      </div>
                      <div className="col-span-2">
                        <Select
                          onValueChange={(value) => handleOneToOneSlotChange(index, "studentId", value)}
                          value={slot.studentId ?? ""}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Student" />
                          </SelectTrigger>
                          <SelectContent>
                            {oneToOneStudents.map((s) => (
                              <SelectItem key={s.studentId} value={s.studentId}>
                                {s.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Input
                          placeholder="Teacher name"
                          value={slot.teacherName ?? ""}
                          onChange={(e) => handleOneToOneSlotChange(index, "teacherName" as any, e.target.value)}
                        />
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove time slot?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. The selected time slot will be permanently removed.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => removeOneToOneSlot(index)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={addOneToOneSlot} className="mt-4">
                  Add 1-to-1 Time Slot
                </Button>
              </div>
            </>
          ) : (
            <div>
              <Label className="text-lg font-medium">Time Slots</Label>
              <div className="space-y-4 mt-2 max-h-[400px] overflow-y-auto pr-2">
                {timeSlots.map((slot, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center p-2 rounded-md border">
                    <div className="col-span-4">
                      <Select onValueChange={(value) => handleTimeSlotChange(index, "day", value)} value={slot.day}>
                        <SelectTrigger>
                          <SelectValue placeholder="Day" />
                        </SelectTrigger>
                        <SelectContent>
                          {DAY_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-4">
                      <Select
                        onValueChange={(value) => handleTimeWindowChange(index, value as NightWindowKey)}
                        value={getWindowKeyFromTimes(slot.startTime, slot.endTime)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Time Window" />
                        </SelectTrigger>
                        <SelectContent>
                          {NIGHT_WINDOWS.map((w) => (
                            <SelectItem key={w.key} value={w.key}>
                              {w.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-3">
                      <Input
                        placeholder="Teacher name"
                        value={slot.teacherName ?? ""}
                        onChange={(e) => handleTimeSlotChange(index, "teacherName", e.target.value)}
                      />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove time slot?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. The selected time slot will be permanently removed.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => removeTimeSlot(index)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={addTimeSlot} className="mt-4">
                Add Time Slot
              </Button>
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 