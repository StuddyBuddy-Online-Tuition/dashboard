"use client"

import { useState, useMemo, useEffect } from "react"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import PaginationControls from "@/components/common/pagination"

// Import subjects data
import { STANDARD_OPTIONS } from "@/lib/subject-constants"

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20, 50]

type Props = { initialSubjects?: Subject[] }

export default function SubjectsPage({ initialSubjects }: Props) {
  const [searchQuery, setSearchQuery] = useState("")
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects ?? [])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [standardFilter, setStandardFilter] = useState<string[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteSubjectTarget, setDeleteSubjectTarget] = useState<Subject | null>(null)
  const [deleteMeta, setDeleteMeta] = useState<{ loading: boolean; error: string | null; enrolledCount: number }>({
    loading: false,
    error: null,
    enrolledCount: 0,
  })
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const filteredSubjects = useMemo(() => {
    return subjects.filter(
      (subject) =>
        (standardFilter.length === 0 || standardFilter.includes(subject.standard)) &&
        (searchQuery === "" ||
          subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          subject.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          subject.standard.toLowerCase().includes(searchQuery.toLowerCase())),
    )
  }, [searchQuery, subjects, standardFilter])

  // Pagination calculations
  const totalItems = filteredSubjects.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems)

  const paginatedSubjects = useMemo(() => {
    return filteredSubjects.slice(startIndex, endIndex)
  }, [filteredSubjects, startIndex, endIndex])

  // Group subjects by name for better organization (uses paginated subjects)
  const groupedSubjects = useMemo(() => {
    const groups: Record<string, Subject[]> = {}
    paginatedSubjects.forEach((subject) => {
      if (!groups[subject.name]) {
        groups[subject.name] = []
      }
      groups[subject.name].push(subject)
    })
    return groups
  }, [paginatedSubjects])

  // Reset to page 1 when filters or search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, standardFilter])

  // Reset to page 1 when items per page changes
  useEffect(() => {
    setCurrentPage(1)
  }, [itemsPerPage])

  /* -------------------------- pagination handlers -------------------------- */
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value))
  }

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
        type: "Classroom",
        subject: "",
      } as Subject)
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedSubject(null)
  }

  const handleSaveSubject = (updatedSubject: Subject, originalCode?: string) => {
    const normalizedSubject: Subject = {
      ...updatedSubject,
      standard: updatedSubject.standard.toUpperCase(),
    }

    setSubjects((prevSubjects) => {
      let nextSubjects = prevSubjects

      if (originalCode && originalCode !== normalizedSubject.code) {
        nextSubjects = nextSubjects.filter((s) => s.code !== originalCode)
      }

      const existingIndex = nextSubjects.findIndex((s) => s.code === normalizedSubject.code)

      if (existingIndex !== -1) {
        const copy = [...nextSubjects]
        copy[existingIndex] = normalizedSubject
        nextSubjects = copy
      } else {
        nextSubjects = [...nextSubjects, normalizedSubject]
      }

      return nextSubjects.sort((a, b) => a.code.localeCompare(b.code))
    })
    handleCloseModal()
  }

  const resetDeleteDialog = () => {
    setDeleteMeta({ loading: false, error: null, enrolledCount: 0 })
    setDeleteSubjectTarget(null)
    setIsDeleting(false)
  }

  const loadDeleteMeta = async (code: string) => {
    setDeleteMeta({ loading: true, error: null, enrolledCount: 0 })
    try {
      const res = await fetch(`/api/subjects/${encodeURIComponent(code)}`)
      if (!res.ok) {
        const text = await res.text()
        let message = "Failed to fetch subject details"
        if (text) {
          try {
            const parsed = JSON.parse(text) as { error?: string }
            if (parsed?.error) message = parsed.error
          } catch {
            message = text
          }
        }
        throw new Error(message)
      }
      const data = (await res.json()) as { enrolledStudents?: unknown[] }
      const count = Array.isArray(data?.enrolledStudents) ? data.enrolledStudents.length : 0
      setDeleteMeta({ loading: false, error: null, enrolledCount: count })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch subject details"
      setDeleteMeta({ loading: false, error: message, enrolledCount: 0 })
    }
  }

  const handleDeleteSubject = (e: React.MouseEvent, subject: Subject) => {
    e.stopPropagation()
    setDeleteSubjectTarget(subject)
    setDeleteDialogOpen(true)
    void loadDeleteMeta(subject.code)
  }

  const handleConfirmDelete = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    if (!deleteSubjectTarget || deleteMeta.loading || deleteMeta.enrolledCount > 0 || deleteMeta.error) {
      return
    }

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/subjects/${encodeURIComponent(deleteSubjectTarget.code)}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const text = await res.text()
        let message = "Failed to delete subject"
        let enrolledCount: number | undefined
        if (text) {
          try {
            const parsed = JSON.parse(text) as { error?: string; enrolledCount?: number }
            if (parsed?.error) message = parsed.error
            if (typeof parsed?.enrolledCount === "number") {
              enrolledCount = parsed.enrolledCount
            }
          } catch {
            message = text
          }
        }

        if (res.status === 409 && typeof enrolledCount === "number") {
          setDeleteMeta({ loading: false, error: null, enrolledCount })
          setIsDeleting(false)
          return
        }

        setDeleteMeta((prev) => ({ ...prev, error: message }))
        setIsDeleting(false)
        return
      }

      setSubjects((prevSubjects) => prevSubjects.filter((s) => s.code !== deleteSubjectTarget.code))
      setDeleteDialogOpen(false)
      resetDeleteDialog()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete subject"
      setDeleteMeta((prev) => ({ ...prev, error: message }))
    } finally {
      setIsDeleting(false)
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
          <span className="text-sm text-muted-foreground">
            Total: {totalItems} | Showing: {totalItems > 0 ? startIndex + 1 : 0}-{endIndex}
          </span>
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
                            onClick={(e) => handleDeleteSubject(e, subject)}
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
                        
                  <th className="py-3 px-4 text-right font-medium text-navy">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSubjects.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="h-24 text-center">
                      No subjects found.
                    </td>
                  </tr>
                ) : (
                  paginatedSubjects.map((subject) => (
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
                            onClick={(e) => handleDeleteSubject(e, subject)}
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          )}
        </CardContent>
      </Card>

      {isModalOpen && selectedSubject && (
        <SubjectModal
          subject={selectedSubject}
          onClose={handleCloseModal}
          onSave={handleSaveSubject}
        />
      )}
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open)
          if (!open) {
            resetDeleteDialog()
          }
        }}
      >
        <AlertDialogContent className="sm:max-w-[420px] border-secondary/20 bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-navy">Delete subject?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently remove the subject from the catalogue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteSubjectTarget && (
            <div className="rounded-md border border-secondary/30 bg-secondary/10 p-4 space-y-3">
              <div>
                <p className="text-sm font-semibold text-navy">{deleteSubjectTarget.name}</p>
                <p className="text-xs font-mono text-muted-foreground">{deleteSubjectTarget.code}</p>
              </div>
              <Badge className="w-fit border-primary/30 bg-primary/10 text-primary">
                {deleteSubjectTarget.standard}
              </Badge>
              <div className="rounded-md border border-secondary/20 bg-white/80 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Enrolled students</span>
                  <Badge className="border-secondary/30 bg-secondary/20 text-navy">
                    {deleteMeta.loading ? "..." : deleteMeta.enrolledCount}
                  </Badge>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {deleteMeta.error ? (
                    <span className="text-destructive">{deleteMeta.error}</span>
                  ) : deleteMeta.loading ? (
                    <span>Checking enrolled students...</span>
                  ) : deleteMeta.enrolledCount > 0 ? (
                    <span>
                      Please unenrol the {deleteMeta.enrolledCount} student
                      {deleteMeta.enrolledCount === 1 ? "" : "s"} before deleting this subject.
                    </span>
                  ) : (
                    <span>No students are enrolled in this subject. You can safely delete it.</span>
                  )}
                </div>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel className="border-secondary/20">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:pointer-events-none disabled:opacity-60"
              disabled={deleteMeta.loading || !!deleteMeta.error || deleteMeta.enrolledCount > 0 || isDeleting}
              onClick={handleConfirmDelete}
            >
              {isDeleting ? "Deleting..." : "Yes, delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
