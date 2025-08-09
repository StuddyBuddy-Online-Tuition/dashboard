"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { students } from "@/data/students"
import { subjects as initialSubjects } from "@/data/subjects"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, BookUser, Clock, User, Users, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { Subject } from "@/types/subject"
import type { Timeslot } from "@/types/timeslot"
import SubjectModal from "@/components/subjects/subject-modal"
import { TimeSlotModal } from "@/components/subjects/timeslot-modal"
import { timeslots as allTimeslots } from "@/data/timeslots"
import { TimetableModal } from "@/components/common/timetable-modal"

export default function SubjectDetailPage() {
  const params = useParams()
  const subjectCode = params.subjectCode as string
  const router = useRouter()

  const [subjects, setSubjects] = useState(initialSubjects)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTimeSlotModalOpen, setIsTimeSlotModalOpen] = useState(false)
  const [isTimetableModalOpen, setIsTimetableModalOpen] = useState(false)
  const [showOneToOne, setShowOneToOne] = useState(false)

  const subject = subjects.find((s) => s.code === subjectCode)
  const [enrolledStudents, setEnrolledStudents] = useState(() =>
    students.filter((student) => student.subjects.includes(subjectCode)),
  )

  const filteredStudents = enrolledStudents.filter((student) => {
    if (showOneToOne) {
      return student.mode === "1 to 1"
    }
    return student.mode === "normal"
  })

  const handleOpenModal = () => setIsModalOpen(true)
  const handleCloseModal = () => setIsModalOpen(false)

  const handleOpenTimeSlotModal = () => setIsTimeSlotModalOpen(true)
  const handleCloseTimeSlotModal = () => setIsTimeSlotModalOpen(false)

  const handleOpenTimetableModal = () => setIsTimetableModalOpen(true)
  const handleCloseTimetableModal = () => setIsTimetableModalOpen(false)

  const handleSaveSubject = (updatedSubject: Subject, originalCode?: string) => {
    setSubjects((prevSubjects) => {
      const newSubjects = [...prevSubjects]
      const index = newSubjects.findIndex((s) => s.code === (originalCode ?? updatedSubject.code))
      if (index !== -1) {
        newSubjects[index] = updatedSubject
      }
      return newSubjects
    })
    handleCloseModal()
  }

  // Local state for normal and 1-to-1 timeslots of this subject
  const [normalSlots, setNormalSlots] = useState<Timeslot[]>(() =>
    allTimeslots.filter((t) => t.subjectCode === subjectCode && t.studentId === null && t.studentName === null),
  )
  const [oneToOneSlots, setOneToOneSlots] = useState<Timeslot[]>(() =>
    allTimeslots.filter((t) => t.subjectCode === subjectCode && t.studentId !== null && t.studentName !== null),
  )

  const handleSaveTimeSlots = (updatedTimeSlots: Timeslot[]) => {
    setNormalSlots(updatedTimeSlots)
  }

  const handleSaveOneToOneSlots = (updated: Timeslot[]) => {
    setOneToOneSlots(updated)
  }

  const handleDeleteStudent = (studentId: string) => {
    if (window.confirm("Are you sure you want to remove this student from the subject?")) {
      setEnrolledStudents((prevStudents) => prevStudents.filter((student) => student.id !== studentId))
    }
  }

  const getStandardColor = (standard: string) => {
    if (standard.startsWith("S")) return "bg-green-100 text-green-800 border-green-300"
    if (standard.startsWith("F")) return "bg-blue-100 text-blue-800 border-blue-300"
    return "bg-gray-100 text-gray-800 border-gray-300"
  }

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
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Go back</span>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-navy">{subject.name}</h1>
          <p className="text-sm text-muted-foreground">Detailed view of the subject and enrolled students</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-secondary/20 shadow-md">
            <CardHeader className="bg-gradient-to-r from-secondary/10 to-primary/10">
              <CardTitle className="flex items-center justify-between text-navy">
                <div className="flex items-center gap-3">
                  <BookUser className="h-5 w-5" />
                  <span>Subject Details</span>
                </div>
                <Button variant="ghost" size="icon" onClick={handleOpenModal} className="text-navy hover:bg-secondary/10">
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit Subject</span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">Subject Code</span>
                <span className="font-mono text-navy">{subject.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">Standard/Form</span>
                <Badge className={getStandardColor(subject.standard)}>{subject.standard}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">Teacher</span>
                <span className="text-navy flex items-center gap-2">
                  <User className="h-4 w-4" /> {subject.teacherName}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-secondary/20 shadow-md">
            <CardHeader className="bg-gradient-to-r from-secondary/10 to-primary/10">
              <CardTitle className="flex items-center justify-between text-navy">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5" />
                  <span>Class Schedule</span>
                </div>
                <div className="flex items-center gap-2">
                   {(normalSlots.length > 0) || (showOneToOne && oneToOneSlots.length > 0) ? (
                    <Button variant="outline" size="sm" onClick={handleOpenTimetableModal}>
                      Timetable View
                    </Button>
                  ) : null}
                  <Button
                    variant="ghost"
                    size={normalSlots.length > 0 ? "icon" : "default"}
                    onClick={handleOpenTimeSlotModal}
                    className={
                      normalSlots.length > 0
                        ? "text-navy hover:bg-secondary/10"
                        : "text-sm h-8"
                    }
                  >
                    {normalSlots.length > 0 ? (
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Day</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                    {showOneToOne && <TableHead>Student Name</TableHead>}
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
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
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
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        No schedule available for this subject.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="border-secondary/20 shadow-md">
            <CardHeader className="bg-gradient-to-r from-secondary/10 to-primary/10">
              <CardTitle className="flex items-center justify-between text-navy">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5" />
                  <span>Enrolled Students ({filteredStudents.length})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="student-mode"
                    checked={showOneToOne}
                    onCheckedChange={setShowOneToOne}
                  />
                  <Label htmlFor="student-mode">{showOneToOne ? "1 to 1" : "Normal"}</Label>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell className="font-mono">{student.studentId}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.studentPhone}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteStudent(student.id)}
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
                      <TableCell colSpan={5} className="h-24 text-center">
                        No students found for {showOneToOne ? '"1 to 1"' : '"Normal"'} mode.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
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
    </div>
  )
}
