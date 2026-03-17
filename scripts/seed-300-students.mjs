/**
 * Seed 300 students for testing pagination and bulk data.
 * Run: node scripts/seed-300-students.mjs
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env
 */
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { db: { schema: "public" } }
);

const FIRST_NAMES = [
  "Ahmad", "Siti", "Muhammad", "Nurul", "Farah", "Amir", "Aina", "Hakim",
  "Zara", "Iman", "Danish", "Lina", "Afiq", "Sarah", "Hazim", "Dina",
  "Ain", "Syafiq", "Mira", "Izwan", "Putri", "Irfan", "Nur", "Wan",
  "Lee", "Tan", "Chong", "Kumar", "Raj", "Priya", "Wei", "Jia"
];

const LAST_NAMES = [
  "Abdullah", "Rahman", "Ibrahim", "Ahmad", "Osman", "Hassan", "Ali",
  "Lee", "Tan", "Wong", "Chan", "Ng", "Kumar", "Ravi", "Singh",
  "bin Ahmad", "binti Rahman", "Arasu", "Juita", "Wazhif", "Aqilah"
];

const SCHOOLS = [
  "SMK Example", "SMK Demo", "SMK Sample", "SMK Bandar", "SMK SULAIMAN",
  "SMKBBSS", "SMK SETAPAK INDAH", "Asia Pacific School", "Little Caliph"
];

const GRADES = ["S1", "S2", "S3", "S4", "S5", "S6", "F1", "F2", "F3", "F4", "F5", "CP", "-"];
const STATUSES = ["active", "active", "active", "active", "pending", "trial", "inactive"];
const MODES = [["NORMAL"], ["1 TO 1"], ["NORMAL", "1 TO 1"], ["BOARD"], ["NORMAL"]];
const SUBJECT_CODES = ["MMF4", "S1F4", "K2F4", "B2F5", "F2F5", "AMDF4", "BMF4", "BIF4"];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(startYear, endYear) {
  const y = startYear + Math.floor(Math.random() * (endYear - startYear + 1));
  const m = String(1 + Math.floor(Math.random() * 12)).padStart(2, "0");
  const d = String(1 + Math.floor(Math.random() * 28)).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function phone() {
  return "01" + String(Math.floor(Math.random() * 90000000) + 10000000);
}

function generateStudents(count) {
  const students = [];
  for (let i = 1; i <= count; i++) {
    const seq = String(i).padStart(6, "0");
    const studentId = `SB27${seq}`;

    const firstName = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);
    const name = `${firstName} ${lastName}`;

    students.push({
      studentid: studentId,
      name,
      full_name: name,
      parentname: `${lastName} Parent`,
      studentphone: Math.random() > 0.2 ? phone() : null,
      parentphone: Math.random() > 0.3 ? phone() : null,
      email: Math.random() > 0.2 ? `stu${i}.${firstName.toLowerCase()}@example.com` : null,
      school: pick(SCHOOLS),
      grade: pick(GRADES),
      status: pick(STATUSES),
      classinid: Math.random() > 0.6 ? `classin${i}@example.com` : null,
      registereddate: randomDate(2023, 2026),
      modes: pick(MODES),
      dlp: Math.random() > 0.5 ? "DLP" : "non-DLP",
      ticketid: Math.random() > 0.9 ? `TKT-2025-${String(i).padStart(3, "0")}` : null,
      icnumber: Math.random() > 0.8 ? String(900000000000 + i).slice(0, 12) : null,
      recurringpayment: Math.random() > 0.5,
      recurringpaymentdate: Math.random() > 0.5 ? randomDate(2025, 2026) : null,
    });
  }
  return students;
}

async function main() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const BATCH = 50;
  const TOTAL = 300;
  const students = generateStudents(TOTAL);

  console.log(`Seeding ${TOTAL} students in batches of ${BATCH}...`);

  for (let i = 0; i < students.length; i += BATCH) {
    const batch = students.slice(i, i + BATCH);
    const { error } = await supabase.from("students").upsert(batch, { onConflict: "studentid" });
    if (error) {
      console.error("Batch error:", error);
      process.exit(1);
    }
    console.log(`  ✓ ${i + 1}-${Math.min(i + BATCH, TOTAL)} / ${TOTAL}`);
  }

  // Enroll some students in subjects
  const { data: ids } = await supabase.from("students").select("id, studentid").in("studentid", students.slice(0, 150).map((s) => s.studentid));
  if (ids && ids.length > 0) {
    const enrollments = [];
    for (const s of ids) {
      const numSubjects = 1 + Math.floor(Math.random() * 3);
      const chosen = new Set();
      while (chosen.size < numSubjects) chosen.add(pick(SUBJECT_CODES));
      for (const code of chosen) {
        enrollments.push({ studentid: s.id, subjectcode: code });
      }
    }
    await supabase.from("student_subjects").upsert(enrollments, { onConflict: "studentid,subjectcode" });
    console.log(`  ✓ Enrolled ${ids.length} students in subjects`);
  }

  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
