"use server";

import "server-only";
import type { Subject } from "@/types/subject";
import { getSupabaseServerClient } from "@/server/supabase/client";
import type { DbSubject } from "@/types/db";

export async function getAllSubjects(): Promise<Subject[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("subjects")
    .select("code, name, standard, type, subject")
    .order("code", { ascending: true });

  if (error) throw error;
  const rows = (data as DbSubject[] | null) ?? [];
  return rows.map((r) => ({ ...r, standard: (r.standard ?? "").toLowerCase() }));
}


