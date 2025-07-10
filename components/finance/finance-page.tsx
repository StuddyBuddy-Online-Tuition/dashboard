"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Search, Settings2, DollarSign, CreditCard, Calendar, Edit, ChevronLeft, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import FinanceModal from "@/components/finance/finance-modal"
import type { Student } from "@/types/student"
import { students as mockStudentsData } from "@/data/students"

interface ColumnVisibility {
  studentId: boolean
  name: boolean
  parentName: boolean
  studentPhone: boolean
  parentPhone: boolean
  email: boolean
  school: boolean
  grade: boolean
  subjects: boolean
  status: boolean
  classInId: boolean
  registeredDate: boolean
  mode: boolean
  dlp: boolean
  nextRecurringPaymentDate: boolean
  recurringPayment: boolean
  lastPaymentMadeDate: boolean
  paidStatus: boolean
}

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20, 50]

export default function FinancePage() {
  /* ------------------------------ state ------------------------------ */
  const [searchQuery, setSearchQuery] = useState("")
  const [students, setStudents] = useState<Student[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    studentId: true,
    name: true,
    parentName: false,
    studentPhone: false,
    parentPhone: false,
    email: false,
    school: false,
    grade: true,
    subjects: false,
    status: false,
    classInId: false,
    registeredDate: false,
    mode: true,
    dlp: true,
    nextRecurringPaymentDate: true,
    recurringPayment: true,
    lastPaymentMadeDate: true,
    paidStatus: true,
  })

  /* ---------------------------- lifecycle ---------------------------- */
  useEffect(() => {
    setStudents(mockStudentsData.filter((s) => s.status === "active"))
  }, [])

  // Reset to page 1 when search query or items per page changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, itemsPerPage])

  /* ----------------------------- helpers ----------------------------- */
  const filteredStudents = useMemo(
    () =>
      students.filter(
        (s) =>
          searchQuery === "" ||
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.studentId.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [students, searchQuery],
  )

  // Pagination calculations
  const totalItems = filteredStudents.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex)

  const getPaidStatus = (last: string) => {
    const today = new Date()
    const paid = new Date(last)
    return today.getMonth() === paid.getMonth() && today.getFullYear() === paid.getFullYear() ? "Paid" : "No"
  }

  const getPaidColor = (st: string) =>
    st === "Paid" ? "bg-green-100 text-green-800 border-green-300" : "bg-red-100 text-red-800 border-red-300"

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
    new Date(ds).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })

  /* ----------------------- column visibility UX ---------------------- */
  const toggleCol = (k: keyof ColumnVisibility, v: boolean) => setColumnVisibility((prev) => ({ ...prev, [k]: v }))

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

  /* ----------------------------- modal UX ---------------------------- */
  const openModal = (s: Student) => {
    setSelectedStudent(s)
    setIsModalOpen(true)
  }
  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedStudent(null)
  }
  const saveStudent = (st: Student) => {
    setStudents((prev) => prev.map((p) => (p.id === st.id ? st : p)))
    closeModal()
  }

  /* ------------------ summary statistics (unchanged) ----------------- */
  const total = filteredStudents.length
  const paid = filteredStudents.filter((s) => getPaidStatus(s.lastPaymentMadeDate) === "Paid").length
  const unpaid = total - paid
  const recurring = filteredStudents.filter((s) => s.recurringPayment).length

  /* ------------------------------ render ----------------------------- */
  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <DollarSign className="h-8 w-8 text-green-600" />
          <div>
            <h1 className="text-2xl font-bold text-navy">Finance & Payment</h1>
            <p className="text-sm text-muted-foreground">Manage student payments</p>
          </div>
        </div>
        <span className="text-sm text-muted-foreground">
          Total: {total} | Showing: {startIndex + 1}-{Math.min(endIndex, total)}
        </span>
      </div>

      {/* summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard title="Paid This Month" value={paid} icon={CreditCard} color="green" />
        <SummaryCard title="Unpaid" value={unpaid} icon={CreditCard} color="red" />
        <SummaryCard title="Recurring" value={recurring} icon={Calendar} color="blue" />
        <SummaryCard
          title="Payment Rate"
          value={`${total ? Math.round((paid / total) * 100) : 0}%`}
          icon={DollarSign}
          color="purple"
        />
      </div>

      {/* search + picker */}
      <Card className="border-secondary/20 shadow-md">
        <CardContent className="pt-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-secondary/20 focus-visible:ring-2 focus-visible:ring-primary/40"
              />
            </div>

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

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="border-secondary/20 bg-transparent">
                  <Settings2 className="mr-2 h-4 w-4" /> Columns
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 max-h-80 overflow-y-auto" align="end">
                {(Object.keys(columnVisibility) as (keyof ColumnVisibility)[]).map((col) => (
                  <div key={col} className="flex items-center space-x-2 py-1">
                    <Checkbox
                      id={col}
                      checked={columnVisibility[col]}
                      onCheckedChange={(v) => toggleCol(col, v as boolean)}
                    />
                    <label htmlFor={col} className="text-sm capitalize cursor-pointer">
                      {col === "studentId"
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
                                  : col === "nextRecurringPaymentDate"
                                    ? "Next Payment"
                                    : col === "lastPaymentMadeDate"
                                      ? "Last Payment"
                                      : col === "paidStatus"
                                        ? "Paid Status"
                                        : col.toUpperCase() === "DLP"
                                          ? "DLP"
                                          : col.replace(/([A-Z])/g, " $1").trim()}
                    </label>
                  </div>
                ))}
              </PopoverContent>
            </Popover>
          </div>

          {/* ---------- mobile cards ---------- */}
          <div className="block lg:hidden space-y-3">
            {paginatedStudents.length === 0 ? (
              <p className="py-10 text-center text-muted-foreground">No active students.</p>
            ) : (
              paginatedStudents.map((s) => {
                const paidStatus = getPaidStatus(s.lastPaymentMadeDate)
                return (
                  <div key={s.id} className="rounded-lg border border-secondary/20 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-medium text-navy">{s.name}</h3>
                        <p className="text-xs text-muted-foreground">ID: {s.studentId}</p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {columnVisibility.grade && <Badge className={getGradeColor(s.grade)}>{s.grade}</Badge>}
                        {columnVisibility.mode && <Badge className={getModeColor(s.mode)}>{s.mode}</Badge>}
                        {columnVisibility.dlp && <Badge className={getDlpColor(s.dlp)}>{s.dlp}</Badge>}
                        {columnVisibility.status && <Badge className={getStatusColor(s.status)}>{s.status}</Badge>}
                        {columnVisibility.paidStatus && (
                          <Badge className={getPaidColor(paidStatus)}>{paidStatus}</Badge>
                        )}
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
                      {columnVisibility.nextRecurringPaymentDate && (
                        <p>Next Payment: {formatDate(s.nextRecurringPaymentDate)}</p>
                      )}
                      {columnVisibility.lastPaymentMadeDate && <p>Last Payment: {formatDate(s.lastPaymentMadeDate)}</p>}
                      {columnVisibility.recurringPayment && <p>Recurring: {s.recurringPayment ? "Yes" : "No"}</p>}
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
                        <Edit className="h-4 w-4 mr-1" /> Edit Payment
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* desktop table */}
          <div className="hidden lg:block overflow-x-auto rounded-md border border-secondary/20">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-secondary/10 to-primary/10">
                <tr className="border-b border-secondary/20">
                  {columnVisibility.studentId && <TH>Student&nbsp;ID</TH>}
                  {columnVisibility.name && <TH>Name</TH>}
                  {columnVisibility.parentName && <TH>Parent&nbsp;Name</TH>}
                  {columnVisibility.studentPhone && <TH>Student&nbsp;Phone</TH>}
                  {columnVisibility.parentPhone && <TH>Parent&nbsp;Phone</TH>}
                  {columnVisibility.email && <TH>Email</TH>}
                  {columnVisibility.school && <TH>School</TH>}
                  {columnVisibility.grade && <TH>Grade</TH>}
                  {columnVisibility.subjects && <TH>Subjects</TH>}
                  {columnVisibility.status && <TH>Status</TH>}
                  {columnVisibility.classInId && <TH>ClassIn&nbsp;ID</TH>}
                  {columnVisibility.registeredDate && <TH>Registered</TH>}
                  {columnVisibility.mode && <TH>Mode</TH>}
                  {columnVisibility.dlp && <TH>DLP</TH>}
                  {columnVisibility.nextRecurringPaymentDate && <TH>Next&nbsp;Payment</TH>}
                  {columnVisibility.recurringPayment && <TH>Recurring</TH>}
                  {columnVisibility.lastPaymentMadeDate && <TH>Last&nbsp;Payment</TH>}
                  {columnVisibility.paidStatus && <TH>Paid?</TH>}
                  <TH className="text-right">Actions</TH>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={Object.values(columnVisibility).filter(Boolean).length + 1}
                      className="h-24 text-center"
                    >
                      No active students.
                    </td>
                  </tr>
                ) : (
                  paginatedStudents.map((s) => {
                    const paidStatus = getPaidStatus(s.lastPaymentMadeDate)
                    return (
                      <tr key={s.id} className="border-b border-secondary/10 bg-white hover:bg-secondary/5">
                        {columnVisibility.studentId && <TD className="font-mono">{s.studentId}</TD>}
                        {columnVisibility.name && <TD>{s.name}</TD>}
                        {columnVisibility.parentName && <TD>{s.parentName}</TD>}
                        {columnVisibility.studentPhone && <TD>{s.studentPhone}</TD>}
                        {columnVisibility.parentPhone && <TD>{s.parentPhone}</TD>}
                        {columnVisibility.email && <TD>{s.email}</TD>}
                        {columnVisibility.school && <TD>{s.school}</TD>}
                        {columnVisibility.grade && (
                          <TD>
                            <Badge className={getGradeColor(s.grade)}>{s.grade}</Badge>
                          </TD>
                        )}
                        {columnVisibility.subjects && (
                          <TD>
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
                          </TD>
                        )}
                        {columnVisibility.status && (
                          <TD>
                            <Badge className={getStatusColor(s.status)}>{s.status}</Badge>
                          </TD>
                        )}
                        {columnVisibility.classInId && <TD className="text-xs font-mono">{s.classInId || "-"}</TD>}
                        {columnVisibility.registeredDate && <TD>{formatDate(s.registeredDate)}</TD>}
                        {columnVisibility.mode && (
                          <TD>
                            <Badge className={getModeColor(s.mode)}>{s.mode}</Badge>
                          </TD>
                        )}
                        {columnVisibility.dlp && (
                          <TD>
                            <Badge className={getDlpColor(s.dlp)}>{s.dlp}</Badge>
                          </TD>
                        )}
                        {columnVisibility.nextRecurringPaymentDate && <TD>{formatDate(s.nextRecurringPaymentDate)}</TD>}
                        {columnVisibility.recurringPayment && (
                          <TD>
                            <Badge
                              className={
                                s.recurringPayment
                                  ? "bg-blue-100 text-blue-800 border-blue-300"
                                  : "bg-gray-100 text-gray-800 border-gray-300"
                              }
                            >
                              {s.recurringPayment ? "Yes" : "No"}
                            </Badge>
                          </TD>
                        )}
                        {columnVisibility.lastPaymentMadeDate && <TD>{formatDate(s.lastPaymentMadeDate)}</TD>}
                        {columnVisibility.paidStatus && (
                          <TD>
                            <Badge className={getPaidColor(paidStatus)}>{paidStatus}</Badge>
                          </TD>
                        )}
                        <TD className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openModal(s)}
                            className="text-navy hover:bg-secondary/10"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TD>
                      </tr>
                    )
                  })
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
        <FinanceModal student={selectedStudent} onClose={closeModal} onSave={saveStudent} />
      )}
    </div>
  )
}

/* ----------------------- small helper components ---------------------- */
function TH({ children, className = "" }: React.ComponentProps<"th">) {
  return <th className={`py-3 px-4 text-left font-medium text-navy ${className}`}>{children}</th>
}
function TD({ children, className = "" }: React.ComponentProps<"td">) {
  return <td className={`py-3 px-4 ${className}`}>{children}</td>
}
interface SummaryCardProps {
  title: string
  value: number | string
  icon: React.ComponentType<{ className?: string }>
  color: "green" | "red" | "blue" | "purple"
}
function SummaryCard({ title, value, icon: Icon, color }: SummaryCardProps) {
  const colorClasses = {
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
  }[color]
  return (
    <Card className="border-secondary/20">
      <CardContent className="p-4 flex items-center gap-2">
        <div className={`p-2 rounded-lg ${colorClasses}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold" style={{ color: `var(--${color}-600)` }}>
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
