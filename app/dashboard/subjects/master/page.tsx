import MasterTimetable from "@/components/subjects/master-timetable"
import { getAllSubjects } from "@/server/queries/subjects"
import { getAllTimeslots } from "@/server/queries/timeslots"

export default async function MasterSubjectsTimetablePage() {
  const subjects = await getAllSubjects()
  const normalizedSubjects = subjects.map((s) => ({ ...s, standard: s.standard.toUpperCase() }))

  const timeslots = await getAllTimeslots()
  const normalTimeslots = timeslots.filter((t) => t.studentId === null)
  return <MasterTimetable initialSubjects={normalizedSubjects} initialTimeslots={normalTimeslots} />
}


