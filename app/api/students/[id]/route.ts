import { NextResponse } from "next/server"
import { updateStudent } from "@/server/queries/students"
import type { Student } from "@/types/student"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const payload = (await request.json()) as Student
    if (!payload || !payload.id || payload.id !== params.id) {
      return NextResponse.json({ error: "Invalid student id" }, { status: 400 })
    }
    const updated = await updateStudent(payload)
    return NextResponse.json(updated)
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 })
  }
}


