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
import { STANDARD_OPTIONS } from "@/data/subject-constants"

interface SubjectModalProps {
  subject: Subject | null
  onClose: () => void
  onSave: (subject: Subject, originalCode?: string) => void
}

const SubjectModal: React.FC<SubjectModalProps> = ({ subject, onClose, onSave }) => {
  const [formData, setFormData] = useState<Subject | null>(null)
  const [originalCode, setOriginalCode] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (subject) {
      setFormData(JSON.parse(JSON.stringify(subject)))
      setOriginalCode(subject.code)
    }
  }, [subject])

  const handleInputChange = useCallback((field: keyof Subject, value: string) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null))
  }, [])

  const handleSave = () => {
    if (formData) {
      onSave(formData, originalCode)
      onClose()
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
          
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default SubjectModal
