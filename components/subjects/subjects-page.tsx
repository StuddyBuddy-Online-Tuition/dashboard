"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, BookOpen, Plus, Edit, Trash2, Check, CalendarDays } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Subject } from "@/types/subject"
import SubjectModal from "@/components/subjects/subject-modal"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

// Import subjects data
import { subjects as initialSubjectsData } from "@/data/subjects"
import { STANDARD_OPTIONS } from "@/data/subject-constants"

export default function SubjectsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjectsData)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [standardFilter, setStandardFilter] = useState<string[]>([])
  const router = useRouter()

  const filteredSubjects = useMemo(() => {
    return subjects.filter(
      (subject) =>
        (standardFilter.length === 0 || standardFilter.includes(subject.standard)) &&
        (searchQuery === "" ||
          subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          subject.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          subject.standard.toLowerCase().includes(searchQuery.toLowerCase()) ||
          subject.teacherName.toLowerCase().includes(searchQuery.toLowerCase())),
    )
  }, [searchQuery, subjects, standardFilter])

  // Group subjects by name for better organization
  const groupedSubjects = useMemo(() => {
    const groups: Record<string, Subject[]> = {}
    filteredSubjects.forEach((subject) => {
      if (!groups[subject.name]) {
        groups[subject.name] = []
      }
      groups[subject.name].push(subject)
    })
    return groups
  }, [filteredSubjects])

  const handleRowClick = (subjectCode: string) => {
    router.push(`/dashboard/subjects/${subjectCode}`)
  }

  const handleOpenModal = (e: React.MouseEvent, subject?: Subject) => {
    e.stopPropagation()
    if (subject) {
      setSelectedSubject(subject)
    } else {
      setSelectedSubject({
        code: "",
        name: "",
        standard: "",
        timeSlots: [{ day: "Monday", startTime: "09:00", endTime: "10:00" }],
        teacherName: "",
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedSubject(null)
  }

  const handleSaveSubject = (updatedSubject: Subject, originalCode?: string) => {
    setSubjects((prevSubjects) => {
      if (originalCode && originalCode !== updatedSubject.code) {
        // If code changed, remove old and add new
        return prevSubjects
          .filter((s) => s.code !== originalCode)
          .concat(updatedSubject)
          .sort((a, b) => a.code.localeCompare(b.code))
      } else {
        const index = prevSubjects.findIndex((s) => s.code === updatedSubject.code)
        if (index !== -1) {
          // Update existing subject
          const newSubjects = [...prevSubjects]
          newSubjects[index] = updatedSubject
          return newSubjects
        } else {
          // Add new subject
          return [...prevSubjects, updatedSubject].sort((a, b) => a.code.localeCompare(b.code))
        }
      }
    })
    handleCloseModal()
  }

  const handleDeleteSubject = (e: React.MouseEvent, subjectCode: string) => {
    e.stopPropagation()
    if (window.confirm("Are you sure you want to delete this subject?")) {
      setSubjects((prevSubjects) => prevSubjects.filter((s) => s.code !== subjectCode))
    }
  }

  const getStandardColor = (standard: string) => {
    if (standard.startsWith("S")) {
      return "bg-green-100 text-green-800 border-green-300"
    } else if (standard.startsWith("F")) {
      return "bg-blue-100 text-blue-800 border-blue-300"
    }
    return "bg-gray-100 text-gray-800 border-gray-300"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-navy">Subjects</h1>
            <p className="text-sm text-muted-foreground">Manage all available subjects and their standards</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">Total: {filteredSubjects.length} subjects</div>
          <Button
            onClick={() => router.push("/dashboard/subjects/master")}
            variant="outline"
            className="w-full sm:w-auto"
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            Master Timetable
          </Button>
          <Button
            onClick={(e) => handleOpenModal(e)}
            className="w-full bg-accent text-navy hover:bg-accent/90 sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Subject
          </Button>
        </div>
      </div>

      <Card className="border-secondary/20 shadow-md">
        <CardContent className="pt-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search subjects by name, code, or standard..."
                className="pl-10 border-secondary/20 focus-visible:ring-offset-2 focus-visible:ring-primary/40 focus-visible:ring-2 focus-visible:border-primary/40"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto justify-start border-secondary/20 text-left font-normal">
                  <span className="mr-2">Standard</span>
                  {standardFilter.length > 0 && (
                    <Badge variant="secondary" className="rounded-sm px-1 font-mono">
                      {standardFilter.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0" align="start">
                <div className="p-1">
                  {STANDARD_OPTIONS.map((s) => {
                    const isSelected = standardFilter.includes(s)
                    return (
                      <Button
                        key={s}
                        variant="ghost"
                        className="w-full justify-start font-normal"
                        onClick={() => {
                          setStandardFilter((prev) =>
                            isSelected ? prev.filter((item) => item !== s) : [...prev, s],
                          )
                        }}
                      >
                        <div
                          className={cn(
                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                            isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible",
                          )}
                        >
                          <Check className="h-4 w-4" />
                        </div>
                        <span>{s}</span>
                      </Button>
                    )
                  })}
                </div>
                {standardFilter.length > 0 && (
                  <>
                    <hr className="my-1" />
                    <div className="p-1">
                      <Button
                        variant="ghost"
                        className="w-full justify-start font-normal text-destructive"
                        onClick={() => setStandardFilter([])}
                      >
                        Clear filters
                      </Button>
                    </div>
                  </>
                )}
              </PopoverContent>
            </Popover>
          </div>

          {/* Mobile Card View - hidden on desktop */}
          <div className="block lg:hidden space-y-4">
            {Object.keys(groupedSubjects).length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">No subjects found.</p>
            ) : (
              Object.entries(groupedSubjects).map(([subjectName, subjectList]) => (
                <div key={subjectName} className="rounded-lg border border-secondary/20 bg-white p-4 shadow-sm">
                  <h3 className="font-semibold text-navy mb-3 text-lg">{subjectName}</h3>
                  <div className="space-y-2">
                    {subjectList.map((subject) => (
                      <div key={subject.code} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{subject.code}</p>
                          <Badge className={`text-xs mt-1 ${getStandardColor(subject.standard)}`}>
                            {subject.standard}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleOpenModal(e, subject)}
                            className="h-8 w-8 p-0 text-navy hover:bg-secondary/10"
                          >
                            <Edit className="h-3 w-3" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDeleteSubject(e, subject.code)}
                            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View - hidden on mobile */}
          <div className="hidden lg:block rounded-md border border-secondary/20 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-secondary/10 to-primary/10">
                <tr className="border-b border-secondary/20">
                  <th className="py-3 px-4 text-left font-medium text-navy">Subject Code</th>
                  <th className="py-3 px-4 text-left font-medium text-navy">Subject Name</th>
                  <th className="py-3 px-4 text-left font-medium text-navy">Standard/Form</th>
                  <th className="py-3 px-4 text-left font-medium text-navy">Teacher Name</th>
                  <th className="py-3 px-4 text-right font-medium text-navy">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubjects.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="h-24 text-center">
                      No subjects found.
                    </td>
                  </tr>
                ) : (
                  filteredSubjects.map((subject) => (
                    <tr
                      key={subject.code}
                      className="border-b border-secondary/10 bg-white hover:bg-secondary/5 cursor-pointer"
                      onClick={() => handleRowClick(subject.code)}
                    >
                      <td className="py-3 px-4 font-mono text-sm font-medium text-navy">{subject.code}</td>
                      <td className="py-3 px-4 font-medium">{subject.name}</td>
                      <td className="py-3 px-4">
                        <Badge className={`${getStandardColor(subject.standard)}`}>{subject.standard}</Badge>
                      </td>
                      <td className="py-3 px-4">{subject.teacherName}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleOpenModal(e, subject)}
                            className="text-navy hover:bg-secondary/10"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDeleteSubject(e, subject.code)}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {isModalOpen && selectedSubject && (
        <SubjectModal
          subject={selectedSubject}
          onClose={handleCloseModal}
          onSave={handleSaveSubject}
        />
      )}
    </div>
  )
}
