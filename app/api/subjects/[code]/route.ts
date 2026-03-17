import { NextResponse } from "next/server"
import { deleteSubjectByCode, getSingleSubjectDetail, updateSubjectByCode } from "@/server/queries/subjects"
import { cleanSubjectName } from "@/lib/utils"

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
    const result = await getSingleSubjectDetail(code)
    if (!result.subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 })
    }
    return NextResponse.json(result)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(req: Request) {
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

    const body = await req.json()
    if (body?.code && body.code !== code) {
      return NextResponse.json({ error: "Changing subject code is not allowed" }, { status: 400 })
    }

    const name = String(body?.name ?? "").trim()
    const subjectValue = cleanSubjectName(String(body?.subject ?? "").trim() || name)

    const payload = {
      name,
      standard: String(body?.standard ?? ""),
      type: String(body?.type ?? ""),
      subject: subjectValue,
    }

    const updated = await updateSubjectByCode(code, payload)
    return NextResponse.json(updated)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
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

    await deleteSubjectByCode(code)
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    if (err && typeof err === "object") {
      const code = (err as { code?: string }).code
      if (code === "SUBJECT_HAS_ENROLLED_STUDENTS") {
        const enrolledCount = (err as { enrolledCount?: number }).enrolledCount ?? 0
        const message = err instanceof Error ? err.message : "Subject has enrolled students"
        return NextResponse.json({ error: message, enrolledCount }, { status: 409 })
      }
    }
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}



