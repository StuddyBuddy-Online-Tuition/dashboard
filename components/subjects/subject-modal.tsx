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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect, useCallback } from "react"
import type { Subject } from "@/types/subject"
import { STANDARD_OPTIONS } from "@/lib/subject-constants"
import { cleanSubjectName } from "@/lib/utils"

interface SubjectModalProps {
  subject: Subject | null
  onClose: () => void
  onSave: (subject: Subject, originalCode?: string) => void
}

const SubjectModal: React.FC<SubjectModalProps> = ({ subject, onClose, onSave }) => {
  const [formData, setFormData] = useState<Subject | null>(() => 
    subject ? JSON.parse(JSON.stringify(subject)) : null
  )
  const [originalCode, setOriginalCode] = useState<string | undefined>(() => 
    subject?.code
  )
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (subject) {
      setFormData(JSON.parse(JSON.stringify(subject)))
      setOriginalCode(subject.code)
      setSaveError(null)
      setIsSaving(false)
    }
  }, [subject])

  const handleInputChange = useCallback(
    (field: keyof Subject, value: string) => {
      setFormData((prev) => {
        if (!prev) return null
        // Prevent editing code when modifying an existing subject (code is immutable)
        if (field === "code" && originalCode) return prev
        return { ...prev, [field]: value }
      })
    },
    [originalCode],
  )

  const handleSave = async () => {
    if (!formData) return

    const code = formData.code.trim()
    const name = formData.name.trim()
    const standard = formData.standard.trim()
    const type = formData.type.trim()
    const subjectValue = cleanSubjectName((formData.subject ?? "").trim() || name)

    if (!code || !name || !standard || !type || !subjectValue) {
      setSaveError("Please complete all fields before saving.")
      return
    }

    setSaveError(null)
    setIsSaving(true)

    try {
      const isUpdate = Boolean(originalCode)
      const endpoint = isUpdate ? `/api/subjects/${encodeURIComponent(originalCode ?? "")}` : `/api/subjects`
      const method = isUpdate ? "PUT" : "POST"
      const payload = { code, name, standard, type, subject: subjectValue }

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const text = await response.text()
        let message = "Failed to save subject"
        if (text) {
          try {
            const parsed = JSON.parse(text) as { error?: string }
            if (parsed?.error) {
              message = parsed.error
            } else {
              message = text
            }
          } catch {
            message = text
          }
        }
        throw new Error(message)
      }

      const savedSubject = (await response.json()) as Subject
      onSave(savedSubject, originalCode)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save subject"
      setSaveError(message)
    } finally {
      setIsSaving(false)
    }
  }

  if (!formData) return null

  return (
    <Dialog open={!!subject} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle>{originalCode ? "Edit Subject" : "Add New Subject"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="code" className="text-right">
              Code
            </Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => handleInputChange("code", e.target.value)}
              className="col-span-3"
              disabled={Boolean(originalCode)}
              readOnly={Boolean(originalCode)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="standard" className="text-right">
              Std/Form
            </Label>
            <Select onValueChange={(value) => handleInputChange("standard", value)} value={formData.standard}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a standard" />
              </SelectTrigger>
              <SelectContent>
                {STANDARD_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <Select onValueChange={(value) => handleInputChange("type", value)} value={formData.type}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Classroom">Classroom</SelectItem>
                <SelectItem value="1 to 1">1 to 1</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          {saveError && <p className="w-full text-sm text-destructive text-right">{saveError}</p>}
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default SubjectModal
