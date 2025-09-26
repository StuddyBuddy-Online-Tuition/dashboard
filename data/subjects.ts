import type { Subject } from "@/types/subject"
import type { Weekday } from "@/types/timeslot"

// Source of truth copied from data/Subject List.csv
const CSV_SOURCE = `Code,Subject,Std/Form,Type,Name
K1F4,Kimia BM,F4,Classroom,Kimia BM F4
K2F4,Kimia DLP,F4,Classroom,Kimia DLP F4
K1F5,Kimia BM,F5,Classroom,Kimia BM F5
K2F5,Kimia DLP,F5,Classroom,Kimia DLP F5
B1F4,Biology BM,F4,Classroom,Biology BM F4
B2F4,Biology DLP,F4,Classroom,Biology DLP F4
B1F5,Biology BM,F5,Classroom,Biology BM F5
B2F5,Biology DLP,F5,Classroom,Biology DLP F5
F1F4,Fizik BM,F4,Classroom,Fizik BM F4
F2F4,Fizik DLP,F4,Classroom,Fizik DLP F4
F1F5,Fizik BM,F5,Classroom,Fizik BM F5
F2F5,Fizik DLP,F5,Classroom,Fizik DLP F5
AMF4,Add math BM,F4,Classroom,Add math BM F4
AMDF4,Add math DLP,F4,Classroom,Add math DLP F4
AMF5,Add math BM,F5,Classroom,Add math BM F5
AMDF5,Add math DLP,F5,Classroom,Add math DLP F5
PAF4,Prinsip Akaun ,F4,Classroom,Prinsip Akaun  F4
PAF5,Prinsip Akaun ,F5,Classroom,Prinsip Akaun  F5
BMS1,Bahasa Malaysia ,S1,Classroom,Bahasa Malaysia  S1
BMS2,Bahasa Malaysia ,S2,Classroom,Bahasa Malaysia  S2
BMS3,Bahasa Malaysia ,S3,Classroom,Bahasa Malaysia  S3
BMS4,Bahasa Malaysia ,S4,Classroom,Bahasa Malaysia  S4
BMS5,Bahasa Malaysia ,S5,Classroom,Bahasa Malaysia  S5
BMS6,Bahasa Malaysia ,S6,Classroom,Bahasa Malaysia  S6
BMF1,Bahasa Malaysia ,F1,Classroom,Bahasa Malaysia  F1
BMF2,Bahasa Malaysia ,F2,Classroom,Bahasa Malaysia  F2
BMF3,Bahasa Malaysia ,F3,Classroom,Bahasa Malaysia  F3
BMF4,Bahasa Malaysia ,F4,Classroom,Bahasa Malaysia  F4
BMF5,Bahasa Malaysia ,F5,Classroom,Bahasa Malaysia  F5
BIS1,Bahasa Inggeris ,S1,Classroom,Bahasa Inggeris  S1
BIS2,Bahasa Inggeris ,S2,Classroom,Bahasa Inggeris  S2
BIS3,Bahasa Inggeris ,S3,Classroom,Bahasa Inggeris  S3
BIS4,Bahasa Inggeris ,S4,Classroom,Bahasa Inggeris  S4
BIS5,Bahasa Inggeris ,S5,Classroom,Bahasa Inggeris  S5
BIS6,Bahasa Inggeris ,S6,Classroom,Bahasa Inggeris  S6
BIF1,Bahasa Inggeris ,F1,Classroom,Bahasa Inggeris  F1
BIF2,Bahasa Inggeris ,F2,Classroom,Bahasa Inggeris  F2
BIF3,Bahasa Inggeris ,F3,Classroom,Bahasa Inggeris  F3
BIF4,Bahasa Inggeris ,F4,Classroom,Bahasa Inggeris  F4
BIF5,Bahasa Inggeris ,F5,Classroom,Bahasa Inggeris  F5
MMS1,Matematik BM,S1,Classroom,Matematik BM S1
MMDS1,Matematik DLP,S1,Classroom,Matematik DLP S1
MMS2,Matematik BM,S2,Classroom,Matematik BM S2
MMDS2,Matematik DLP,S2,Classroom,Matematik DLP S2
MMS3,Matematik BM,S3,Classroom,Matematik BM S3
MMDS3,Matematik DLP,S3,Classroom,Matematik DLP S3
MMS4,Matematik BM,S4,Classroom,Matematik BM S4
MMDS4,Matematik DLP,S4,Classroom,Matematik DLP S4
MMS5,Matematik BM,S5,Classroom,Matematik BM S5
MMDS5,Matematik DLP,S5,Classroom,Matematik DLP S5
MMS6,Matematik BM,S6,Classroom,Matematik BM S6
MMDS6,Matematik DLP,S6,Classroom,Matematik DLP S6
MMF1,Matematik BM,F1,Classroom,Matematik BM F1
MMDF1,Matematik DLP,F1,Classroom,Matematik DLP F1
MMF2,Matematik BM,F2,Classroom,Matematik BM F2
MMDF2,Matematik DLP,F2,Classroom,Matematik DLP F2
MMF3,Matematik BM,F3,Classroom,Matematik BM F3
MMDF3,Matematik DLP,F3,Classroom,Matematik DLP F3
MMF4,Matematik BM,F4,Classroom,Matematik BM F4
MMDF4,Matematik DLP,F4,Classroom,Matematik DLP F4
MMF5,Matematik BM,F5,Classroom,Matematik BM F5
MMDF5,Matematik DLP,F5,Classroom,Matematik DLP F5
S1S1,Sains BM,S1,Classroom,Sains BM S1
S2S1,Sains DLP,S1,Classroom,Sains DLP S1
S1S2,Sains BM,S2,Classroom,Sains BM S2
S2S2,Sains DLP,S2,Classroom,Sains DLP S2
S1S3,Sains BM,S3,Classroom,Sains BM S3
S2S3,Sains DLP,S3,Classroom,Sains DLP S3
S1S4,Sains BM,S4,Classroom,Sains BM S4
S2S4,Sains DLP,S4,Classroom,Sains DLP S4
S1S5,Sains BM,S5,Classroom,Sains BM S5
S2S5,Sains DLP,S5,Classroom,Sains DLP S5
S1S6,Sains BM,S6,Classroom,Sains BM S6
S2S6,Sains DLP,S6,Classroom,Sains DLP S6
S1F1,Sains BM,F1,Classroom,Sains BM F1
S2F1,Sains DLP,F1,Classroom,Sains DLP F1
S1F2,Sains BM,F2,Classroom,Sains BM F2
S2F2,Sains DLP,F2,Classroom,Sains DLP F2
S1F3,Sains BM,F3,Classroom,Sains BM F3
S2F3,Sains DLP,F3,Classroom,Sains DLP F3
S1F4,Sains BM,F4,Classroom,Sains BM F4
S2F4,Sains DLP,F4,Classroom,Sains DLP F4
S1F5,Sains BM,F5,Classroom,Sains BM F5
S2F5,Sains DLP,F5,Classroom,Sains DLP F5
SEJS4,Sejarah ,S4,Classroom,Sejarah  S4
SEJS5,Sejarah ,S5,Classroom,Sejarah  S5
SEJS6,Sejarah ,S6,Classroom,Sejarah  S6
SEJF1,Sejarah ,F1,Classroom,Sejarah  F1
SEJF2,Sejarah ,F2,Classroom,Sejarah  F2
SEJF3,Sejarah ,F3,Classroom,Sejarah  F3
SEJF4,Sejarah ,F4,Classroom,Sejarah  F4
SEJF5,Sejarah ,F5,Classroom,Sejarah  F5
GEOF1,Geografi ,F1,Classroom,Geografi  F1
GEOF2,Geografi ,F2,Classroom,Geografi  F2
GEOF3,Geografi ,F3,Classroom,Geografi  F3
GEOF4,Geografi ,F4,Classroom,Geografi  F4
GEOF5,Geografi ,F5,Classroom,Geografi  F5
K1F4 1:1,Kimia BM,F4,1 to 1,Kimia BM F4 - 1 to 1
K2F4 1:1,Kimia DLP,F4,1 to 1,Kimia DLP F4 - 1 to 1
K1F5 1:1,Kimia BM,F5,1 to 1,Kimia BM F5 - 1 to 1
K2F5 1:1,Kimia DLP,F5,1 to 1,Kimia DLP F5 - 1 to 1
B1F4 1:1,Biology BM,F4,1 to 1,Biology BM F4 - 1 to 1
B2F4 1:1,Biology DLP,F4,1 to 1,Biology DLP F4 - 1 to 1
B1F5 1:1,Biology BM,F5,1 to 1,Biology BM F5 - 1 to 1
B2F5 1:1,Biology DLP,F5,1 to 1,Biology DLP F5 - 1 to 1
F1F4 1:1,Fizik BM,F4,1 to 1,Fizik BM F4 - 1 to 1
F2F4 1:1,Fizik DLP,F4,1 to 1,Fizik DLP F4 - 1 to 1
F1F5 1:1,Fizik BM,F5,1 to 1,Fizik BM F5 - 1 to 1
F2F5 1:1,Fizik DLP,F5,1 to 1,Fizik DLP F5 - 1 to 1
AMF4 1:1,Add math BM,F4,1 to 1,Add math BM F4 - 1 to 1
AMDF4 1:1,Add math DLP,F4,1 to 1,Add math DLP F4 - 1 to 1
AMF5 1:1,Add math BM,F5,1 to 1,Add math BM F5 - 1 to 1
AMDF5 1:1,Add math DLP,F5,1 to 1,Add math DLP F5 - 1 to 1
PAF4 1:1,Prinsip Akaun ,F4,1 to 1,Prinsip Akaun  F4 - 1 to 1
PAF5 1:1,Prinsip Akaun ,F5,1 to 1,Prinsip Akaun  F5 - 1 to 1
BMS1 1:1,Bahasa Malaysia ,S1,1 to 1,Bahasa Malaysia  S1 - 1 to 1
BMS2 1:1,Bahasa Malaysia ,S2,1 to 1,Bahasa Malaysia  S2 - 1 to 1
BMS3 1:1,Bahasa Malaysia ,S3,1 to 1,Bahasa Malaysia  S3 - 1 to 1
BMS4 1:1,Bahasa Malaysia ,S4,1 to 1,Bahasa Malaysia  S4 - 1 to 1
BMS5 1:1,Bahasa Malaysia ,S5,1 to 1,Bahasa Malaysia  S5 - 1 to 1
BMS6 1:1,Bahasa Malaysia ,S6,1 to 1,Bahasa Malaysia  S6 - 1 to 1
BMF1 1:1,Bahasa Malaysia ,F1,1 to 1,Bahasa Malaysia  F1 - 1 to 1
BMF2 1:1,Bahasa Malaysia ,F2,1 to 1,Bahasa Malaysia  F2 - 1 to 1
BMF3 1:1,Bahasa Malaysia ,F3,1 to 1,Bahasa Malaysia  F3 - 1 to 1
BMF4 1:1,Bahasa Malaysia ,F4,1 to 1,Bahasa Malaysia  F4 - 1 to 1
BMF5 1:1,Bahasa Malaysia ,F5,1 to 1,Bahasa Malaysia  F5 - 1 to 1
BIS1 1:1,Bahasa Inggeris ,S1,1 to 1,Bahasa Inggeris  S1 - 1 to 1
BIS2 1:1,Bahasa Inggeris ,S2,1 to 1,Bahasa Inggeris  S2 - 1 to 1
BIS3 1:1,Bahasa Inggeris ,S3,1 to 1,Bahasa Inggeris  S3 - 1 to 1
BIS4 1:1,Bahasa Inggeris ,S4,1 to 1,Bahasa Inggeris  S4 - 1 to 1
BIS5 1:1,Bahasa Inggeris ,S5,1 to 1,Bahasa Inggeris  S5 - 1 to 1
BIS6 1:1,Bahasa Inggeris ,S6,1 to 1,Bahasa Inggeris  S6 - 1 to 1
BIF1 1:1,Bahasa Inggeris ,F1,1 to 1,Bahasa Inggeris  F1 - 1 to 1
BIF2 1:1,Bahasa Inggeris ,F2,1 to 1,Bahasa Inggeris  F2 - 1 to 1
BIF3 1:1,Bahasa Inggeris ,F3,1 to 1,Bahasa Inggeris  F3 - 1 to 1
BIF4 1:1,Bahasa Inggeris ,F4,1 to 1,Bahasa Inggeris  F4 - 1 to 1
BIF5 1:1,Bahasa Inggeris ,F5,1 to 1,Bahasa Inggeris  F5 - 1 to 1
MMS1 1:1,Matematik BM,S1,1 to 1,Matematik BM S1 - 1 to 1
MMDS1 1:1,Matematik DLP,S1,1 to 1,Matematik DLP S1 - 1 to 1
MMS2 1:1,Matematik BM,S2,1 to 1,Matematik BM S2 - 1 to 1
MMDS2 1:1,Matematik DLP,S2,1 to 1,Matematik DLP S2 - 1 to 1
MMS3 1:1,Matematik BM,S3,1 to 1,Matematik BM S3 - 1 to 1
MMDS3 1:1,Matematik DLP,S3,1 to 1,Matematik DLP S3 - 1 to 1
MMS4 1:1,Matematik BM,S4,1 to 1,Matematik BM S4 - 1 to 1
MMDS4 1:1,Matematik DLP,S4,1 to 1,Matematik DLP S4 - 1 to 1
MMS5 1:1,Matematik BM,S5,1 to 1,Matematik BM S5 - 1 to 1
MMDS5 1:1,Matematik DLP,S5,1 to 1,Matematik DLP S5 - 1 to 1
MMS6 1:1,Matematik BM,S6,1 to 1,Matematik BM S6 - 1 to 1
MMDS6 1:1,Matematik DLP,S6,1 to 1,Matematik DLP S6 - 1 to 1
MMF1 1:1,Matematik BM,F1,1 to 1,Matematik BM F1 - 1 to 1
MMDF1 1:1,Matematik DLP,F1,1 to 1,Matematik DLP F1 - 1 to 1
MMF2 1:1,Matematik BM,F2,1 to 1,Matematik BM F2 - 1 to 1
MMDF2 1:1,Matematik DLP,F2,1 to 1,Matematik DLP F2 - 1 to 1
MMF3 1:1,Matematik BM,F3,1 to 1,Matematik BM F3 - 1 to 1
MMDF3 1:1,Matematik DLP,F3,1 to 1,Matematik DLP F3 - 1 to 1
MMF4 1:1,Matematik BM,F4,1 to 1,Matematik BM F4 - 1 to 1
MMDF4 1:1,Matematik DLP,F4,1 to 1,Matematik DLP F4 - 1 to 1
MMF5 1:1,Matematik BM,F5,1 to 1,Matematik BM F5 - 1 to 1
MMDF5 1:1,Matematik DLP,F5,1 to 1,Matematik DLP F5 - 1 to 1
S1S1 1:1,Sains BM,S1,1 to 1,Sains BM S1 - 1 to 1
S2S1 1:1,Sains DLP,S1,1 to 1,Sains DLP S1 - 1 to 1
S1S2 1:1,Sains BM,S2,1 to 1,Sains BM S2 - 1 to 1
S2S2 1:1,Sains DLP,S2,1 to 1,Sains DLP S2 - 1 to 1
S1S3 1:1,Sains BM,S3,1 to 1,Sains BM S3 - 1 to 1
S2S3 1:1,Sains DLP,S3,1 to 1,Sains DLP S3 - 1 to 1
S1S4 1:1,Sains BM,S4,1 to 1,Sains BM S4 - 1 to 1
S2S4 1:1,Sains DLP,S4,1 to 1,Sains DLP S4 - 1 to 1
S1S5 1:1,Sains BM,S5,1 to 1,Sains BM S5 - 1 to 1
S2S5 1:1,Sains DLP,S5,1 to 1,Sains DLP S5 - 1 to 1
S1S6 1:1,Sains BM,S6,1 to 1,Sains BM S6 - 1 to 1
S2S6 1:1,Sains DLP,S6,1 to 1,Sains DLP S6 - 1 to 1
S1F1 1:1,Sains BM,F1,1 to 1,Sains BM F1 - 1 to 1
S2F1 1:1,Sains DLP,F1,1 to 1,Sains DLP F1 - 1 to 1
S1F2 1:1,Sains BM,F2,1 to 1,Sains BM F2 - 1 to 1
S2F2 1:1,Sains DLP,F2,1 to 1,Sains DLP F2 - 1 to 1
S1F3 1:1,Sains BM,F3,1 to 1,Sains BM F3 - 1 to 1
S2F3 1:1,Sains DLP,F3,1 to 1,Sains DLP F3 - 1 to 1
S1F4 1:1,Sains BM,F4,1 to 1,Sains BM F4 - 1 to 1
S2F4 1:1,Sains DLP,F4,1 to 1,Sains DLP F4 - 1 to 1
S1F5 1:1,Sains BM,F5,1 to 1,Sains BM F5 - 1 to 1
S2F5 1:1,Sains DLP,F5,1 to 1,Sains DLP F5 - 1 to 1
SEJS4 1:1,Sejarah ,S4,1 to 1,Sejarah  S4 - 1 to 1
SEJS5 1:1,Sejarah ,S5,1 to 1,Sejarah  S5 - 1 to 1
SEJS6 1:1,Sejarah ,S6,1 to 1,Sejarah  S6 - 1 to 1
SEJF1 1:1,Sejarah ,F1,1 to 1,Sejarah  F1 - 1 to 1
SEJF2 1:1,Sejarah ,F2,1 to 1,Sejarah  F2 - 1 to 1
SEJF3 1:1,Sejarah ,F3,1 to 1,Sejarah  F3 - 1 to 1
SEJF4 1:1,Sejarah ,F4,1 to 1,Sejarah  F4 - 1 to 1
SEJF5 1:1,Sejarah ,F5,1 to 1,Sejarah  F5 - 1 to 1
GEOF1 1:1,Geografi ,F1,1 to 1,Geografi  F1 - 1 to 1
GEOF2 1:1,Geografi ,F2,1 to 1,Geografi  F2 - 1 to 1
GEOF3 1:1,Geografi ,F3,1 to 1,Geografi  F3 - 1 to 1
GEOF4 1:1,Geografi ,F4,1 to 1,Geografi  F4 - 1 to 1
GEOF5 1:1,Geografi ,F5,1 to 1,Geografi  F5 - 1 to 1` as const

function parseCsvToSubjects(csv: string): Subject[] {
  const lines = csv.split("\n").map((l) => l.trim()).filter(Boolean)
  const header = lines.shift()
  if (!header) return []
  return lines
    .map((line) => line.split(","))
    .filter((parts) => parts.length >= 5)
    .map((parts) => ({
      code: parts[0].trim(),
      subject: parts[1].trim(),
      standard: parts[2].trim(),
      type: parts[3].trim(),
      name: parts[4].trim(),
    }))
}

export const subjects: Subject[] = parseCsvToSubjects(CSV_SOURCE)

// Deterministic day assignment for Classroom subjects only (used by data/timeslots.ts)
const WEEK_DAYS: Weekday[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
export const subjectDaySeed: Array<{ code: string; day: Weekday }> = subjects
  .filter((s) => s.type === "Classroom")
  .map((s, idx) => ({ code: s.code, day: WEEK_DAYS[idx % WEEK_DAYS.length] }))
