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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect, useCallback } from "react"
import type { Subject, TimeSlot } from "@/types/subject"
import { DAY_OPTIONS } from "@/data/subject-constants"
import { Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { timeslots as oneToOneTimeslots } from "@/data/timeslots"
import { students as allStudents } from "@/data/students"
import type { Timeslot as OneToOneTimeslot } from "@/types/timeslot.ts"
import type { Student } from "@/types/student"

interface TimeSlotModalProps {
  subject: Subject
  isOpen: boolean
  onClose: () => void
  onSave: (timeSlots: TimeSlot[]) => void
  isOneToOneMode?: boolean
  onSaveOneToOne?: (slots: OneToOneTimeslot[]) => void
}

export function TimeSlotModal({ subject, isOpen, onClose, onSave, isOneToOneMode = false, onSaveOneToOne }: TimeSlotModalProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [oneToOneStudents, setOneToOneStudents] = useState<Student[]>([])
  const [oneToOneSlots, setOneToOneSlots] = useState<OneToOneTimeslot[]>([])

  useEffect(() => {
    if (!subject) return

    // Initialize normal mode time slots
    setTimeSlots(JSON.parse(JSON.stringify(subject.timeSlots || [])))

    // Initialize 1-to-1 students and slots
    const eligibleStudents = allStudents.filter(
      (s) => s.mode === "1 to 1" && Array.isArray(s.subjects) && s.subjects.includes(subject.code),
    )
    setOneToOneStudents(eligibleStudents)

    const slotsForSubject = oneToOneTimeslots.filter((t) => t.subjectCode === subject.code)
    setOneToOneSlots(JSON.parse(JSON.stringify(slotsForSubject)))
  }, [subject])

  const handleTimeSlotChange = useCallback((index: number, field: keyof TimeSlot, value: string) => {
    setTimeSlots((prev) => {
      const newTimeSlots = [...prev]
      newTimeSlots[index] = { ...newTimeSlots[index], [field]: value }
      return newTimeSlots
    })
  }, [])

  const addTimeSlot = useCallback(() => {
    setTimeSlots((prev) => [...prev, { day: "Monday", startTime: "09:00", endTime: "10:00" }])
  }, [])

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
        startTime: "09:00 AM",
        endTime: "10:00 AM",
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
                      <div className="col-span-3">
                        <Input
                          placeholder="Start Time (e.g., 10:00 AM)"
                          value={slot.startTime}
                          onChange={(e) => handleOneToOneSlotChange(index, "startTime", e.target.value)}
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          placeholder="End Time (e.g., 11:00 AM)"
                          value={slot.endTime}
                          onChange={(e) => handleOneToOneSlotChange(index, "endTime", e.target.value)}
                        />
                      </div>
                      <div className="col-span-2">
                        <Select
                          onValueChange={(value) => handleOneToOneSlotChange(index, "studentId", value)}
                          value={slot.studentId}
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
                      <div className="col-span-1 flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOneToOneSlot(index)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
                    <div className="col-span-3">
                      <Input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => handleTimeSlotChange(index, "startTime", e.target.value)}
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => handleTimeSlotChange(index, "endTime", e.target.value)}
                      />
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTimeSlot(index)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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