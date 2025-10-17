import StudentsPage from "@/components/student/students-page"
import { getAllStudents } from "@/server/queries/students"
import { getAllSubjects } from "@/server/queries/subjects"

export default async function InactiveStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; pageSize?: string; status?: string }>
}) {
  const sp = await searchParams
  const page = Math.max(parseInt(sp?.page ?? "1", 10) || 1, 1)
  const pageSizeRaw = parseInt(sp?.pageSize ?? "10", 10) || 10
  const pageSize = Math.min(Math.max(pageSizeRaw, 1), 100)
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

  const { students, totalCount } = await getAllStudents({ page, pageSize, status: "inactive", sort: sortRules, keyword: (sp as Record<string, string | undefined>)["keyword"]?.toString()?.trim() || undefined })
  const subjects = await getAllSubjects()
  return (
    <div className="w-full">
      <StudentsPage status="inactive" initialStudents={students} totalItems={totalCount} subjects={subjects} />
    </div>
  )
}
