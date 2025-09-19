import type { Timeslot } from "@/types/timeslot"
import { subjectDaySeed } from "@/data/subjects"

// Simple pool of teacher names for random assignment (dummy data only)
const TEACHER_POOL = [
  "Dr. Smith",
  "Ms. Jones",
  "Mr. Brown",
  "Mrs. Davis",
  "Mr. Wilson",
  "Cikgu Aminah",
  "Cikgu Siti",
  "Mr. John",
  "Ms. Jane",
  "Mr. Lee",
  "Mrs. White",
  "Cikgu Maria",
  "Mr. David",
  "Pn. Wong",
  "Mr. Kumar",
  "En. Tan",
  "En. Ali",
  "Pn. Lim",
]

function randomTeacher(): string {
  const idx = Math.floor(Math.random() * TEACHER_POOL.length)
  return TEACHER_POOL[idx]
}

// One-to-one sample data remains as-is (non-null students)
const oneToOneSamples: Timeslot[] = [
  { timeslotId: "ts-001", subjectCode: "MMS3", studentId: "SBA1872", studentName: "Jade Ong", day: "Monday", startTime: "10:00", endTime: "11:00", teacherName: randomTeacher() },
  { timeslotId: "ts-002", subjectCode: "BIS3", studentId: "SBA1872", studentName: "Jade Ong", day: "Wednesday", startTime: "11:00", endTime: "12:00", teacherName: randomTeacher() },
  { timeslotId: "ts-003", subjectCode: "BMF1", studentId: "SBA5780", studentName: "Dina Ng", day: "Tuesday", startTime: "14:00", endTime: "15:00", teacherName: randomTeacher() },
  { timeslotId: "ts-004", subjectCode: "MMF1", studentId: "SBA5780", studentName: "Dina Ng", day: "Thursday", startTime: "15:00", endTime: "16:00", teacherName: randomTeacher() },
  { timeslotId: "ts-005", subjectCode: "BIS1", studentId: "SBA1070", studentName: "Jade Ng", day: "Friday", startTime: "09:00", endTime: "10:00", teacherName: randomTeacher() },
  { timeslotId: "ts-006", subjectCode: "BMS1", studentId: "SBA1070", studentName: "Jade Ng", day: "Monday", startTime: "16:00", endTime: "17:00", teacherName: randomTeacher() },
  { timeslotId: "ts-007", subjectCode: "MMF2", studentId: "SBA9989", studentName: "Dina Ismail", day: "Wednesday", startTime: "10:00", endTime: "11:00", teacherName: randomTeacher() },
  { timeslotId: "ts-008", subjectCode: "BMF2", studentId: "SBA9989", studentName: "Dina Ismail", day: "Friday", startTime: "11:00", endTime: "12:00", teacherName: randomTeacher() },
  { timeslotId: "ts-009", subjectCode: "B1F4", studentId: "SBA9286", studentName: "Farah Wong", day: "Tuesday", startTime: "09:00", endTime: "10:00", teacherName: randomTeacher() },
  { timeslotId: "ts-010", subjectCode: "F1F4", studentId: "SBA9286", studentName: "Farah Wong", day: "Thursday", startTime: "10:00", endTime: "11:00", teacherName: randomTeacher() },
  { timeslotId: "ts-011", subjectCode: "MMS3", studentId: "SBA9227", studentName: "Adam Tan", day: "Monday", startTime: "13:00", endTime: "14:00", teacherName: randomTeacher() },
  { timeslotId: "ts-012", subjectCode: "BIS3", studentId: "SBA9227", studentName: "Adam Tan", day: "Wednesday", startTime: "14:00", endTime: "15:00", teacherName: randomTeacher() },
]

// Generate one normal slot per subject in one of the two night windows
const NIGHT_WINDOWS = [
  { startTime: "20:15", endTime: "21:15" },
  { startTime: "21:20", endTime: "22:20" },
] as const

const normalSlots: Timeslot[] = subjectDaySeed.map((seed, index) => {
  const window = NIGHT_WINDOWS[index % 2]
  return {
    timeslotId: `normal-${seed.code}`,
    subjectCode: seed.code,
    day: seed.day,
    startTime: window.startTime,
    endTime: window.endTime,
    teacherName: randomTeacher(),
    studentId: null,
    studentName: null,
  }
})

export const timeslots: Timeslot[] = [...normalSlots, ...oneToOneSamples]
