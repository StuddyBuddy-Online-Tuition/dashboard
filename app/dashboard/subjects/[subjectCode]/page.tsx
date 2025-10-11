"use client"

import { useMemo, useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { subjects as initialSubjects } from "@/data/subjects"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Clock, Users, Edit, Trash2, Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
 
import type { Subject } from "@/types/subject"
import type { Timeslot } from "@/types/timeslot"
import SubjectModal from "@/components/subjects/subject-modal"
import { TimeSlotModal } from "@/components/subjects/timeslot-modal"
import { timeslots as allTimeslots } from "@/data/timeslots"
import { TimetableModal } from "@/components/common/timetable-modal"
import AddStudentsModal from "@/components/subjects/add-students-modal"
import type { Student } from "@/types/student"

interface ScheduleTableProps {
  showOneToOne: boolean
  normalSlots: Timeslot[]
  oneToOneSlots: Timeslot[]
}

function ScheduleTable({ showOneToOne, normalSlots, oneToOneSlots }: ScheduleTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Day</TableHead>
          <TableHead>Start Time</TableHead>
          <TableHead>End Time</TableHead>
          {showOneToOne && <TableHead>Student Name</TableHead>}
          <TableHead>Teacher</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {showOneToOne ? (
          oneToOneSlots.length > 0 ? (
            oneToOneSlots.map((slot) => (
              <TableRow key={slot.timeslotId}>
                <TableCell>{slot.day}</TableCell>
                <TableCell>{slot.startTime}</TableCell>
                <TableCell>{slot.endTime}</TableCell>
                <TableCell>{slot.studentName}</TableCell>
                <TableCell>{slot.teacherName}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No 1-to-1 schedule available for this subject.
              </TableCell>
            </TableRow>
          )
        ) : normalSlots.length > 0 ? (
          normalSlots.map((slot) => (
            <TableRow key={slot.timeslotId}>
              <TableCell>{slot.day}</TableCell>
              <TableCell>{slot.startTime}</TableCell>
              <TableCell>{slot.endTime}</TableCell>
              <TableCell>{slot.teacherName}</TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={4} className="h-24 text-center">
              No schedule available for this subject.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

interface EnrolledStudentsTableProps {
  students: Student[]
  onDelete: (studentId: string) => void
}

function getStatusColor(st: string) {
  return (
    {
      active: "bg-secondary/20 text-black border-secondary/30",
      trial: "bg-blue-100 text-black border-blue-300",
    } as Record<string, string>
  )[st] || "bg-muted text-black"
}

function EnrolledStudentsTable({ students, onDelete }: EnrolledStudentsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student Name</TableHead>
          <TableHead>Student ID</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.length > 0 ? (
          students.map((student) => (
            <TableRow key={student.id}>
              <TableCell className="font-medium">{student.name}</TableCell>
              <TableCell className="font-mono">{student.studentId}</TableCell>
              <TableCell>{student.email}</TableCell>
              <TableCell>{student.studentPhone}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(student.status)}>{student.status.toUpperCase()}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(student.id)}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove Student</span>
                </Button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={6} className="h-24 text-center">
              No students enrolled.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

export default function SubjectDetailPage() {
  const params = useParams()
  const rawSubjectCode = params.subjectCode as string
  const subjectCode = useMemo(() => {
    try {
      const decoded = decodeURIComponent(rawSubjectCode)
      return decoded.replace(/\+/g, " ")
    } catch {
      return rawSubjectCode.replace(/\+/g, " ")
    }
  }, [rawSubjectCode])
  const router = useRouter()

  const [subjects, setSubjects] = useState(initialSubjects)
  const [subjectDb, setSubjectDb] = useState<Subject | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTimeSlotModalOpen, setIsTimeSlotModalOpen] = useState(false)
  const [isTimetableModalOpen, setIsTimetableModalOpen] = useState(false)
  const [isAddStudentsModalOpen, setIsAddStudentsModalOpen] = useState(false)

  const subjectLocal = subjects.find((s) => s.code === subjectCode)
  const subject = subjectDb ?? subjectLocal
  const showOneToOne = subject?.type === "1 to 1"
  const [enrolledStudents, setEnrolledStudents] = useState<Student[]>([])

  useEffect(() => {
    let cancelled = false
    if (!subjectCode) return
    fetch(`/api/subjects/${encodeURIComponent(subjectCode)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return
        if (data.subject) setSubjectDb(data.subject as Subject)
        if (data.enrolledStudents) setEnrolledStudents(data.enrolledStudents as Student[])
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [subjectCode])

  const excludeStudentIds = useMemo(() => enrolledStudents.map((s) => s.id), [enrolledStudents])

  const handleOpenModal = () => setIsModalOpen(true)
  const handleCloseModal = () => setIsModalOpen(false)

  const handleOpenTimeSlotModal = () => setIsTimeSlotModalOpen(true)
  const handleCloseTimeSlotModal = () => setIsTimeSlotModalOpen(false)

  const handleOpenTimetableModal = () => setIsTimetableModalOpen(true)
  const handleCloseTimetableModal = () => setIsTimetableModalOpen(false)
  const handleOpenAddStudentsModal = () => setIsAddStudentsModalOpen(true)
  const handleCloseAddStudentsModal = () => setIsAddStudentsModalOpen(false)

  const handleSaveSubject = async (updatedSubject: Subject, originalCode?: string) => {
    const targetCode = originalCode ?? updatedSubject.code
    try {
      const res = await fetch(`/api/subjects/${encodeURIComponent(targetCode)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: updatedSubject.name,
          standard: updatedSubject.standard,
          type: updatedSubject.type,
          subject: updatedSubject.subject,
        }),
      })
      if (!res.ok) throw new Error("Failed to update subject")
      const saved = (await res.json()) as Subject
      setSubjects((prevSubjects) => {
        const newSubjects = [...prevSubjects]
        const index = newSubjects.findIndex((s) => s.code === targetCode)
        if (index !== -1) {
          newSubjects[index] = saved
        }
        return newSubjects
      })
      setSubjectDb(saved)
      handleCloseModal()
    } catch {
      // no-op: keep UI as-is
    }
  }

  // Local state for normal and 1-to-1 timeslots of this subject
  const [normalSlots, setNormalSlots] = useState<Timeslot[]>([])
  const [oneToOneSlots, setOneToOneSlots] = useState<Timeslot[]>([])

  useEffect(() => {
    let cancelled = false
    if (!subjectCode) return
    fetch(`/api/subjects/${encodeURIComponent(subjectCode)}/timeslots`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.timeslots) {
          const all: Timeslot[] = data.timeslots as Timeslot[]
          const normal = all.filter((t) => t.studentId === null && t.studentName === null)
          const oneToOne = all.filter((t) => t.studentId !== null && t.studentName !== null)
          setNormalSlots(normal)
          setOneToOneSlots(oneToOne)
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [subjectCode])

  const activeSlots = showOneToOne ? oneToOneSlots : normalSlots

  const handleSaveTimeSlots = async (updatedTimeSlots: Timeslot[]) => {
    try {
      const payload = {
        mode: "normal",
        timeslots: updatedTimeSlots.map((t) => ({
          day: t.day,
          startTime: t.startTime,
          endTime: t.endTime,
          teacherName: t.teacherName,
          studentId: null,
          studentName: null,
        })),
      }
      const res = await fetch(`/api/subjects/${encodeURIComponent(subjectCode)}/timeslots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Failed to save timeslots")
      const data = await res.json()
      const all: Timeslot[] = data.timeslots as Timeslot[]
      const normal = all.filter((t) => t.studentId === null && t.studentName === null)
      setNormalSlots(normal)
      setIsTimeSlotModalOpen(false)
    } catch {
      // no-op
    }
  }

  const handleSaveOneToOneSlots = async (updated: Timeslot[]) => {
    try {
      const payload = {
        mode: "oneToOne",
        timeslots: updated.map((t) => ({
          day: t.day,
          startTime: t.startTime,
          endTime: t.endTime,
          teacherName: t.teacherName,
          studentId: t.studentId,
          studentName: t.studentName,
        })),
      }
      const res = await fetch(`/api/subjects/${encodeURIComponent(subjectCode)}/timeslots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Failed to save 1-to-1 timeslots")
      const data = await res.json()
      const all: Timeslot[] = data.timeslots as Timeslot[]
      const oneToOne = all.filter((t) => t.studentId !== null && t.studentName !== null)
      setOneToOneSlots(oneToOne)
      setIsTimeSlotModalOpen(false)
    } catch {
      // no-op
    }
  }

  const handleDeleteStudent = async (studentId: string) => {
    if (!window.confirm("Are you sure you want to remove this student from the subject?")) return
    try {
      const res = await fetch(`/api/subjects/${encodeURIComponent(subjectCode)}/students/${encodeURIComponent(studentId)}`, {
        method: "DELETE",
      })
      if (!res.ok && res.status !== 204) throw new Error("Failed to remove")
      setEnrolledStudents((prevStudents) => prevStudents.filter((student) => student.id !== studentId))
    } catch {
      // no-op
    }
  }

  const handleAddStudents = async (newStudents: Student[]) => {
    const ids = newStudents.map((s) => s.id)
    try {
      await fetch(`/api/subjects/${encodeURIComponent(subjectCode)}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentIds: ids }),
      })
      setEnrolledStudents((prev) => {
        const existingIds = new Set(prev.map((s) => s.id))
        const toAdd = newStudents.filter((s) => !existingIds.has(s.id))
        return [...prev, ...toAdd]
      })
      setIsAddStudentsModalOpen(false)
    } catch {
      // no-op
    }
  }

  const getStandardColor = (standard: string) => {
    if (standard.startsWith("S")) return "bg-green-100 text-green-800 border-green-300"
    if (standard.startsWith("F")) return "bg-blue-100 text-blue-800 border-blue-300"
    return "bg-gray-100 text-gray-800 border-gray-300"
  }

  const getStatusColor = (st: string) =>
    ({
      active: "bg-secondary/20 text-black border-secondary/30",
      trial: "bg-blue-100 text-black border-blue-300",
    } as Record<string, string>)[st] || "bg-muted text-black"

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
    } else {
      router.push("/dashboard/subjects")
    }
  }

  if (!subject) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h2 className="text-2xl font-bold mb-4">Subject Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The subject you are looking for does not exist. It might have been deleted or the code is incorrect.
        </p>
        <Button asChild>
          <Link href="/dashboard/subjects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Subjects
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Go back</span>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-navy">{subject.name}</h1>
              {(() => {
                const std = (subject.standard ?? "").toUpperCase()
                return <Badge className={getStandardColor(std)}>{std}</Badge>
              })()}
              <span className="font-mono text-sm text-muted-foreground">{subject.code}</span>
            </div>
            <p className="text-sm text-muted-foreground">Detailed view of the subject and enrolled students</p>
          </div>
        </div>
        <Button variant="ghost" onClick={handleOpenModal} className="text-navy hover:bg-secondary/10">
          <Edit className="mr-2 h-4 w-4" />
          Edit Subject
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-secondary/20 shadow-md">
            <CardHeader className="bg-gradient-to-r from-secondary/10 to-primary/10">
              <CardTitle className="flex items-center justify-between text-navy">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5" />
                  <span>Class Schedule</span>
                </div>
                <div className="flex items-center gap-2">
                   {activeSlots.length > 0 ? (
                    <Button variant="outline" size="sm" onClick={handleOpenTimetableModal}>
                      Timetable View
                    </Button>
                  ) : null}
                  <Button
                    variant="ghost"
                    size={activeSlots.length > 0 ? "icon" : "default"}
                    onClick={handleOpenTimeSlotModal}
                    className={
                      activeSlots.length > 0
                        ? "text-navy hover:bg-secondary/10"
                        : "text-sm h-8"
                    }
                  >
                    {activeSlots.length > 0 ? (
                      <Edit className="h-4 w-4" />
                    ) : (
                      "Add Schedule"
                    )}
                    <span className="sr-only">Edit Schedule</span>
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ScheduleTable
                showOneToOne={showOneToOne}
                normalSlots={normalSlots}
                oneToOneSlots={oneToOneSlots}
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="border-secondary/20 shadow-md">
            <CardHeader className="bg-gradient-to-r from-secondary/10 to-primary/10">
              <CardTitle className="flex items-center justify-between text-navy">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5" />
                  <span>Enrolled Students ({enrolledStudents.length})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button onClick={handleOpenAddStudentsModal} className="bg-accent text-navy hover:bg-accent/90">
                    <Plus className="mr-2 h-4 w-4" /> Add Students
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <EnrolledStudentsTable students={enrolledStudents} onDelete={handleDeleteStudent} />
            </CardContent>
          </Card>
        </div>
      </div>

      {isModalOpen && subject && (
        <SubjectModal subject={subject} onClose={handleCloseModal} onSave={handleSaveSubject} />
      )}

      {isTimeSlotModalOpen && subject && (
        <TimeSlotModal
          subject={subject}
          isOpen={isTimeSlotModalOpen}
          onClose={handleCloseTimeSlotModal}
          onSave={handleSaveTimeSlots}
          isOneToOneMode={showOneToOne}
          onSaveOneToOne={handleSaveOneToOneSlots}
          enrolledStudents={enrolledStudents}
          normalSlots={normalSlots}
          oneToOneSlots={oneToOneSlots}
        />
      )}

      {isTimetableModalOpen && subject && (
        <TimetableModal
          title={`Timetable for ${subject.name}`}
          subjects={[subject]}
          isOpen={isTimetableModalOpen}
          onClose={handleCloseTimetableModal}
          isOneToOneMode={showOneToOne}
          oneToOneSlots={showOneToOne ? oneToOneSlots : []}
          normalSlots={!showOneToOne ? normalSlots : []}
        />
      )}

      {isAddStudentsModalOpen && subject && (
        <AddStudentsModal
          isOpen={isAddStudentsModalOpen}
          onClose={handleCloseAddStudentsModal}
          subject={subject}
          excludeStudentIds={excludeStudentIds}
          onAddMany={handleAddStudents}
        />
      )}
    </div>
  )
}
