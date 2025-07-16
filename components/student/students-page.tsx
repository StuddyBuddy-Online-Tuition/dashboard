"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Search,
  Plus,
  Eye,
  Users,
  ClipboardList,
  Clock,
  UserX,
  Settings2,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import StudentModal from "@/components/student/student-modal"
import type { Student } from "@/types/student"
import { STATUSES } from "@/types/student"
import { students as mockStudentsData } from "@/data/students"
import { cn } from "@/lib/utils"

type Status = Student["status"]

interface StudentsPageProps {
  status?: Status
  showStatusFilter?: boolean
}

interface ColumnVisibility {
  studentId: boolean
  name: boolean
  parentName: boolean
  studentPhone: boolean // Changed from 'phone' to 'studentPhone'
  parentPhone: boolean // Added parent phone
  email: boolean
  school: boolean
  grade: boolean
  subjects: boolean
  status: boolean
  classInId: boolean
  registeredDate: boolean
  mode: boolean
  dlp: boolean
}

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20, 50]

export default function StudentsPage({ status, showStatusFilter = false }: StudentsPageProps) {
  /* ------------------------------ state ------------------------------ */
  const [searchQuery, setSearchQuery] = useState("")
  const [students, setStudents] = useState<Student[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [statusFilter, setStatusFilter] = useState<Status[]>(status ? [status] : [...STATUSES])

  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    studentId: true,
    name: true,
    parentName: false,
    studentPhone: false, // Changed from 'phone' to 'studentPhone'
    parentPhone: false, // Added parent phone
    email: false,
    school: false,
    grade: true,
    subjects: true,
    status: true,
    classInId: false,
    registeredDate: false,
    mode: true,
    dlp: true,
  })

  /* ---------------------------- lifecycle ---------------------------- */
  useEffect(() => {
    setStudents(mockStudentsData)
  }, [])

  // Reset to page 1 when search query or items per page changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, itemsPerPage, statusFilter])

  /* ----------------------------- helpers ----------------------------- */
  const filteredStudents = useMemo(
    () =>
      students.filter(
        (s) =>
          (statusFilter.length === 0 || statusFilter.includes(s.status)) &&
          (searchQuery === "" ||
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.studentId.toLowerCase().includes(searchQuery.toLowerCase())),
      ),
    [students, statusFilter, searchQuery],
  )

  // Pagination calculations
  const totalItems = filteredStudents.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex)

  const getStatusColor = (st: string) =>
    ({
      active: "bg-secondary/20 text-secondary-foreground border-secondary/30",
      pending: "bg-accent/20 text-accent-foreground border-accent/30",
      trial: "bg-blue-100 text-blue-800 border-blue-300",
      inactive: "bg-destructive/20 text-destructive-foreground border-destructive/30",
    })[st] || "bg-muted text-muted-foreground"

  const getGradeColor = (g: string) =>
    g.startsWith("S")
      ? "bg-green-100 text-green-800 border-green-300"
      : g.startsWith("F")
        ? "bg-blue-100 text-blue-800 border-blue-300"
        : g === "CP"
          ? "bg-purple-100 text-purple-800 border-purple-300"
          : "bg-gray-100 text-gray-800 border-gray-300"

  const getModeColor = (m: string) =>
    m === "1 to 1" ? "bg-orange-100 text-orange-800 border-orange-300" : "bg-gray-100 text-gray-800 border-gray-300"

  const getDlpColor = (d: string) =>
    d === "DLP" ? "bg-purple-100 text-purple-800 border-purple-300" : "bg-gray-100 text-gray-800 border-gray-300"

  const formatDate = (ds: string) =>
    new Date(ds).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })

  /* ----------------------- column visibility UX ---------------------- */
  const handleColumnVisibilityChange = (key: keyof ColumnVisibility, v: boolean) =>
    setColumnVisibility((prev) => ({ ...prev, [key]: v }))

  /* -------------------------- pagination UX -------------------------- */
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value))
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      const startPage = Math.max(1, currentPage - 2)
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
    }

    return pages
  }

  /* ---------------------------- modal UX ----------------------------- */
  const openModal = (student?: Student) => {
    if (student) {
      setSelectedStudent(student)
    } else {
      // create skeleton for new student
      setSelectedStudent({
        id: Date.now().toString(),
        studentId: "NEW",
        name: "",
        parentName: "",
        studentPhone: "", // Changed from 'phone' to 'studentPhone'
        parentPhone: "", // Added parent phone
        email: "",
        school: "",
        grade: "",
        subjects: [],
        status: status || "pending",
        classInId: null,
        registeredDate: new Date().toISOString().split("T")[0],
        mode: "normal",
        dlp: "non-DLP",
        nextRecurringPaymentDate: "",
        recurringPayment: false,
        lastPaymentMadeDate: "",
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedStudent(null)
  }

  const saveStudent = (st: Student) => {
    setStudents((prev) => {
      const idx = prev.findIndex((s) => s.id === st.id)
      if (idx !== -1) {
        const copy = [...prev]
        copy[idx] = st
        return copy
      }
      return [...prev, st]
    })
    closeModal()
  }

  /* ------------------------------ render ----------------------------- */

  /* ----- page icon / title per-status ----- */
  const pageMeta = {
    all: { icon: Users, color: "text-primary", title: "All Students", desc: "Browse all students" },
    active: { icon: Users, color: "text-secondary", title: "Active Students", desc: "Currently enrolled students" },
    pending: {
      icon: ClipboardList,
      color: "text-accent",
      title: "Pending Students",
      desc: "Awaiting enrollment confirmation",
    },
    inactive: { icon: UserX, color: "text-destructive", title: "Inactive Students", desc: "Past students" },
    trial: { icon: Clock, color: "text-blue-600", title: "Trial Students", desc: "Trial-period learners" },
  }[status || "all"]

  const VisibleColumns = Object.entries(columnVisibility)
    .filter(([, v]) => v)
    .map(([k]) => k)

  return (
    <div className="space-y-6">
      {/* ---------- header ---------- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <pageMeta.icon className={`h-8 w-8 ${pageMeta.color}`} />
          <div>
            <h1 className="text-2xl font-bold text-navy">{pageMeta.title}</h1>
            <p className="text-sm text-muted-foreground">{pageMeta.desc}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Total: {totalItems} | Showing: {startIndex + 1}-{Math.min(endIndex, totalItems)}
          </span>
          <Button onClick={() => openModal()} className="w-full sm:w-auto bg-accent text-navy hover:bg-accent/90">
            <Plus className="mr-2 h-4 w-4" /> Add Student
          </Button>
        </div>
      </div>

      {/* ---------- search + controls ---------- */}
      <Card className="border-secondary/20 shadow-md">
        <CardContent className="pt-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-secondary/20 focus-visible:ring-2 focus-visible:ring-primary/40"
              />
            </div>

            {showStatusFilter && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-auto justify-start border-secondary/20 text-left font-normal">
                    <span className="mr-2">Status</span>
                    {statusFilter.length > 0 && (
                      <Badge variant="secondary" className="rounded-sm px-1 font-mono">
                        {statusFilter.length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0" align="start">
                  <div className="p-1">
                    {STATUSES.map((s) => {
                      const isSelected = statusFilter.includes(s)
                      return (
                        <Button
                          key={s}
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => {
                            if (isSelected) {
                              setStatusFilter(statusFilter.filter((fs) => fs !== s))
                            } else {
                              setStatusFilter([...statusFilter, s])
                            }
                          }}
                        >
                          <div
                            className={cn(
                              "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "opacity-50 [&_svg]:invisible",
                            )}
                          >
                            <Check className={cn("h-4 w-4")} />
                          </div>
                          <span>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
                        </Button>
                      )
                    })}
                  </div>
                </PopoverContent>
              </Popover>
            )}

            {/* Items per page selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Show:</span>
              <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                <SelectTrigger className="w-20 border-secondary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option.toString()}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Column visibility toggle */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-auto justify-start border-secondary/20 text-left font-normal">
                  <Settings2 className="mr-2 h-4 w-4" />
                  <span className="mr-2">Columns</span>
                  <Badge variant="secondary" className="rounded-sm px-1 font-mono">
                    {Object.values(columnVisibility).filter(Boolean).length}
                  </Badge>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-60 p-0" align="end">
                <div className="p-1">
                  {(Object.keys(columnVisibility) as (keyof ColumnVisibility)[]).map((col) => {
                    const isSelected = columnVisibility[col]
                    const colName =
                      col === "studentId"
                        ? "Student ID"
                        : col === "parentName"
                        ? "Parent Name"
                        : col === "studentPhone"
                        ? "Student Phone"
                        : col === "parentPhone"
                        ? "Parent Phone"
                        : col === "classInId"
                        ? "ClassIn ID"
                        : col === "registeredDate"
                        ? "Registered Date"
                        : col.toUpperCase() === "DLP"
                        ? "DLP"
                        : col.replace(/([A-Z])/g, " $1").trim()
                    return (
                      <Button
                        key={col}
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => handleColumnVisibilityChange(col, !isSelected)}
                      >
                        <div
                          className={cn(
                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                            isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible",
                          )}
                        >
                          <Check className={cn("h-4 w-4")} />
                        </div>
                        <span>{colName}</span>
                      </Button>
                    )
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* ---------- mobile cards ---------- */}
          <div className="block lg:hidden space-y-3">
            {paginatedStudents.length === 0 ? (
              <p className="py-10 text-center text-muted-foreground">No students found.</p>
            ) : (
              paginatedStudents.map((s) => (
                <div key={s.id} className="rounded-lg border border-secondary/20 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-navy">{s.name}</h3>
                      <p className="text-xs text-muted-foreground">ID: {s.studentId}</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Badge className={getGradeColor(s.grade)}>{s.grade}</Badge>
                      <Badge className={getModeColor(s.mode)}>{s.mode}</Badge>
                      <Badge className={getDlpColor(s.dlp)}>{s.dlp}</Badge>
                      <Badge className={getStatusColor(s.status)}>{s.status}</Badge>
                    </div>
                  </div>

                  {/* optional fields */}
                  <div className="space-y-1 text-sm">
                    {columnVisibility.parentName && <p>Parent: {s.parentName}</p>}
                    {columnVisibility.studentPhone && <p>Student Phone: {s.studentPhone}</p>}
                    {columnVisibility.parentPhone && <p>Parent Phone: {s.parentPhone}</p>}
                    {columnVisibility.email && <p>Email: {s.email}</p>}
                    {columnVisibility.school && <p>School: {s.school}</p>}
                    {columnVisibility.classInId && s.classInId && <p>ClassIn: {s.classInId}</p>}
                    {columnVisibility.registeredDate && <p>Registered: {formatDate(s.registeredDate)}</p>}
                    {columnVisibility.subjects && (
                      <>
                        <p className="mt-2 text-xs text-muted-foreground">Subjects:</p>
                        <div className="flex flex-wrap gap-1">
                          {s.subjects.map((sub) => (
                            <span
                              key={sub}
                              className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs text-primary"
                            >
                              {sub}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="mt-3 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openModal(s)}
                      className="border-secondary/20 text-navy hover:bg-secondary/10"
                    >
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ---------- desktop table ---------- */}
          <div className="hidden lg:block overflow-x-auto rounded-md border border-secondary/20">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-secondary/10 to-primary/10">
                <tr className="border-b border-secondary/20">
                  {columnVisibility.studentId && (
                    <th className="py-3 px-4 text-left font-medium text-navy">Student&nbsp;ID</th>
                  )}
                  {columnVisibility.name && <th className="py-3 px-4 text-left font-medium text-navy">Name</th>}
                  {columnVisibility.parentName && (
                    <th className="py-3 px-4 text-left font-medium text-navy">Parent&nbsp;Name</th>
                  )}
                  {columnVisibility.studentPhone && (
                    <th className="py-3 px-4 text-left font-medium text-navy">Student&nbsp;Phone</th>
                  )}
                  {columnVisibility.parentPhone && (
                    <th className="py-3 px-4 text-left font-medium text-navy">Parent&nbsp;Phone</th>
                  )}
                  {columnVisibility.email && <th className="py-3 px-4 text-left font-medium text-navy">Email</th>}
                  {columnVisibility.school && <th className="py-3 px-4 text-left font-medium text-navy">School</th>}
                  {columnVisibility.grade && <th className="py-3 px-4 text-left font-medium text-navy">Grade</th>}
                  {columnVisibility.dlp && <th className="py-3 px-4 text-left font-medium text-navy">DLP</th>}
                  {columnVisibility.subjects && <th className="py-3 px-4 text-left font-medium text-navy">Subjects</th>}
                  {columnVisibility.status && <th className="py-3 px-4 text-left font-medium text-navy">Status</th>}
                  {columnVisibility.classInId && (
                    <th className="py-3 px-4 text-left font-medium text-navy">ClassIn&nbsp;ID</th>
                  )}
                  {columnVisibility.registeredDate && (
                    <th className="py-3 px-4 text-left font-medium text-navy">Registered</th>
                  )}
                  {columnVisibility.mode && <th className="py-3 px-4 text-left font-medium text-navy">Mode</th>}
                  <th className="py-3 px-4 text-right font-medium text-navy">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={VisibleColumns.length + 1} className="h-24 text-center">
                      No students found.
                    </td>
                  </tr>
                ) : (
                  paginatedStudents.map((s) => (
                    <tr key={s.id} className="border-b border-secondary/10 bg-white hover:bg-secondary/5">
                      {columnVisibility.studentId && <td className="py-3 px-4 font-mono text-sm">{s.studentId}</td>}
                      {columnVisibility.name && <td className="py-3 px-4 font-medium">{s.name}</td>}
                      {columnVisibility.parentName && <td className="py-3 px-4">{s.parentName}</td>}
                      {columnVisibility.studentPhone && <td className="py-3 px-4">{s.studentPhone}</td>}
                      {columnVisibility.parentPhone && <td className="py-3 px-4">{s.parentPhone}</td>}
                      {columnVisibility.email && <td className="py-3 px-4">{s.email}</td>}
                      {columnVisibility.school && <td className="py-3 px-4">{s.school}</td>}
                      {columnVisibility.grade && (
                        <td className="py-3 px-4">
                          <Badge className={getGradeColor(s.grade)}>{s.grade}</Badge>
                        </td>
                      )}
                      {columnVisibility.dlp && (
                        <td className="py-3 px-4">
                          <Badge className={getDlpColor(s.dlp)}>{s.dlp}</Badge>
                        </td>
                      )}
                      {columnVisibility.subjects && (
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {s.subjects.map((sub) => (
                              <span
                                key={sub}
                                className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs text-primary"
                              >
                                {sub}
                              </span>
                            ))}
                          </div>
                        </td>
                      )}
                      {columnVisibility.status && (
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(s.status)}>{s.status}</Badge>
                        </td>
                      )}
                      {columnVisibility.classInId && (
                        <td className="py-3 px-4 text-xs font-mono">{s.classInId || "-"}</td>
                      )}
                      {columnVisibility.registeredDate && <td className="py-3 px-4">{formatDate(s.registeredDate)}</td>}
                      {columnVisibility.mode && (
                        <td className="py-3 px-4">
                          <Badge className={getModeColor(s.mode)}>{s.mode}</Badge>
                        </td>
                      )}
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openModal(s)}
                          className="text-navy hover:bg-secondary/10"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ---------- pagination ---------- */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} students
              </div>

              <div className="flex items-center gap-2">
                {/* Previous button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="border-secondary/20"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {getPageNumbers().map((pageNum) => (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className={
                        currentPage === pageNum
                          ? "bg-primary text-primary-foreground"
                          : "border-secondary/20 hover:bg-secondary/10"
                      }
                    >
                      {pageNum}
                    </Button>
                  ))}
                </div>

                {/* Next button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="border-secondary/20"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {isModalOpen && selectedStudent && (
        <StudentModal student={selectedStudent} onClose={closeModal} onSave={saveStudent} />
      )}
    </div>
  )
}
