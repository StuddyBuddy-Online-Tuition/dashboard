import StudentsPage from "@/components/student/students-page"

export default function PendingStudentsPage() {
  return (
    <div className="w-full">
      <StudentsPage status="pending" />
    </div>
  )
}

