import StudentsPage from "@/components/student/students-page"
import { getAllStudents } from "@/server/queries/students"

export default async function InactiveStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; pageSize?: string; status?: string }>
}) {
  const sp = await searchParams
  const page = Math.max(parseInt(sp?.page ?? "1", 10) || 1, 1)
  const pageSizeRaw = parseInt(sp?.pageSize ?? "10", 10) || 10
  const pageSize = Math.min(Math.max(pageSizeRaw, 1), 100)
  const { students, totalCount } = await getAllStudents({ page, pageSize, status: "inactive" })
  return (
    <div className="w-full">
      <StudentsPage status="inactive" initialStudents={students} totalItems={totalCount} />
    </div>
  )
}
