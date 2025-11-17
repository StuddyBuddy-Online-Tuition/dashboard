"use client"

import { useState, useEffect, useMemo } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  Search,
  Plus,
  Users,
  ClipboardList,
  Clock,
  UserX,
  Check,
  Edit,
  Calendar,
  X,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RemoveStudentConfirm } from "@/components/student/RemoveStudentConfirm"
import StudentModal from "@/components/student/student-modal"
import type { Student } from "@/types/student"
import type { Subject } from "@/types/subject"
import { STATUSES } from "@/types/student"
import { cn, formatDate, getDlpColor, getGradeColor, toWhatsAppHref } from "@/lib/utils"
import PaginationControls from "@/components/common/pagination"
import StudentTimetableModal from "@/components/timetable/student-timetable-modal"
import type { Timeslot } from "@/types/timeslot"
import type { StudentMode } from "@/types/student"

type Status = Student["status"]

interface StudentsPageProps {
  status?: Status
  showStatusFilter?: boolean
  initialStudents?: Student[]
  totalItems?: number
  subjects?: Subject[]
}

interface ColumnVisibility {
  studentId: boolean
  ticketId: boolean
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
  icNumber: boolean
  recurringPayment: boolean
  recurringPaymentDate: boolean
}

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20, 50]
const MODE_OPTIONS: Readonly<StudentMode[]> = ["NORMAL", "1 TO 1", "BOARD", "OTHERS", "BREAK"]

