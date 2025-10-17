import { NextResponse } from "next/server"
import { addManyStudentSubjects } from "@/server/queries/student-subjects"

export async function POST(req: Request) {
  try {
    const url = new URL(req.url)
    const parts = url.pathname.split("/").filter(Boolean)
    const idx = parts.findIndex((p) => p === "subjects")
    const raw = idx !== -1 && parts[idx + 1] ? parts[idx + 1] : ""
    let code = raw
    try {
      code = decodeURIComponent(raw)
    } catch {
      code = raw
    }
    code = code.replace(/\+/g, " ")
    if (!code) return NextResponse.json({ error: "Missing subject code" }, { status: 400 })

    const body = await req.json()
    const studentIds = Array.isArray(body?.studentIds) ? (body.studentIds as string[]) : []
    if (studentIds.length === 0) return NextResponse.json({ error: "studentIds required" }, { status: 400 })

    const added = await addManyStudentSubjects(studentIds, code)
    return NextResponse.json({ addedCount: added })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


