import StudentsPage from "@/components/student/students-page"
import { getAllStudents } from "@/server/queries/students"

export default async function TrialStudentsPage({
  searchParams,
}: {
  searchParams: { page?: string; pageSize?: string; status?: string }
}) {
  const page = Math.max(parseInt(searchParams?.page ?? "1", 10) || 1, 1)
  const pageSizeRaw = parseInt(searchParams?.pageSize ?? "20", 10) || 20
  const pageSize = Math.min(Math.max(pageSizeRaw, 1), 100)
  const { students, totalCount } = await getAllStudents({ page, pageSize, status: "trial" })
  return (
    <div className="w-full">
      <StudentsPage status="trial" initialStudents={students} totalItems={totalCount} />
    </div>
  )
}
