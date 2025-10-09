import StudentsPage from "@/components/student/students-page"
import { getAllStudents } from "@/server/queries/students"
import { STATUSES, type Student } from "@/types/student"

export default async function AllStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; pageSize?: string; status?: string }>
}) {
  const sp = await searchParams
  const page = Math.max(parseInt(sp?.page ?? "1", 10) || 1, 1)
  const pageSizeRaw = parseInt(sp?.pageSize ?? "20", 10) || 20
  const pageSize = Math.min(Math.max(pageSizeRaw, 1), 100)

  const statusParamDecoded = sp?.status ? decodeURIComponent(sp.status) : undefined
  const statusParamRaw = statusParamDecoded?.trim().toLowerCase()
  let statusFilter: Student["status"][] | undefined
  if (statusParamRaw && statusParamRaw !== "all") {
    const parsed = statusParamRaw
      .split(",")
      .map((s) => s.trim())
      .filter((s): s is Student["status"] => (STATUSES as readonly string[]).includes(s))
    statusFilter = parsed.length > 0 ? parsed : undefined
  }

  const { students, totalCount } = await getAllStudents({ page, pageSize, status: statusFilter })
  return (
    <div className="w-full">
      <StudentsPage showStatusFilter={true} initialStudents={students} totalItems={totalCount} />
    </div>
  )
}