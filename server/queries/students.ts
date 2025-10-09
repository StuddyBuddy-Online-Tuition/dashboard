"use server";

import "server-only";
import type { Student, StudentMode } from "@/types/student";
import { STATUSES } from "@/types/student";
import { getSupabaseServerClient } from "@/server/supabase/client";
import type { DbStudent, DbStudentSubject } from "@/types/db";

function mapDbStudentToStudent(row: DbStudent): Student {
  return {
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
  };
}

type SortField = "registeredDate" | "status" | "grade" | "dlp" | "name";
type SortOrder = "asc" | "desc";
type SortRule = { field: SortField; order: SortOrder };

export async function getAllStudents(
  opts?: { page?: number; pageSize?: number; status?: Student["status"] | Student["status"][]; sort?: SortRule[]; keyword?: string }
): Promise<{ students: Student[]; totalCount: number }> {
  const pageUnsafe = opts?.page ?? 1;
  const pageSizeUnsafe = opts?.pageSize ?? 10;
  const page = Number.isFinite(pageUnsafe) && pageUnsafe > 0 ? Math.floor(pageUnsafe) : 1;
  const pageSizeBase = Number.isFinite(pageSizeUnsafe) && pageSizeUnsafe > 0 ? Math.floor(pageSizeUnsafe) : 10;
  const pageSize = Math.min(pageSizeBase, 100);

  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const supabase = getSupabaseServerClient();
  let query = supabase
    .from("students")
    .select(
      "id, studentid, name, parentname, studentphone, parentphone, email, school, grade, status, classinid, registereddate, modes, dlp, full_name",
      { count: "exact" }
    );

  const rawStatus = opts?.status;
  const normalizedStatuses: Student["status"][] | undefined = Array.isArray(rawStatus)
    ? (rawStatus
        .map((s) => (typeof s === "string" ? (s.toLowerCase() as Student["status"]) : s))
        .filter((s): s is Student["status"] => (STATUSES as readonly string[]).includes(s)) as Student["status"][])
    : (typeof rawStatus === "string"
        ? ((() => {
            const s = rawStatus.toLowerCase() as Student["status"];
            return (STATUSES as readonly string[]).includes(s) ? ([s] as Student["status"][]) : undefined;
          })())
        : undefined);

  if (normalizedStatuses && normalizedStatuses.length > 0) {
    query = query.in("status", normalizedStatuses);
  }

  // Keyword filter across multiple columns
  const rawKeyword = (opts?.keyword ?? "").trim();
  if (rawKeyword) {
    // Supabase OR syntax uses commas as separators; avoid breaking when keyword contains commas
    const safe = rawKeyword.replace(/[,]/g, " ");
    const pattern = `%${safe}%`;
    query = query.or(
      [
        `name.ilike.${pattern}`,
        `email.ilike.${pattern}`,
        `parentname.ilike.${pattern}`,
        `studentphone.ilike.${pattern}`,
        `parentphone.ilike.${pattern}`,
        `school.ilike.${pattern}`,
        `classinid.ilike.${pattern}`,
        `full_name.ilike.${pattern}`,
      ].join(",")
    );
  }

  // Apply sorting rules if provided; fall back to createdat desc
  const colMap: Record<SortField, string> = {
    registeredDate: "registereddate",
    status: "status",
    grade: "grade",
    dlp: "dlp",
    name: "name",
  };

  const sortRules = (opts?.sort ?? []).filter(
    (r): r is SortRule => !!r && r.field in colMap && (r.order === "asc" || r.order === "desc")
  );

  if (sortRules.length > 0) {
    for (const rule of sortRules) {
      query = query.order(colMap[rule.field], { ascending: rule.order === "asc" });
    }
  } else {
    query = query.order("createdat", { ascending: false });
  }

  const { data, count, error } = await query.range(start, end);

  if (error) throw error;
  const baseStudents = ((data as DbStudent[] | null) ?? []).map(mapDbStudentToStudent);

  // Populate subjects for the current page of students using a single bulk query
  if (baseStudents.length > 0) {
    const studentIds = baseStudents.map((s) => s.id);
    const supabase2 = getSupabaseServerClient();
    const { data: subjData, error: subjError } = await supabase2
      .from("student_subjects")
      .select("studentid, subjectcode")
      .in("studentid", studentIds);
    if (subjError) throw subjError;
    const byStudentId = new Map<string, string[]>();
    for (const row of (subjData as DbStudentSubject[] | null) ?? []) {
      const arr = byStudentId.get(row.studentid) ?? [];
      arr.push(row.subjectcode);
      byStudentId.set(row.studentid, arr);
    }
    for (const s of baseStudents) {
      s.subjects = byStudentId.get(s.id) ?? [];
    }
  }

  return { students: baseStudents, totalCount: count ?? 0 };
}


