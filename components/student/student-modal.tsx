"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import type { Student } from "@/types/student"

interface StudentModalProps {
  student: Student
  onClose: () => void
  onSave: (student: Student) => void
}

const AVAILABLE_SUBJECTS = [
  "Mathematics",
  "English",
  "Science",
  "History",
  "Geography",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "Art",
  "Music",
]

const GRADE_OPTIONS = ["S1", "S2", "S3", "S4", "S5", "F1", "F2", "F3", "F4", "F5", "CP"]

export default function StudentModal({ student, onClose, onSave }: StudentModalProps) {
  const [formData, setFormData] = useState<Student>(student)
  const [newSubject, setNewSubject] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      status: value as "active" | "pending" | "inactive" | "trial",
    }))
  }

  const handleModeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      mode: value as "1 to 1" | "normal",
    }))
  }

  const handleAddSubject = () => {
    if (newSubject && !formData.subjects.includes(newSubject)) {
      setFormData((prev) => ({
        ...prev,
        subjects: [...prev.subjects, newSubject],
      }))
      setNewSubject("")
    }
  }

  const handleRemoveSubject = (subject: string) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s !== subject),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("S")) {
      return "bg-green-100 text-green-800 border-green-300"
    } else if (grade.startsWith("F")) {
      return "bg-blue-100 text-blue-800 border-blue-300"
    } else if (grade === "CP") {
      return "bg-purple-100 text-purple-800 border-purple-300"
    }
    return "bg-gray-100 text-gray-800 border-gray-300"
  }

  const getModeColor = (mode: string) => {
    return mode === "1 to 1"
      ? "bg-orange-100 text-orange-800 border-orange-300"
      : "bg-gray-100 text-gray-800 border-gray-300"
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[95vw] p-4 rounded-lg sm:w-auto sm:max-w-[600px] sm:p-6 border-secondary/20 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="bg-gradient-to-r from-secondary/20 to-primary/20 -mx-4 -mt-4 px-4 py-3 rounded-t-lg">
          <DialogTitle className="text-navy">{student.id ? "Edit Student" : "Add New Student"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Student ID field */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="studentId" className="text-navy sm:text-right">
                Student ID
              </Label>
              <Input
                id="studentId"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                className="sm:col-span-3 border-secondary/20 font-mono"
                placeholder="e.g., SBF4038"
                required
              />
            </div>

            {/* Name field */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="name" className="text-navy sm:text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="sm:col-span-3 border-secondary/20"
                required
              />
            </div>

            {/* Parent's Name field */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="parentName" className="text-navy sm:text-right">
                Parent's Name
              </Label>
              <Input
                id="parentName"
                name="parentName"
                value={formData.parentName}
                onChange={handleChange}
                className="sm:col-span-3 border-secondary/20"
                required
              />
            </div>

            {/* Student Phone field */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="studentPhone" className="text-navy sm:text-right">
                Student Phone
              </Label>
              <Input
                id="studentPhone"
                name="studentPhone"
                value={formData.studentPhone}
                onChange={handleChange}
                className="sm:col-span-3 border-secondary/20"
                required
              />
            </div>

            {/* Parent Phone field */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="parentPhone" className="text-navy sm:text-right">
                Parent Phone
              </Label>
              <Input
                id="parentPhone"
                name="parentPhone"
                value={formData.parentPhone}
                onChange={handleChange}
                className="sm:col-span-3 border-secondary/20"
                required
              />
            </div>

            {/* Email field */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="email" className="text-navy sm:text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="sm:col-span-3 border-secondary/20"
                required
              />
            </div>

            {/* School field */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="school" className="text-navy sm:text-right">
                School
              </Label>
              <Input
                id="school"
                name="school"
                value={formData.school}
                onChange={handleChange}
                className="sm:col-span-3 border-secondary/20"
                required
              />
            </div>

            {/* Grade field */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="grade" className="text-navy sm:text-right">
                Grade
              </Label>
              <div className="sm:col-span-3 space-y-2">
                <Select value={formData.grade} onValueChange={(value) => handleSelectChange("grade", value)}>
                  <SelectTrigger className="border-secondary/20">
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADE_OPTIONS.map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.grade && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Selected:</span>
                    <Badge className={getGradeColor(formData.grade)}>{formData.grade}</Badge>
                  </div>
                )}
              </div>
            </div>

            {/* ClassIn ID field */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="classInId" className="text-navy sm:text-right">
                ClassIn ID
              </Label>
              <Input
                id="classInId"
                name="classInId"
                value={formData.classInId || ""}
                onChange={handleChange}
                className="sm:col-span-3 border-secondary/20 font-mono"
                placeholder="e.g., student@classin.com (optional)"
              />
            </div>

            {/* Registered Date field */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="registeredDate" className="text-navy sm:text-right">
                Registered Date
              </Label>
              <Input
                id="registeredDate"
                name="registeredDate"
                type="date"
                value={formData.registeredDate}
                onChange={handleChange}
                className="sm:col-span-3 border-secondary/20"
                required
              />
            </div>

            {/* Mode field */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="mode" className="text-navy sm:text-right">
                Mode
              </Label>
              <div className="sm:col-span-3 space-y-2">
                <Select value={formData.mode} onValueChange={handleModeChange}>
                  <SelectTrigger className="border-secondary/20">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="1 to 1">1 to 1</SelectItem>
                  </SelectContent>
                </Select>
                {formData.mode && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Selected:</span>
                    <Badge className={getModeColor(formData.mode)}>{formData.mode}</Badge>
                  </div>
                )}
              </div>
            </div>

            {/* DLP field */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="dlp" className="text-navy sm:text-right">
                Dual Language Program
              </Label>
              <div className="sm:col-span-3 space-y-2">
                <Select value={formData.dlp} onValueChange={(value) => handleSelectChange("dlp", value)}>
                  <SelectTrigger className="border-secondary/20">
                    <SelectValue placeholder="Select DLP status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DLP">DLP</SelectItem>
                    <SelectItem value="non-DLP">non-DLP</SelectItem>
                  </SelectContent>
                </Select>
                {formData.dlp && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Selected:</span>
                    <Badge
                      className={
                        formData.dlp === "DLP"
                          ? "bg-purple-100 text-purple-800 border-purple-300"
                          : "bg-gray-100 text-gray-800 border-gray-300"
                      }
                    >
                      {formData.dlp}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Status field */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="status" className="text-navy sm:text-right">
                Status
              </Label>
              <Select value={formData.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="sm:col-span-3 border-secondary/20">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Subjects field */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-2 sm:gap-4">
              <Label className="text-navy sm:text-right sm:pt-2">Subjects</Label>
              <div className="sm:col-span-3 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {formData.subjects.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No subjects selected</p>
                  ) : (
                    formData.subjects.map((subject) => (
                      <Badge
                        key={subject}
                        variant="secondary"
                        className="flex items-center gap-1 py-1.5 bg-primary/10 text-primary border-primary/30"
                      >
                        {subject}
                        <button
                          type="button"
                          onClick={() => handleRemoveSubject(subject)}
                          className="ml-1 rounded-full p-1 hover:bg-primary/20"
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove {subject}</span>
                        </button>
                      </Badge>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  <Select value={newSubject} onValueChange={setNewSubject}>
                    <SelectTrigger className="flex-1 border-secondary/20">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_SUBJECTS.filter((subject) => !formData.subjects.includes(subject)).map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleAddSubject}
                    disabled={!newSubject}
                    className="h-10 w-10 border-secondary/20 bg-transparent"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">Add subject</span>
                  </Button>
                </div>
              </div>
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
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
