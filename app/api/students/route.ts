import { NextResponse } from "next/server";
import { createStudent } from "@/server/queries/students";
import type { Student } from "@/types/student";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Student;
    if (!payload || !payload.studentId || !payload.name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const created = await createStudent(payload);
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}