export async function createStudent(input: Student): Promise<Student> {
  const supabase = getSupabaseServerClient();

  const status = (input.status?.toLowerCase() as Student["status"]) ?? "pending";
  if (!(STATUSES as readonly string[]).includes(status)) {
    throw new Error("Invalid status");
  }
  const dlp = input.dlp === "DLP" ? "DLP" : "non-DLP";
  const modes = (Array.isArray(input.modes) ? input.modes : []) as StudentMode[];

  const { data: insertedRow, error: insertError } = await supabase
    .from("students")
    .insert({
      studentid: input.studentId,
      name: input.name,
      full_name: input.fullName ?? null,
      parentname: input.parentName,
      studentphone: input.studentPhone,
      parentphone: input.parentPhone,
      email: input.email,
      school: input.school,
      grade: input.grade,
      status,
      classinid: input.classInId,
      registereddate: input.registeredDate,
      modes,
      dlp,
    })
    .select(
      "id, studentid, name, parentname, studentphone, parentphone, email, school, grade, status, classinid, registereddate, modes, dlp, full_name"
    )
    .single();

  if (insertError) throw insertError;
  const created = mapDbStudentToStudent(insertedRow as DbStudent);

  const subjects = input.subjects ?? [];
  if (subjects.length > 0) {
    const rows = subjects.map((code) => ({ studentid: created.id, subjectcode: code }));
    const { error: subjErr } = await supabase.from("student_subjects").insert(rows);
    if (subjErr) throw subjErr;
    created.subjects = [...subjects];
  }

  return created;
}


export async function updateStudent(input: Student): Promise<Student> {
  const supabase = getSupabaseServerClient();

  // Validate enums minimally
  const status = (input.status?.toLowerCase() as Student["status"]) ?? "pending";
  if (!(STATUSES as readonly string[]).includes(status)) {
    throw new Error("Invalid status");
  }
  const dlp = input.dlp === "DLP" ? "DLP" : "non-DLP";
  const modes = (Array.isArray(input.modes) ? input.modes : []) as StudentMode[];

  // Update student record
  const { data: updatedRow, error: updateError } = await supabase
    .from("students")
    .update({
      studentid: input.studentId,
      name: input.name,
      full_name: input.fullName ?? null,
      parentname: input.parentName,
      studentphone: input.studentPhone,
      parentphone: input.parentPhone,
      email: input.email,
      school: input.school,
      grade: input.grade,
      status,
      classinid: input.classInId,
      registereddate: input.registeredDate,
      modes,
      dlp,
    })
    .eq("id", input.id)
    .select(
      "id, studentid, name, parentname, studentphone, parentphone, email, school, grade, status, classinid, registereddate, modes, dlp, full_name"
    )
    .single();

  if (updateError) throw updateError;
  const updatedStudent = mapDbStudentToStudent(updatedRow as DbStudent);

  // Sync subjects: fetch existing, compute diffs, apply
  const { data: existingRows, error: existingErr } = await supabase
    .from("student_subjects")
    .select("studentid, subjectcode")
    .eq("studentid", input.id);
  if (existingErr) throw existingErr;
  const existing = new Set(((existingRows as DbStudentSubject[] | null) ?? []).map((r) => r.subjectcode));
  const desired = new Set(input.subjects ?? []);

  const toAdd: string[] = [];
  const toRemove: string[] = [];
  for (const code of desired) if (!existing.has(code)) toAdd.push(code);
  for (const code of existing) if (!desired.has(code)) toRemove.push(code);

  if (toAdd.length > 0) {
    const rows = toAdd.map((code) => ({ studentid: input.id, subjectcode: code }));
    const { error: addErr } = await supabase.from("student_subjects").insert(rows);
    if (addErr) throw addErr;
  }

  if (toRemove.length > 0) {
    const { error: delErr } = await supabase
      .from("student_subjects")
      .delete()
      .eq("studentid", input.id)
      .in("subjectcode", toRemove);
    if (delErr) throw delErr;
  }

  updatedStudent.subjects = Array.from(desired);
  return updatedStudent;
}


