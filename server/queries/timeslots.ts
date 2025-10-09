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


