import SubjectsPageComponent from "@/components/subjects/subjects-page"
import { getAllSubjects } from "@/server/queries/subjects"

export default async function SubjectsPage() {
  const subjects = await getAllSubjects()
  const normalized = subjects.map((s) => ({ ...s, standard: s.standard.toUpperCase() }))
  return (
    <div className="w-full">
      <SubjectsPageComponent initialSubjects={normalized} />
    </div>
  )
}

