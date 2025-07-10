export interface Student {
  id: string
  studentId: string
  name: string
  parentName: string
  studentPhone: string // Changed from 'phone' to 'studentPhone'
  parentPhone: string // Added parent phone
  email: string
  school: string
  grade: string
  subjects: string[]
  status: "active" | "pending" | "inactive" | "trial"
  classInId: string | null
  registeredDate: string
  mode: "1 to 1" | "normal"
  dlp: "DLP" | "non-DLP"
  // Financial fields
  nextRecurringPaymentDate: string
  recurringPayment: boolean
  lastPaymentMadeDate: string
}
