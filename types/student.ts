export type StudentMode = "1 TO 1" | "NORMAL" | "OTHERS" | "BREAK"

export interface Student {
  id: string
  studentId: string
  name: string
  fullName?: string | null
  parentName: string
  studentPhone: string // Changed from 'phone' to 'studentPhone'
  parentPhone: string // Added parent phone
  email: string
  school: string
  grade: string
  subjects: string[]
  status: "active" | "pending" | "inactive" | "trial" | "removed"
  classInId: string | null
  registeredDate: string
  modes: StudentMode[]
  dlp: "DLP" | "non-DLP"
  ticketId: string | null
  /* Payment / admin related fields (read-only for now) */
  icnumber: string | null
  recurringpayment: boolean | null
  recurringpaymentdate: string | null
}

export const STATUSES: Readonly<Student["status"][]> = ["active", "pending", "inactive", "trial", "removed"]
