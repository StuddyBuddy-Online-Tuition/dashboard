import StudentsPage from "@/components/student/students-page"

export default function AllStudentsPage() {
  return (
    <div className="w-full">
      <StudentsPage showStatusFilter={true} />
    </div>
  )
} 