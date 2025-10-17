import { NextResponse } from "next/server"
import { removeStudentSubject } from "@/server/queries/student-subjects"

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url)
    const parts = url.pathname.split("/").filter(Boolean)
    const idx = parts.findIndex((p) => p === "subjects")
    const rawCode = idx !== -1 && parts[idx + 1] ? parts[idx + 1] : ""
    const rawStudent = idx !== -1 && parts[idx + 3] ? parts[idx + 3] : ""
    let code = rawCode
    let studentId = rawStudent
    try {
      code = decodeURIComponent(rawCode)
    } catch {}
    try {
      studentId = decodeURIComponent(rawStudent)
    } catch {}
    code = code.replace(/\+/g, " ")
    if (!code || !studentId) return NextResponse.json({ error: "Missing code or studentId" }, { status: 400 })

    await removeStudentSubject(studentId, code)
    return new NextResponse(null, { status: 204 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


