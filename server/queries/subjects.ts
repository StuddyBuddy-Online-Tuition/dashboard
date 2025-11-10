"use server";

import "server-only";
import type { Subject } from "@/types/subject";
import { getSupabaseServerClient } from "@/server/supabase/client";
import type { DbSubject, DbStudent, DbStudentSubject } from "@/types/db";
import type { Student, StudentMode } from "@/types/student";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function assertAuthenticated(): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }
}

export async function getAllSubjects(): Promise<Subject[]> {
  await assertAuthenticated();
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("subjects")
    .select("code, name, standard, type, subject")
    .order("code", { ascending: true });

  if (error) throw error;
  const rows = (data as DbSubject[] | null) ?? [];
  return rows.map((r) => ({ ...r, standard: (r.standard ?? "").toLowerCase() }));
}

export async function createSubject(
  input: Pick<Subject, "code" | "name" | "standard" | "type" | "subject">
): Promise<Subject> {
  await assertAuthenticated();
  const supabase = getSupabaseServerClient();
  const payload = {
    code: input.code,
    name: input.name,
    standard: (input.standard ?? "").toLowerCase(),
    type: input.type,
    subject: input.subject,
  } as const;

  const { data, error } = await supabase
    .from("subjects")
    .insert(payload)
    .select("code, name, standard, type, subject")
    .single();

  if (error) throw error;
  if (!data) throw new Error("Failed to create subject");
  const row = data as DbSubject;
  return {
    code: row.code,
    name: row.name,
    standard: (row.standard ?? "").toLowerCase(),
    type: row.type,
    subject: row.subject,
  };
}

export async function getSingleSubjectDetail(code: string): Promise<{ subject: Subject | null; enrolledStudents: Student[] }> {
  await assertAuthenticated();
  const supabase = getSupabaseServerClient();

  // Fetch subject
  const { data: subjectRow, error: subjErr } = await supabase
    .from("subjects")
    .select("code, name, standard, type, subject")
    .eq("code", code)
    .maybeSingle();
  if (subjErr) throw subjErr;

  const subject: Subject | null = subjectRow
    ? ({
        code: (subjectRow as DbSubject).code,
        name: (subjectRow as DbSubject).name,
        standard: ((subjectRow as DbSubject).standard ?? "").toLowerCase(),
        type: (subjectRow as DbSubject).type,
        subject: (subjectRow as DbSubject).subject,
      } as Subject)
    : null;

  if (!subject) {
    return { subject: null, enrolledStudents: [] };
  }

  // Fetch students enrolled in this subject using inner join on student_subjects
  const { data: joined, error: joinErr } = await supabase
    .from("students")
    .select("id, studentid, name, parentname, studentphone, parentphone, email, school, grade, status, classinid, registereddate, modes, dlp, full_name, ticketid, student_subjects!inner(subjectcode)")
    .eq("student_subjects.subjectcode", code);
  if (joinErr) throw joinErr;

  const enrolledStudents: Student[] = ((joined as DbStudent[] | null) ?? []).map((row) => ({
    id: row.id,
    studentId: row.studentid,
    name: row.name,
    fullName: row.full_name ?? null,
    parentName: row.parentname ?? "",
    studentPhone: row.studentphone ?? "",
    parentPhone: row.parentphone ?? "",
    email: row.email ?? "",
    school: row.school ?? "",
    grade: row.grade ?? "",
    subjects: [],
    status: row.status as Student["status"],
    classInId: row.classinid,
    registeredDate: row.registereddate ?? "",
    modes: (row.modes ?? []) as StudentMode[],
    dlp: (row.dlp?.toUpperCase() === "DLP" ? "DLP" : "non-DLP") as Student["dlp"],
    ticketId: row.ticketid ?? null,
  }));

  return { subject, enrolledStudents };
}

export async function getSubjectEnrollmentCount(code: string): Promise<number> {
  await assertAuthenticated();
  const supabase = getSupabaseServerClient();
  const { count, error } = await supabase
    .from("student_subjects")
    .select("studentid", { count: "exact", head: true })
    .eq("subjectcode", code);

  if (error) throw error;
  return count ?? 0;
}

type DeleteSubjectError = Error & { code?: string; enrolledCount?: number };

export async function deleteSubjectByCode(code: string): Promise<void> {
  await assertAuthenticated();
  const supabase = getSupabaseServerClient();

  const enrolledCount = await getSubjectEnrollmentCount(code);
  if (enrolledCount > 0) {
    const err = new Error("Subject has enrolled students. Remove them before deleting.") as DeleteSubjectError;
    err.code = "SUBJECT_HAS_ENROLLED_STUDENTS";
    err.enrolledCount = enrolledCount;
    throw err;
  }

  const { error } = await supabase.from("subjects").delete().eq("code", code);
  if (error) throw error;
}

export async function updateSubjectByCode(
  code: string,
  updates: Pick<Subject, "name" | "standard" | "type" | "subject">
): Promise<Subject> {
  await assertAuthenticated();
  const supabase = getSupabaseServerClient();
  const payload = {
    name: updates.name,
    standard: (updates.standard ?? "").toLowerCase(),
    type: updates.type,
    subject: updates.subject,
  } as const;

  const { data, error } = await supabase
    .from("subjects")
    .update(payload)
    .eq("code", code)
    .select("code, name, standard, type, subject")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Subject not found");
  const row = data as DbSubject;
  return { code: row.code, name: row.name, standard: (row.standard ?? "").toLowerCase(), type: row.type, subject: row.subject };
}
