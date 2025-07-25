"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { students } from "@/data/students"
import { subjects as initialSubjects } from "@/data/subjects"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, BookUser, Clock, User, Users, Edit } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { Subject, TimeSlot } from "@/types/subject"
import SubjectModal from "@/components/subjects/subject-modal"
import { TimeSlotModal } from "@/components/subjects/timeslot-modal"
import { TimetableModal } from "@/components/common/timetable-modal"

export default function SubjectDetailPage() {
  const params = useParams()
  const subjectCode = params.subjectCode as string

  const [subjects, setSubjects] = useState(initialSubjects)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTimeSlotModalOpen, setIsTimeSlotModalOpen] = useState(false)
  const [isTimetableModalOpen, setIsTimetableModalOpen] = useState(false)

  const subject = subjects.find((s) => s.code === subjectCode)
  const enrolledStudents = students.filter((student) => student.subjects.includes(subjectCode))

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

  const handleSaveTimeSlots = (updatedTimeSlots: TimeSlot[]) => {
    if (!subject) return

    const updatedSubject = { ...subject, timeSlots: updatedTimeSlots }

    setSubjects((prevSubjects) => {
      return prevSubjects.map((s) => (s.code === subject.code ? updatedSubject : s))
    })
  }

  const getStandardColor = (standard: string) => {
    if (standard.startsWith("S")) return "bg-green-100 text-green-800 border-green-300"
    if (standard.startsWith("F")) return "bg-blue-100 text-blue-800 border-blue-300"
    return "bg-gray-100 text-gray-800 border-gray-300"
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
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/subjects">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to subjects</span>
          </Link>
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
                  {subject.timeSlots && subject.timeSlots.length > 0 && (
                    <Button variant="outline" size="sm" onClick={handleOpenTimetableModal}>
                      Timetable View
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size={subject.timeSlots && subject.timeSlots.length > 0 ? "icon" : "default"}
                    onClick={handleOpenTimeSlotModal}
                    className={
                      subject.timeSlots && subject.timeSlots.length > 0
                        ? "text-navy hover:bg-secondary/10"
                        : "text-sm h-8"
                    }
                  >
                    {subject.timeSlots && subject.timeSlots.length > 0 ? (
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subject.timeSlots && subject.timeSlots.length > 0 ? (
                    subject.timeSlots.map((slot, index) => (
                      <TableRow key={index}>
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
              <CardTitle className="flex items-center gap-3 text-navy">
                <Users className="h-5 w-5" />
                <span>Enrolled Students ({enrolledStudents.length})</span>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrolledStudents.length > 0 ? (
                    enrolledStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell className="font-mono">{student.studentId}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.studentPhone}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No students enrolled in this subject.
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
        />
      )}

      {isTimetableModalOpen && subject && (
        <TimetableModal
          title={`Timetable for ${subject.name}`}
          subjects={[subject]}
          isOpen={isTimetableModalOpen}
          onClose={handleCloseTimetableModal}
        />
      )}
    </div>
  )
}
