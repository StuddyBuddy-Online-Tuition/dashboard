import StudentsPage from "@/components/student/students-page"

export default function InactiveStudentsPage() {
  return (
    <div className="w-full">
      <StudentsPage status="inactive" />
    </div>
  )
}
