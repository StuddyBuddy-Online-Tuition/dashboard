"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Subject } from "@/types/subject"

interface SubjectModalProps {
  subject: Subject
  onClose: () => void
  onSave: (subject: Subject, originalCode?: string) => void
}

const STANDARD_OPTIONS = ["S1", "S2", "S3", "S4", "S5", "F1", "F2", "F3", "F4", "F5"]
const timeOptions = Array.from({ length: 24 * 2 }, (_, i) => {
  const hours = Math.floor(i / 2)
  const minutes = i % 2 === 0 ? "00" : "30"
  return `${String(hours).padStart(2, "0")}:${minutes}`
})

export default function SubjectModal({ subject, onClose, onSave }: SubjectModalProps) {
  const [formData, setFormData] = useState<Subject>(subject)
  const [originalCode] = useState(subject.code)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleStandardChange = (value: string) => {
    setFormData((prev) => ({ ...prev, standard: value }))
  }

  const handleTimeChange = (name: "timeStarts" | "timeEnds", value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.code.trim() || !formData.name.trim() || !formData.standard.trim()) {
      alert("Please fill in all required fields.")
      return
    }

    onSave(formData, originalCode)
  }

  const isEditing = Boolean(originalCode)

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[95vw] p-4 rounded-lg sm:w-auto sm:max-w-[500px] sm:p-6 border-secondary/20">
        <DialogHeader className="bg-gradient-to-r from-secondary/20 to-primary/20 -mx-4 -mt-4 px-4 py-3 rounded-t-lg">
          <DialogTitle className="text-navy">{isEditing ? "Edit Subject" : "Add New Subject"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Subject Code field */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="code" className="text-navy sm:text-right">
                Subject Code *
              </Label>
              <Input
                id="code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className="sm:col-span-3 border-secondary/20 font-mono"
                placeholder="e.g., MMF4, BIF5, K1F4"
                required
              />
            </div>

            {/* Subject Name field */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="name" className="text-navy sm:text-right">
                Subject Name *
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="sm:col-span-3 border-secondary/20"
                placeholder="e.g., Mathematics, Biology, Kimia"
                required
              />
            </div>

            {/* Standard field */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="standard" className="text-navy sm:text-right">
                Standard/Form *
              </Label>
              <Select value={formData.standard} onValueChange={handleStandardChange}>
                <SelectTrigger className="sm:col-span-3 border-secondary/20">
                  <SelectValue placeholder="Select standard/form" />
                </SelectTrigger>
                <SelectContent>
                  {STANDARD_OPTIONS.map((standard) => (
                    <SelectItem key={standard} value={standard}>
                      {standard}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time Starts field */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="timeStarts" className="text-navy sm:text-right">
                Time Starts *
              </Label>
              <Select value={formData.timeStarts} onValueChange={(value) => handleTimeChange("timeStarts", value)}>
                <SelectTrigger className="sm:col-span-3 border-secondary/20">
                  <SelectValue placeholder="Select start time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time Ends field */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="timeEnds" className="text-navy sm:text-right">
                Time Ends *
              </Label>
              <Select value={formData.timeEnds} onValueChange={(value) => handleTimeChange("timeEnds", value)}>
                <SelectTrigger className="sm:col-span-3 border-secondary/20">
                  <SelectValue placeholder="Select end time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Teacher Name field */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="teacherName" className="text-navy sm:text-right">
                Teacher Name *
              </Label>
              <Input
                id="teacherName"
                name="teacherName"
                value={formData.teacherName}
                onChange={handleChange}
                className="sm:col-span-3 border-secondary/20"
                placeholder="e.g., Mr. John Doe"
                required
              />
            </div>
          </div>

          <DialogFooter className="flex-col space-y-2 mt-4 sm:flex-row sm:space-y-0 sm:mt-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full h-11 sm:w-auto sm:h-auto border-secondary/20 text-navy hover:bg-secondary/10 bg-transparent"
            >
              Cancel
            </Button>
            <Button type="submit" className="w-full h-11 sm:w-auto sm:h-auto bg-accent text-navy hover:bg-accent/90">
              {isEditing ? "Update Subject" : "Add Subject"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
