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

interface TimeSlotModalProps {
  subject: Subject
  isOpen: boolean
  onClose: () => void
  onSave: (timeSlots: TimeSlot[]) => void
}

export function TimeSlotModal({ subject, isOpen, onClose, onSave }: TimeSlotModalProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])

  useEffect(() => {
    if (subject) {
      // Deep copy to avoid mutating the original subject object
      setTimeSlots(JSON.parse(JSON.stringify(subject.timeSlots || [])))
    }
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

  const handleSave = () => {
    onSave(timeSlots)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white">
        <DialogHeader>
          <DialogTitle>Edit Schedule for {subject.name}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div>
            <Label className="text-lg font-medium">Time Slots</Label>
            <div className="space-y-4 mt-2 max-h-[400px] overflow-y-auto pr-2">
              {timeSlots.map((slot, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center p-2 rounded-md border">
                  <div className="col-span-4">
                    <Select
                      onValueChange={(value) => handleTimeSlotChange(index, "day", value)}
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