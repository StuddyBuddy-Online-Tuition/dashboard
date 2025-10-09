"use server";

import "server-only";
import type { Student, StudentMode } from "@/types/student";
import { STATUSES } from "@/types/student";
import { getSupabaseServerClient } from "@/server/supabase/client";
import type { DbStudent } from "@/types/db";

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

export async function getAllStudents(
  opts?: { page?: number; pageSize?: number; status?: Student["status"] | Student["status"][] }
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

  const { data, count, error } = await query.order("createdat", { ascending: false }).range(start, end);

  if (error) throw error;
  return { students: (data ?? []).map(mapDbStudentToStudent), totalCount: count ?? 0 };
}