export default function StudentsPage({ status, showStatusFilter = false, initialStudents, totalItems: totalItemsFromServer, subjects }: StudentsPageProps) {
  /* ------------------------------ state ------------------------------ */
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [students, setStudents] = useState<Student[]>(initialStudents ?? [])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const initialPageFromUrl = Math.max(parseInt(searchParams?.get("page") ?? "1", 10) || 1, 1)
  const initialPageSizeFromUrl = Math.max(parseInt(searchParams?.get("pageSize") ?? "10", 10) || 10, 1)
  const [currentPage, setCurrentPage] = useState(initialPageFromUrl)
  const [itemsPerPage, setItemsPerPage] = useState(initialPageSizeFromUrl)
  const [statusFilter, setStatusFilter] = useState<Status[]>(status ? [status] : [...STATUSES])
  const [isTimetableModalOpen, setIsTimetableModalOpen] = useState(false)
  const [gradeFilter, setGradeFilter] = useState<string>("")
  const [oneToOneSlots, setOneToOneSlots] = useState<Timeslot[]>([])
  const [normalSlots, setNormalSlots] = useState<Timeslot[]>([])

  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    studentId: true,
    ticketId: status === "pending" || status === "trial",
    name: true,
    parentName: false,
    studentPhone: true, // Changed from 'phone' to 'studentPhone'
    parentPhone: false, // Added parent phone
    email: true,
    school: true,
    grade: true,
    subjects: true,
    status: true,
    classInId: true,
    registeredDate: true,
    mode: true,
    dlp: true,
    icNumber: false,
    recurringPayment: false,
    recurringPaymentDate: false,
  })
  const [detailView, setDetailView] = useState<"student" | "parent" | "payment">("student")
  type SortField = "grade" | "dlp" | "status" | "registeredDate"
  type SortOrder = "asc" | "desc"
  type SortRule = { field: SortField; order: SortOrder }
  const [sortRules, setSortRules] = useState<SortRule[]>([])
  const [modesFilter, setModesFilter] = useState<StudentMode[]>([...MODE_OPTIONS])

  /* ---------------------------- lifecycle ---------------------------- */
  useEffect(() => {
    if (initialStudents) setStudents(initialStudents)
  }, [initialStudents])

  // Reset to page 1 when items per page or sorting changes
  useEffect(() => {
    setCurrentPage(1)
  }, [itemsPerPage, sortRules])

  // Reset to page 1 when status view changes (e.g., all -> inactive)
  useEffect(() => {
    setCurrentPage(1)
  }, [status])

  // Reset to page 1 when keyword changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  // Sync state from URL if it changes (e.g., back/forward nav or server nav)
  useEffect(() => {
    const p = Math.max(parseInt(searchParams?.get("page") ?? "1", 10) || 1, 1)
    const ps = Math.max(parseInt(searchParams?.get("pageSize") ?? "10", 10) || 10, 1)
    if (p !== currentPage) setCurrentPage(p)
    if (ps !== itemsPerPage) setItemsPerPage(ps)
    const kw = searchParams?.get("keyword") ?? ""
    if (kw !== searchQuery) setSearchQuery(kw)
  }, [searchParams])

  // When on All Students (showStatusFilter), mirror status from URL into local state
  useEffect(() => {
    if (!showStatusFilter) return
    const raw = searchParams?.get("status")?.trim().toLowerCase() ?? null
    let next: Status[]
    if (!raw || raw === "all") {
      next = [...STATUSES]
    } else {
      const parsed = raw
        .split(",")
        .map((s) => s.trim())
        .filter((s): s is Status => (STATUSES as readonly string[]).includes(s)) as Status[]
      next = parsed.length > 0 ? parsed : [...STATUSES]
    }
    const normalized = (STATUSES as readonly string[]).filter((s) => next.includes(s as Status)) as Status[]
    const equal = normalized.length === statusFilter.length && normalized.every((s, i) => s === statusFilter[i])
    if (!equal) setStatusFilter(normalized)
  }, [searchParams, showStatusFilter])

  // Mirror sort rules from URL → local state
  useEffect(() => {
    const raw = searchParams?.get("sort") ?? ""
    const parsed = raw
      .split(",")
      .map((pair) => pair.trim())
      .filter(Boolean)
      .map((pair) => {
        const [field, order] = pair.split(":").map((s) => s.trim())
        const validField = ["grade", "dlp", "status", "registeredDate"].includes(field)
        const validOrder = order === "asc" || order === "desc"
        return validField && validOrder ? ({ field: field as SortField, order: order as SortOrder } as SortRule) : undefined
      })
      .filter(Boolean) as SortRule[]

    const toKey = (rules: SortRule[]) => rules.map((r) => `${r.field}:${r.order}`).join(",")
    if (toKey(parsed) !== toKey(sortRules)) {
      setSortRules(parsed)
    }
  }, [searchParams])

  // Reset to page 1 when status filter changes (All Students page)
  useEffect(() => {
    if (showStatusFilter) setCurrentPage(1)
  }, [showStatusFilter, statusFilter])

  // Sync pagination, status and sort to URL search params
  useEffect(() => {
    const sp = new URLSearchParams(searchParams?.toString() ?? "")
    sp.set("page", String(currentPage))
    sp.set("pageSize", String(itemsPerPage))
    const kw = (searchQuery ?? "").trim()
    if (kw) {
      sp.set("keyword", kw)
    } else {
      sp.delete("keyword")
    }
    if (sortRules.length > 0) {
      sp.set("sort", sortRules.map((r) => `${r.field}:${r.order}`).join(","))
    } else {
      sp.delete("sort")
    }
    if (showStatusFilter) {
      const allSelected = statusFilter.length === STATUSES.length
      if (allSelected) {
        sp.delete("status")
      } else {
        sp.set("status", statusFilter.join(","))
      }
    } else if (status) {
      sp.set("status", status)
    } else {
      sp.delete("status")
    }
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false })
  }, [currentPage, itemsPerPage, pathname, router, searchParams, status, showStatusFilter, statusFilter, sortRules, searchQuery])

  /* ----------------------------- helpers ----------------------------- */
  const sortedStudents = useMemo(() => students, [students])

  // Pagination calculations
  const totalItems = totalItemsFromServer ?? students.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedStudents = sortedStudents // server provides the correct slice; don't slice again client-side

  const getStatusColor = (st: string) => //this function is here to solve a bug, dont move to utils like the rest
    ({
      active: "bg-secondary/20 text-black border-secondary/30",
      pending: "bg-accent/20 text-black border-accent/30",
      trial: "bg-blue-100 text-black border-blue-300",
      inactive: "bg-destructive/20 text-black border-destructive/30",
      break: "bg-yellow-100 text-black border-yellow-300",
      removed: "bg-gray-200 text-black border-gray-300",
    })[st] || "bg-muted text-black"

  const getModeColor = (m: string) =>
    (
      {
        NORMAL: "bg-gray-100 text-gray-800 border-gray-300",
        "1 TO 1": "bg-orange-100 text-orange-800 border-orange-300",
        BOARD: "bg-indigo-100 text-indigo-800 border-indigo-300",
        BREAK: "bg-yellow-100 text-yellow-800 border-yellow-300",
        break: "bg-yellow-100 text-yellow-800 border-yellow-300",
        OTHERS: "bg-slate-100 text-slate-800 border-slate-300",
      } as Record<string, string>
    )[m] || "bg-gray-100 text-gray-800 border-gray-300"

    /* ----------------------- column visibility UX ---------------------- */
  const applyColumnsPreset = (view: "student" | "parent" | "payment") => {
    if (view === "student") {
      setColumnVisibility({
        studentId: true,
        ticketId: status === "pending" || status === "trial",
        name: true,
        parentName: false,
        studentPhone: true,
        parentPhone: false,
        email: false,
        school: true,
        grade: true,
        subjects: true,
        status: true,
        classInId: true,
        registeredDate: true,
        mode: true,
        dlp: true,
        icNumber: false,
        recurringPayment: false,
        recurringPaymentDate: false,
      })
    } else if (view === "parent") {
      setColumnVisibility({
        studentId: true,
        ticketId: false,
        name: true,
        parentName: true,
        studentPhone: false,
        parentPhone: true,
        email: true,
        school: false,
        grade: false,
        subjects: false,
        status: true,
        classInId: false,
        registeredDate: false,
        mode: false,
        dlp: false,
        icNumber: false,
        recurringPayment: false,
        recurringPaymentDate: false,
      })
    } else if (view === "payment") {
      setColumnVisibility({
        studentId: true,
        ticketId: false,
        name: true,
        parentName: true,
        studentPhone: false,
        parentPhone: true,
        email: false,
        school: false,
        grade: false,
        subjects: false,
        status: true,
        classInId: false,
        registeredDate: false,
        mode: false,
        dlp: false,
        icNumber: true,
        recurringPayment: true,
        recurringPaymentDate: true,
      })
    }
  }

  const handleDetailViewChange = (value: string) => {
    const view = value === "parent" ? "parent" : value === "payment" ? "payment" : "student"
    setDetailView(view)
    applyColumnsPreset(view)
  }

  /* -------------------------- pagination UX -------------------------- */
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value))
  }

  /* ---------------------------- modal UX ----------------------------- */
  const openModal = (student?: Student) => {
    if (student) {
      setSelectedStudent(student)
    } else {
      // create skeleton for new student
      setSelectedStudent({
        id: "",
        studentId: "NEW",
        name: "",
        fullName: null,
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
        modes: ["NORMAL"],
        dlp: "non-DLP",
        ticketId: null,
        icnumber: null,
        recurringpayment: null,
        recurringpaymentdate: null,
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

  const handleViewTimetable = async (student: Student) => {
    setSelectedStudent(student)
    const hasOneToOne = Array.isArray(student.modes) && student.modes.includes("1 TO 1")
    const hasNormal = Array.isArray(student.modes) && student.modes.includes("NORMAL")
    const hasBoth = hasOneToOne && hasNormal
    
    setOneToOneSlots([])
    setNormalSlots([])
    setIsTimetableModalOpen(true)

    if (hasBoth) {
      // Fetch both types in parallel when student has both modes
      try {
        const codes = Array.isArray(student.subjects) ? student.subjects : []
        console.log("[StudentsPage] Fetching both slot types for student", { id: student.id, name: student.name, subjectCodes: codes })
        
        const [oneToOneRes, ...subjectResponses] = await Promise.all([
          fetch(`/api/timeslots/students/${student.id}`),
          ...(codes.length > 0 ? codes.map((code) => fetch(`/api/subjects/${encodeURIComponent(code)}/timeslots`)) : [])
        ])

        // Handle 1-to-1 slots
        if (oneToOneRes.ok) {
          const data = (await oneToOneRes.json()) as Timeslot[]
          console.log("[StudentsPage] Received 1-to-1 slots:", data)
          setOneToOneSlots(data)
        } else {
          console.log("[StudentsPage] Failed to fetch 1-to-1 slots:", { status: oneToOneRes.status, url: oneToOneRes.url })
        }

        // Handle normal slots
        if (codes.length > 0) {
          console.log(
            "[StudentsPage] Timeslot responses:",
            subjectResponses.map((r) => ({ url: r.url, ok: r.ok, status: r.status }))
          )
          const jsons = await Promise.all(
            subjectResponses.map(async (r) => (r.ok ? ((await r.json()) as { timeslots: Timeslot[] }) : { timeslots: [] }))
          )
          const merged = jsons.flatMap((j) => j.timeslots || [])
          const filtered = merged.filter((t) => t.studentId === null && t.studentName === null)
          console.log(
            "[StudentsPage] Aggregated timeslots count:", merged.length,
            "Filtered normal slots count:", filtered.length,
            { merged, filtered }
          )
          setNormalSlots(filtered)
        }
      } catch {
        // ignore fetch errors; modal remains open with empty state
        console.log("[StudentsPage] Error while fetching slots (ignored)")
      }
    } else if (hasOneToOne) {
      // Only 1-to-1 mode
      try {
        console.log("[StudentsPage] Fetching 1-to-1 slots for student", { id: student.id, name: student.name })
        const res = await fetch(`/api/timeslots/students/${student.id}`)
        if (res.ok) {
          const data = (await res.json()) as Timeslot[]
          console.log("[StudentsPage] Received 1-to-1 slots:", data)
          setOneToOneSlots(data)
        } else {
          console.log("[StudentsPage] Failed to fetch 1-to-1 slots:", { status: res.status, url: res.url })
        }
      } catch {
        // ignore fetch errors; modal remains open with empty state
        console.log("[StudentsPage] Error while fetching 1-to-1 slots (ignored)")
      }
    } else {
      // Only normal mode
      try {
        const codes = Array.isArray(student.subjects) ? student.subjects : []
        console.log("[StudentsPage] Fetching normal slots for student", { id: student.id, name: student.name, subjectCodes: codes })
        if (codes.length === 0) return
        const responses = await Promise.all(
          codes.map((code) => fetch(`/api/subjects/${encodeURIComponent(code)}/timeslots`))
        )
        console.log(
          "[StudentsPage] Timeslot responses:",
          responses.map((r) => ({ url: r.url, ok: r.ok, status: r.status }))
        )
        const jsons = await Promise.all(
          responses.map(async (r) => (r.ok ? ((await r.json()) as { timeslots: Timeslot[] }) : { timeslots: [] }))
        )
        const merged = jsons.flatMap((j) => j.timeslots || [])
        const filtered = merged.filter((t) => t.studentId === null && t.studentName === null)
        console.log(
          "[StudentsPage] Aggregated timeslots count:", merged.length,
          "Filtered normal slots count:", filtered.length,
          { merged, filtered }
        )
        setNormalSlots(filtered)
      } catch {
        // ignore fetch errors; modal remains open with empty state
        console.log("[StudentsPage] Error while fetching normal slots (ignored)")
      }
    }
  }

  const handleRemoveStudent = async (student: Student) => {
    try {
      const payload: Student = { ...student, status: "removed" }
      const res = await fetch(`/api/students/${student.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(await res.text())
      const updated: Student = await res.json()
      setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
    } catch (_e) {
      setStudents((prev) => prev.map((s) => (s.id === student.id ? { ...s, status: "removed" } : s)))
    }
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
    removed: { icon: UserX, color: "text-destructive", title: "Removed Students", desc: "Soft-deleted students" },
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

            {/* Modes filter - client-side filter removed; keeping UI disabled */}
            {/* If needed later, re-enable and wire to server */}

        {/* Grade filter - client-side filter removed */}

            {/* Detail view dropdown */}
            <Select value={detailView} onValueChange={handleDetailViewChange}>
              <SelectTrigger className="w-[180px] border-secondary/20 text-left font-normal">
                <SelectValue placeholder="View" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student details</SelectItem>
                <SelectItem value="parent">Parent details</SelectItem>
                <SelectItem value="payment">Payment details</SelectItem>
              </SelectContent>
            </Select>

            {/* Sorting controls (multi-criteria, persist across views) */}
            <div className="flex flex-col gap-2">
              {sortRules.length === 0 && (
                <span className="text-sm text-muted-foreground">No sorting applied</span>
              )}
              {sortRules.map((rule, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Select
                    value={rule.field}
                    onValueChange={(v) =>
                      setSortRules((prev) => prev.map((r, i) => (i === idx ? { ...r, field: v as SortField } : r)))
                    }
                  >
                    <SelectTrigger className="w-[180px] border-secondary/20 text-left font-normal">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grade">Grade</SelectItem>
                      <SelectItem value="dlp">DLP</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="registeredDate">Registered Date</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={rule.order}
                    onValueChange={(v) =>
                      setSortRules((prev) => prev.map((r, i) => (i === idx ? { ...r, order: v as SortOrder } : r)))
                    }
                  >
                    <SelectTrigger className="w-[140px] border-secondary/20 text-left font-normal">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="icon"
                    className="border-secondary/20"
                    onClick={() => setSortRules((prev) => prev.filter((_, i) => i !== idx))}
                    aria-label="Remove sort rule"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="border-secondary/20"
                  onClick={() => setSortRules((prev) => [...prev, { field: "registeredDate", order: "asc" }])}
                >
                  Add sort
                </Button>
                <Button
                  variant="outline"
                  className="border-secondary/20"
                  onClick={() => setSortRules([])}
                >
                  Reset Sort
                </Button>
              </div>
            </div>
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
                      {s.modes.map((m) => (
                        <Badge key={m} className={getModeColor(m)}>{m}</Badge>
                      ))}
                      <Badge className={getDlpColor(s.dlp)}>{s.dlp}</Badge>
                      <Badge className={getStatusColor(s.status)}>{s.status.toUpperCase()}</Badge>
                    </div>
                  </div>

                  {/* optional fields */}
                  <div className="space-y-1 text-sm">
                    {columnVisibility.parentName && <p>Parent: {s.parentName}</p>}
                    {columnVisibility.studentPhone && (
                      <p>
                        Student Phone: {toWhatsAppHref(s.studentPhone) ? (
                          <a
                            href={toWhatsAppHref(s.studentPhone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline"
                          >
                            {s.studentPhone}
                          </a>
                        ) : (
                          s.studentPhone || "-"
                        )}
                      </p>
                    )}
                    {columnVisibility.parentPhone && (
                      <p>
                        Parent Phone: {toWhatsAppHref(s.parentPhone) ? (
                          <a
                            href={toWhatsAppHref(s.parentPhone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline"
                          >
                            {s.parentPhone}
                          </a>
                        ) : (
                          s.parentPhone || "-"
                        )}
                      </p>
                    )}
                    {columnVisibility.email && <p>Email: {s.email}</p>}
                    {columnVisibility.ticketId && (s.status === "pending" || s.status === "trial") && (
                      <p>Ticket ID: {s.ticketId || "-"}</p>
                    )}
                    {columnVisibility.school && <p>School: {s.school}</p>}
                    {columnVisibility.classInId && s.classInId && <p>ClassIn: {s.classInId}</p>}
                    {columnVisibility.registeredDate && <p>Registered: {formatDate(s.registeredDate)}</p>}
                    {columnVisibility.icNumber && <p>IC Number: {s.icnumber || "-"}</p>}
                    {columnVisibility.recurringPayment && (
                      <p className="flex items-center gap-1">
                        Recurring: {
                          s.recurringpayment === null ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            <Badge
                              className={
                                s.recurringpayment
                                  ? "bg-green-100 text-green-800 border-green-300"
                                  : "bg-gray-100 text-gray-800 border-gray-300"
                              }
                            >
                              {s.recurringpayment ? "Yes" : "No"}
                            </Badge>
                          )
                        }
                      </p>
                    )}
                    {columnVisibility.recurringPaymentDate && (
                      <p>
                        Recurring Date: {s.recurringpaymentdate ? formatDate(s.recurringpaymentdate) : "-"}
                      </p>
                    )}
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
                      <Edit className="h-4 w-4 mr-1" /> View/Edit
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
                  {columnVisibility.ticketId && (
                    <th className="py-3 px-4 text-left font-medium text-navy">Ticket&nbsp;ID</th>
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
                  {columnVisibility.mode && <th className="py-3 px-4 text-left font-medium text-navy">Modes</th>}
                  {columnVisibility.icNumber && (
                    <th className="py-3 px-4 text-left font-medium text-navy">IC Number</th>
                  )}
                  {columnVisibility.recurringPayment && (
                    <th className="py-3 px-4 text-left font-medium text-navy">Recurring</th>
                  )}
                  {columnVisibility.recurringPaymentDate && (
                    <th className="py-3 px-4 text-left font-medium text-navy">Recurring Date</th>
                  )}
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
                      {columnVisibility.ticketId && (
                        <td className="py-3 px-4 font-mono text-sm">
                          {s.status === "pending" || s.status === "trial" ? (s.ticketId || "-") : "-"}
                        </td>
                      )}
                      {columnVisibility.name && <td className="py-3 px-4 font-medium">{s.name}</td>}
                      {columnVisibility.parentName && <td className="py-3 px-4">{s.parentName}</td>}
                      {columnVisibility.studentPhone && (
                        <td className="py-3 px-4">
                          {toWhatsAppHref(s.studentPhone) ? (
                            <a
                              href={toWhatsAppHref(s.studentPhone)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {s.studentPhone}
                            </a>
                          ) : (
                            s.studentPhone || "-"
                          )}
                        </td>
                      )}
                      {columnVisibility.parentPhone && (
                        <td className="py-3 px-4">
                          {toWhatsAppHref(s.parentPhone) ? (
                            <a
                              href={toWhatsAppHref(s.parentPhone)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {s.parentPhone}
                            </a>
                          ) : (
                            s.parentPhone || "-"
                          )}
                        </td>
                      )}
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
                          <Badge className={getStatusColor(s.status)}>{s.status.toUpperCase()}</Badge>
                        </td>
                      )}
                      {columnVisibility.classInId && (
                        <td className="py-3 px-4 text-xs font-mono">{s.classInId || "-"}</td>
                      )}
                      {columnVisibility.registeredDate && <td className="py-3 px-4">{formatDate(s.registeredDate)}</td>}
                      {columnVisibility.mode && (
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {s.modes.map((m) => (
                              <Badge key={m} className={getModeColor(m)}>{m}</Badge>
                            ))}
                          </div>
                        </td>
                      )}
                      {columnVisibility.icNumber && (
                        <td className="py-3 px-4 font-mono text-sm">{s.icnumber || "-"}</td>
                      )}
                      {columnVisibility.recurringPayment && (
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              s.recurringpayment === null
                                ? "bg-gray-50 text-gray-500 border-gray-200"
                                : s.recurringpayment
                                ? "bg-green-100 text-green-800 border-green-300"
                                : "bg-gray-100 text-gray-800 border-gray-300"
                            }
                          >
                            {s.recurringpayment === null ? "—" : s.recurringpayment ? "Yes" : "No"}
                          </Badge>
                        </td>
                      )}
                      {columnVisibility.recurringPaymentDate && (
                        <td className="py-3 px-4">{s.recurringpaymentdate ? formatDate(s.recurringpaymentdate) : "-"}</td>
                      )}
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openModal(s)}
                          className="text-navy hover:bg-secondary/10"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewTimetable(s)}
                          className="text-navy hover:bg-secondary/10"
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                        {status !== "removed" && (
                          <RemoveStudentConfirm
                            studentName={s.name}
                            triggerVariant="ghost"
                            triggerClassName="text-destructive hover:bg-destructive/10"
                            onConfirm={() => handleRemoveStudent(s)}
                          />
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ---------- pagination ---------- */}
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

      {isModalOpen && selectedStudent && (
        <StudentModal
          student={selectedStudent}
          onClose={closeModal}
          onSave={saveStudent}
          subjects={subjects}
          onRemove={(studentId) => {
            const stu = students.find((s) => s.id === studentId)
            if (stu) {
              void handleRemoveStudent(stu)
            }
          }}
        />
      )}
      {isTimetableModalOpen && selectedStudent && (
        <StudentTimetableModal
          title={`Timetable for ${selectedStudent.name}`}
          subjects={(subjects || []).filter((subject) => selectedStudent.subjects.includes(subject.code))}
          isOpen={isTimetableModalOpen}
          onClose={() => setIsTimetableModalOpen(false)}
          isOneToOneMode={selectedStudent.modes.includes("1 TO 1")}
          hasBothModes={selectedStudent.modes.includes("1 TO 1") && selectedStudent.modes.includes("NORMAL")}
          oneToOneSlots={oneToOneSlots}
          normalSlots={normalSlots}
        />
      )}
    </div>
  )
}
