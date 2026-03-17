/**
 * Seed script - inserts sample students, enrollments, and timeslots.
 * Run: node scripts/seed.mjs
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env
 * Note: Run migrations first. For admin user, use scripts/create-user.mjs or dev bypass.
 */
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { db: { schema: "public" } }
);

const STUDENT_IDS = {
  ahmad: "a1111111-1111-1111-1111-111111111101",
  siti: "a1111111-1111-1111-1111-111111111102",
  farhan: "a1111111-1111-1111-1111-111111111103",
  nurul: "a1111111-1111-1111-1111-111111111104",
  lee: "a1111111-1111-1111-1111-111111111105",
};

async function seedStudents() {
  const { error } = await supabase.from("students").upsert(
    [
      {
        id: STUDENT_IDS.ahmad,
        studentid: "STU001",
        name: "Ahmad bin Abdullah",
        full_name: "Ahmad bin Abdullah",
        parentname: "Abdullah Rahman",
        studentphone: "0123456789",
        parentphone: "0198765432",
        email: "ahmad@example.com",
        school: "SMK Example",
        grade: "F4",
        status: "active",
        registereddate: "2024-01-15",
        modes: ["NORMAL", "1 TO 1"],
        dlp: "DLP",
        recurringpayment: true,
        recurringpaymentdate: "2025-01-15",
      },
      {
        id: STUDENT_IDS.siti,
        studentid: "STU002",
        name: "Siti Nurhaliza",
        full_name: "Siti Nurhaliza",
        parentname: "Haliza Ibrahim",
        studentphone: "0123456788",
        parentphone: "0198765433",
        email: "siti@example.com",
        school: "SMK Demo",
        grade: "F5",
        status: "pending",
        registereddate: "2025-02-01",
        modes: ["NORMAL"],
        dlp: "non-DLP",
        ticketid: "TKT-2025-001",
      },
      {
        id: STUDENT_IDS.farhan,
        studentid: "STU003",
        name: "Muhammad Farhan",
        full_name: "Muhammad Farhan",
        parentname: "Farhan Osman",
        studentphone: "0123456787",
        parentphone: "0198765434",
        email: "farhan@example.com",
        school: "SMK Sample",
        grade: "F3",
        status: "trial",
        registereddate: "2025-02-10",
        modes: ["1 TO 1"],
        dlp: "DLP",
        ticketid: "TKT-2025-002",
        icnumber: "030101010101",
      },
      {
        id: STUDENT_IDS.nurul,
        studentid: "STU004",
        name: "Nurul Izzati",
        full_name: "Nurul Izzati",
        parentname: "Izzati Ahmad",
        studentphone: "0123456786",
        email: "nurul@example.com",
        school: "SMK Test",
        grade: "S5",
        status: "inactive",
        registereddate: "2023-06-01",
        modes: ["NORMAL"],
        dlp: "non-DLP",
      },
      {
        id: STUDENT_IDS.lee,
        studentid: "STU005",
        name: "Lee Wei Ming",
        full_name: "Lee Wei Ming",
        parentname: "Lee Cheng Ho",
        studentphone: "0161234567",
        parentphone: "0169876543",
        email: "weiming@example.com",
        school: "SMK Bandar",
        grade: "F5",
        status: "active",
        registereddate: "2024-03-20",
        modes: ["NORMAL"],
        dlp: "DLP",
        recurringpayment: true,
        recurringpaymentdate: "2025-03-20",
      },
    ],
    { onConflict: "id" }
  );
  if (error) throw error;
  console.log("✓ Students seeded (5)");
}

