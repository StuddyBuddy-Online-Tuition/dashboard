import OneToOneTimetable from "@/components/subjects/one-to-one-timetable"
import { getAllSubjects } from "@/server/queries/subjects"
import { getAllTimeslots } from "@/server/queries/timeslots"

export default async function Page() {
  const subjects = await getAllSubjects()
  const normalizedSubjects = subjects.map((s) => ({ ...s, standard: s.standard.toUpperCase() }))

  const timeslots = await getAllTimeslots()
  const oneToOneTimeslots = timeslots.filter((t) => t.studentName !== null)

  return <OneToOneTimetable initialSubjects={normalizedSubjects} initialTimeslots={oneToOneTimeslots} />
}
