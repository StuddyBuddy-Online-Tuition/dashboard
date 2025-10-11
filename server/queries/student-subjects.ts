"use server";

import "server-only";
import { getSupabaseServerClient } from "@/server/supabase/client";
import type { DbStudentSubject } from "@/types/db";

export type StudentSubject = {
  studentId: string;
  subjectCode: string;
  createdAt: string | null;
  updatedAt: string | null;
};

function mapDbToStudentSubject(row: DbStudentSubject): StudentSubject {
  return {
    studentId: row.studentid,
    subjectCode: row.subjectcode,
    createdAt: row.createdat,
    updatedAt: row.updatedat,
  };
}

export async function getAllStudentSubjects(): Promise<StudentSubject[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("student_subjects")
    .select("studentid, subjectcode, createdat, updatedat")
    .order("createdat", { ascending: false });

  if (error) throw error;
  return ((data as DbStudentSubject[] | null) ?? []).map(mapDbToStudentSubject);
}

export async function getSubjectsForStudent(studentId: string): Promise<StudentSubject[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("student_subjects")
    .select("studentid, subjectcode, createdat, updatedat")
    .eq("studentid", studentId)
    .order("createdat", { ascending: false });

  if (error) throw error;
  return ((data as DbStudentSubject[] | null) ?? []).map(mapDbToStudentSubject);
}

export async function getStudentsForSubject(subjectCode: string): Promise<StudentSubject[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("student_subjects")
    .select("studentid, subjectcode, createdat, updatedat")
    .eq("subjectcode", subjectCode)
    .order("createdat", { ascending: false });

  if (error) throw error;
  return ((data as DbStudentSubject[] | null) ?? []).map(mapDbToStudentSubject);
}

export async function addStudentSubject(studentId: string, subjectCode: string): Promise<StudentSubject> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("student_subjects")
    .insert({ studentid: studentId, subjectcode: subjectCode })
    .select("studentid, subjectcode, createdat, updatedat")
    .single();

  if (error) throw error;
  return mapDbToStudentSubject(data as DbStudentSubject);
}

export async function removeStudentSubject(studentId: string, subjectCode: string): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("student_subjects")
    .delete()
    .eq("studentid", studentId)
    .eq("subjectcode", subjectCode);

  if (error) throw error;
}

export async function addManyStudentSubjects(studentIds: string[], subjectCode: string): Promise<number> {
  if (!Array.isArray(studentIds) || studentIds.length === 0) return 0;
  const supabase = getSupabaseServerClient();
  const rows = studentIds.map((id) => ({ studentid: id, subjectcode: subjectCode }));
  const { error, count } = await supabase
    .from("student_subjects")
    .insert(rows, { count: "exact" });
  if (error) throw error;
  return count ?? rows.length;
}