async function seedStudentSubjects() {
  const rows = [
    { studentid: STUDENT_IDS.ahmad, subjectcode: "K2F4" },
    { studentid: STUDENT_IDS.ahmad, subjectcode: "AMDF4" },
    { studentid: STUDENT_IDS.siti, subjectcode: "B2F5" },
    { studentid: STUDENT_IDS.siti, subjectcode: "F2F5" },
    { studentid: STUDENT_IDS.farhan, subjectcode: "MMDF3" },
    { studentid: STUDENT_IDS.farhan, subjectcode: "S2F3" },
    { studentid: STUDENT_IDS.nurul, subjectcode: "SEJF5" },
    { studentid: STUDENT_IDS.lee, subjectcode: "AMDF5" },
    { studentid: STUDENT_IDS.lee, subjectcode: "F2F5" },
    { studentid: STUDENT_IDS.lee, subjectcode: "K2F5" },
  ];
  const { error } = await supabase.from("student_subjects").upsert(rows, {
    onConflict: "studentid,subjectcode",
  });
  if (error) throw error;
  console.log("✓ Student enrollments seeded (10)");
}

async function seedTimeslots() {
  const rows = [
    { subjectcode: "K2F4", day: "Monday", starttime: "14:00", endtime: "15:30", teachername: "Cikgu Aminah" },
    { subjectcode: "K2F4", day: "Wednesday", starttime: "14:00", endtime: "15:30", teachername: "Cikgu Aminah" },
    { subjectcode: "AMDF4", day: "Tuesday", starttime: "15:00", endtime: "16:30", teachername: "Mr Tan" },
    { subjectcode: "AMDF4", day: "Thursday", starttime: "15:00", endtime: "16:30", teachername: "Mr Tan" },
    { subjectcode: "B2F5", day: "Friday", starttime: "10:00", endtime: "11:30", teachername: "Dr Siti" },
    {
      subjectcode: "K2F4",
      day: "Monday",
      starttime: "14:00",
      endtime: "15:30",
      teachername: "Cikgu Aminah",
      studentid: STUDENT_IDS.ahmad,
      studentname: "Ahmad bin Abdullah",
    },
  ];
  const { error } = await supabase.from("timeslots").insert(rows);
  if (error) throw error;
  console.log("✓ Timeslots seeded (6)");
}

async function seedSortVerification() {
  const verification = [
    {
      id: "b2222222-2222-2222-2222-222222222201",
      studentid: "SB250235",
      name: "Isabel Fonte Arasu",
      full_name: "Isabel Fonte Arasu",
      school: "Asia Pacific School",
      grade: "S6",
      status: "active",
      classinid: "balan1983a@gmail.com",
      registereddate: "2025-06-15",
      modes: ["1 TO 1"],
      dlp: "DLP",
    },
    {
      id: "b2222222-2222-2222-2222-222222222202",
      studentid: "SB250234",
      name: "Afrina Juita",
      full_name: "Afrina Juita",
      school: "Little Caliph",
      grade: "S1",
      status: "active",
      classinid: "+60 192809578",
      registereddate: "2025-05-10",
      modes: ["1 TO 1"],
      dlp: "non-DLP",
    },
    {
      id: "b2222222-2222-2222-2222-222222222203",
      studentid: "SB260159",
      name: "Ahmad Wazhif",
      full_name: "Ahmad Wazhif",
      studentphone: "0193122336",
      school: "SMK SULAIMAN",
      grade: "F2",
      status: "active",
      classinid: "PENDING CLASSIN",
      registereddate: "2026-02-15",
      modes: ["NORMAL"],
      dlp: "non-DLP",
    },
  ];
  const { error } = await supabase.from("students").upsert(verification, { onConflict: "studentid" });
  if (error) throw error;

  const enrollments = [
    { studentid: "b2222222-2222-2222-2222-222222222201", subjectcode: "BMS6 1:1" },
    { studentid: "b2222222-2222-2222-2222-222222222202", subjectcode: "MMS1 1:1" },
    { studentid: "b2222222-2222-2222-2222-222222222203", subjectcode: "MMF2" },
    { studentid: "b2222222-2222-2222-2222-222222222203", subjectcode: "S1F2" },
  ];
  await supabase.from("student_subjects").upsert(enrollments, { onConflict: "studentid,subjectcode" });
  console.log("✓ Sort verification students seeded (Isabel, Afrina, Ahmad)");
}

async function main() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
    process.exit(1);
  }
  console.log("Seeding database...");
  await seedStudents();
  await seedStudentSubjects();
  await seedTimeslots();
  await seedSortVerification();
  console.log("Done. Create admin user with: node scripts/create-user.mjs");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
