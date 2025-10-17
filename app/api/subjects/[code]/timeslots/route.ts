import { NextResponse } from "next/server"
import { getTimeslotsForSubject, replaceTimeslotsForSubject } from "@/server/queries/timeslots"

export async function GET(req: Request) {
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
    if (!code) {
      return NextResponse.json({ error: "Missing subject code" }, { status: 400 })
    }
    const slots = await getTimeslotsForSubject(code)
    return NextResponse.json({ timeslots: slots })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

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
    const mode = body?.mode === "oneToOne" ? "oneToOne" : "normal"
    const timeslots = Array.isArray(body?.timeslots) ? body.timeslots : []
    if (timeslots.length === 0) return NextResponse.json({ timeslots: [] })

    const normalized = timeslots.map((s: any) => ({
      day: String(s.day),
      startTime: String(s.startTime),
      endTime: String(s.endTime),
      teacherName: String(s.teacherName ?? ""),
      studentId: s.studentId ?? null,
      studentName: s.studentName ?? null,
    }))

    const saved = await replaceTimeslotsForSubject(code, normalized, mode)
    return NextResponse.json({ timeslots: saved })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}



