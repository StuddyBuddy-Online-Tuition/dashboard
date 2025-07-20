export interface TimeSlot {
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday"
  startTime: string
  endTime: string
}

export interface Subject {
  code: string
  name: string
  standard: string
  timeSlots: TimeSlot[]
  teacherName: string
}
