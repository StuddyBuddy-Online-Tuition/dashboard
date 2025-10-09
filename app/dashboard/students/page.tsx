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
  const pageSizeRaw = parseInt(sp?.pageSize ?? "10", 10) || 10
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

  // Parse sort rules from URL: sort=field:order,field2:order2
  const rawSort = (sp as Record<string, string | undefined>)["sort"] ?? undefined
  const sortRules = (rawSort ? String(rawSort) : "")
    .split(",")
    .map((pair) => pair.trim())
    .filter(Boolean)
    .map((pair) => {
      const [field, order] = pair.split(":").map((s) => s.trim())
      const f = field as "registeredDate" | "status" | "grade" | "dlp" | "name"
      const o = order === "asc" || order === "desc" ? order : undefined
      return f && o ? { field: f, order: o } : undefined
    })
    .filter(Boolean) as { field: "registeredDate" | "status" | "grade" | "dlp" | "name"; order: "asc" | "desc" }[]

  const { students, totalCount } = await getAllStudents({ page, pageSize, status: statusFilter, sort: sortRules })
  return (
    <div className="w-full">
      <StudentsPage showStatusFilter={true} initialStudents={students} totalItems={totalCount} />
    </div>
  )
}