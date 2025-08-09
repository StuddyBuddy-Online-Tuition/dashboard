export type Weekday =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday"

export interface Timeslot {
  timeslotId: string
  subjectCode: string
  day: Weekday
  startTime: string
  endTime: string
  studentId: string | null
  studentName: string | null
}
  