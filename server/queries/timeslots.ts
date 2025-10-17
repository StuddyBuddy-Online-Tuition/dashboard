"use server";

import "server-only";
import type { Timeslot } from "@/types/timeslot";
import { getSupabaseServerClient } from "@/server/supabase/client";
import type { DbTimeslot } from "@/types/db";

function mapDbTimeslotToTimeslot(row: DbTimeslot): Timeslot {
  return {
    timeslotId: row.timeslotid,
    subjectCode: row.subjectcode,
    day: row.day,
    startTime: row.starttime,
    endTime: row.endtime,
    teacherName: row.teachername,
    studentId: row.studentid,
    studentName: row.studentname,
  };
}

export async function getAllTimeslots(): Promise<Timeslot[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("timeslots")
    .select(
      "timeslotid, subjectcode, day, starttime, endtime, teachername, studentid, studentname"
    )
    .order("createdat", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapDbTimeslotToTimeslot);
}

export async function getTimeslotsForSubject(subjectCode: string): Promise<Timeslot[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("timeslots")
    .select(
      "timeslotid, subjectcode, day, starttime, endtime, teachername, studentid, studentname"
    )
    .eq("subjectcode", subjectCode)
    .order("day", { ascending: true })
    .order("starttime", { ascending: true });

  if (error) throw error;
  return (data as DbTimeslot[] | null ?? []).map(mapDbTimeslotToTimeslot);
}

export async function getTimeslotsForStudent(studentId: string): Promise<Timeslot[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("timeslots")
    .select(
      "timeslotid, subjectcode, day, starttime, endtime, teachername, studentid, studentname"
    )
    .eq("studentid", studentId)
    .order("day", { ascending: true })
    .order("starttime", { ascending: true });

  if (error) throw error;
  return ((data as DbTimeslot[] | null) ?? []).map(mapDbTimeslotToTimeslot);
}

export async function replaceTimeslotsForSubject(
  subjectCode: string,
  slots: Array<{
    day: Timeslot["day"];
    startTime: string;
    endTime: string;
    teacherName: string;
    studentId?: string | null;
    studentName?: string | null;
  }>,
  mode: "normal" | "oneToOne"
): Promise<Timeslot[]> {
  const supabase = getSupabaseServerClient();

  // Delete existing timeslots for this subject and mode
  let del = supabase.from("timeslots").delete().eq("subjectcode", subjectCode);
  if (mode === "normal") {
    del = del.is("studentid", null);
  } else {
    del = del.not("studentid", "is", null);
  }
  const { error: delErr } = await del;
  if (delErr) throw delErr;

  if (!Array.isArray(slots) || slots.length === 0) {
    return [];
  }

  const rows = slots.map((s) => ({
    subjectcode: subjectCode,
    day: s.day,
    starttime: s.startTime,
    endtime: s.endTime,
    teachername: s.teacherName,
    studentid: s.studentId ?? null,
    studentname: s.studentName ?? null,
  }));

  const { data: inserted, error: insErr } = await supabase
    .from("timeslots")
    .insert(rows)
    .select("timeslotid, subjectcode, day, starttime, endtime, teachername, studentid, studentname");
  if (insErr) throw insErr;

  return ((inserted as DbTimeslot[] | null) ?? []).map(mapDbTimeslotToTimeslot);
}

export async function deleteTimeslotById(timeslotId: string): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("timeslots")
    .delete()
    .eq("timeslotid", timeslotId);
  if (error) throw error;
}


