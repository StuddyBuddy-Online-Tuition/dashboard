"use client"

import type React from "react"

import { useMemo, useRef, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import type { Student, StudentMode } from "@/types/student"
import { subjects as allSubjects } from "@/data/subjects"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"

interface StudentModalProps {
  student: Student
  onClose: () => void
  onSave: (student: Student) => void
}

const GRADE_OPTIONS = ["S1", "S2", "S3", "S4", "S5", "F1", "F2", "F3", "F4", "F5", "CP"]

export default function StudentModal({ student, onClose, onSave }: StudentModalProps) {
  const [formData, setFormData] = useState<Student>(student)
  const [newSubject, setNewSubject] = useState("")
  const [subjectPopoverOpen, setSubjectPopoverOpen] = useState(false)
  const [subjectSearch, setSubjectSearch] = useState("")
  const [confirmOpen, setConfirmOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const getRelevanceScore = (code: string, name: string, standard: string, query: string) => {
    const q = query.toLowerCase()
    const c = code.toLowerCase()
    const n = name.toLowerCase()
    const s = standard.toLowerCase()
    if (!q) return 0
    let score = 0
    if (c === q) score += 1000
    else if (c.startsWith(q)) score += 800
    else if (c.includes(q)) score += 600
    if (n === q) score += 500
    else if (n.startsWith(q)) score += 400
    else if (n.includes(q)) score += 200
    if (s === q) score += 100
    return score
  }

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

  const toggleMode = (mode: StudentMode) => {
    setFormData((prev) => {
      const exists = prev.modes.includes(mode)
      const modes = exists ? prev.modes.filter((m) => m !== mode) : [...prev.modes, mode]
      return { ...prev, modes }
    })
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
    if (formRef.current) {
      if (formRef.current.checkValidity()) {
        setConfirmOpen(true)
      } else {
        formRef.current.reportValidity()
      }
    }
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
    return (
      {
        "NORMAL": "bg-gray-100 text-gray-800 border-gray-300",
        "1 TO 1": "bg-orange-100 text-orange-800 border-orange-300",
        "OTHERS": "bg-slate-100 text-slate-800 border-slate-300",
      } as Record<string, string>
    )[mode] || "bg-gray-100 text-gray-800 border-gray-300"
  }

  const pickerSubjects = useMemo(() => {
    const candidates = allSubjects.filter((s) => !formData.subjects.includes(s.code))
    const query = subjectSearch.trim()
    if (query.length === 0) {
      if (!formData.grade) return candidates
      return candidates.filter((s) => s.standard === formData.grade)
    }
    return candidates
      .map((s) => ({ s, score: getRelevanceScore(s.code, s.name, s.standard, query) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.s)
  }, [formData.subjects, formData.grade, subjectSearch])

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[95vw] p-4 rounded-lg sm:w-auto sm:max-w-[600px] sm:p-6 border-secondary/20 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="bg-gradient-to-r from-secondary/20 to-primary/20 -mx-4 -mt-4 px-4 py-3 rounded-t-lg">
          <DialogTitle className="text-navy">{student.id ? "Edit Student" : "Add New Student"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} ref={formRef}>
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

            {/* Modes field */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label className="text-navy sm:text-right">Modes</Label>
              <div className="sm:col-span-3 space-y-2">
                <div className="flex flex-wrap gap-4">
                  {(["NORMAL", "1 TO 1", "OTHERS"] as StudentMode[]).map((m) => (
                    <label key={m} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={formData.modes.includes(m)}
                        onCheckedChange={() => toggleMode(m)}
                      />
                      <span>{m}</span>
                    </label>
                  ))}
                </div>
                {formData.modes.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Selected:</span>
                    <div className="flex flex-wrap gap-1">
                      {formData.modes.map((m) => (
                        <Badge key={m} className={getModeColor(m)}>{m}</Badge>
                      ))}
                    </div>
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
                  <Popover open={subjectPopoverOpen} onOpenChange={setSubjectPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 justify-between border-secondary/20"
                      >
                        {newSubject ? newSubject : "Search subject by code or name..."}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-72" align="start">
                      <Command>
                        <CommandInput
                          placeholder="Search by code or name..."
                          value={subjectSearch}
                          onValueChange={setSubjectSearch}
                        />
                        <CommandEmpty>No subject found.</CommandEmpty>
                        <CommandGroup>
                          {pickerSubjects.map((s) => (
                              <CommandItem
                                key={s.code}
                                value={`${s.code} ${s.name}`}
                                onSelect={() => {
                                  setNewSubject(s.code)
                                  setSubjectPopoverOpen(false)
                                  setSubjectSearch("")
                                }}
                              >
                                {s.code} - {s.name}
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
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
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm save changes</AlertDialogTitle>
              <AlertDialogDescription>
                This will update the student's details. Are you sure you want to continue?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button
                onClick={() => {
                  setConfirmOpen(false)
                  onSave(formData)
                }}
              >
                Confirm
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  )
}
