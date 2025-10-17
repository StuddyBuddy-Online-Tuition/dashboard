"use server";

import "server-only";
import type { User } from "@/types/user";
import type { DbUser } from "@/types/db";
import { getSupabaseServerClient } from "@/server/supabase/client";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

function mapDbUserToUser(row: DbUser): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: (row.role as User["role"]) ?? "staff",
  };
}

async function assertAuthenticated(): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }
}

export async function getAllUsers(opts?: {
  page?: number;
  pageSize?: number;
  keyword?: string;
}): Promise<{ users: User[]; totalCount: number }> {
  await assertAuthenticated();
  const pageUnsafe = opts?.page ?? 1;
  const pageSizeUnsafe = opts?.pageSize ?? 10;
  const page = Number.isFinite(pageUnsafe) && pageUnsafe > 0 ? Math.floor(pageUnsafe) : 1;
  const pageSizeBase = Number.isFinite(pageSizeUnsafe) && pageSizeUnsafe > 0 ? Math.floor(pageSizeUnsafe) : 10;
  const pageSize = Math.min(pageSizeBase, 100);

  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const supabase = getSupabaseServerClient();
  let query = supabase
    .from("users")
    .select("id, name, email, role", { count: "exact" });

  // Keyword filter across multiple columns (mirror students convention)
  const rawKeyword = (opts?.keyword ?? "").trim();
  if (rawKeyword) {
    const safe = rawKeyword.replace(/[,]/g, " ");
    const pattern = `%${safe}%`;
    query = query.or(
      [
        `name.ilike.${pattern}`,
        `email.ilike.${pattern}`,
      ].join(",")
    );
  }

  // Default sort by createdat desc
  query = query.order("createdat", { ascending: false });

  const { data, count, error } = await query.range(start, end);
  if (error) throw error;

  const rows = (data as DbUser[] | null) ?? [];
  const users: User[] = rows.map(mapDbUserToUser);
  return { users, totalCount: count ?? 0 };
}


export async function createUser(input: { name: string; email: string; role: User["role"]; password: string }): Promise<User> {
  await assertAuthenticated();
  const supabase = getSupabaseServerClient();
  const name = (input.name ?? "").trim();
  const email = (input.email ?? "").trim();
  const role = input.role === "admin" ? "admin" : "staff";
  const password = String(input.password ?? "");
  if (!name || !email || password.length < 8) {
    throw new Error("Invalid input");
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const { data, error } = await supabase
    .from("users")
    .insert({ name, email, role, password: passwordHash })
    .select("id, name, email, role")
    .single();
  if (error) throw error;
  return mapDbUserToUser(data as DbUser);
}

export async function updateUser(input: { id: string; name: string; email: string; role: User["role"] }): Promise<User> {
  await assertAuthenticated();
  const supabase = getSupabaseServerClient();
  const id = String(input.id);
  const name = (input.name ?? "").trim();
  const email = (input.email ?? "").trim();
  const role = input.role === "admin" ? "admin" : "staff";
  if (!id || !name || !email) throw new Error("Invalid input");
  const { data, error } = await supabase
    .from("users")
    .update({ name, email, role })
    .eq("id", id)
    .select("id, name, email, role")
    .single();
  if (error) throw error;
  return mapDbUserToUser(data as DbUser);
}

export async function updateUserPassword(input: { id: string; password: string }): Promise<void> {
  await assertAuthenticated();
  const supabase = getSupabaseServerClient();
  const id = String(input.id);
  const password = String(input.password ?? "");
  if (!id || password.length < 8) throw new Error("Invalid input");
  const passwordHash = await bcrypt.hash(password, 10);
  const { error } = await supabase
    .from("users")
    .update({ password: passwordHash })
    .eq("id", id);
  if (error) throw error;
}


