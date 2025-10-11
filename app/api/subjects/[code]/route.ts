import { NextResponse } from "next/server"
import { getSingleSubjectDetail, updateSubjectByCode } from "@/server/queries/subjects"

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

    const payload = {
      name: String(body?.name ?? ""),
      standard: String(body?.standard ?? ""),
      type: String(body?.type ?? ""),
      subject: String(body?.subject ?? ""),
    }

    const updated = await updateSubjectByCode(code, payload)
    return NextResponse.json(updated)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}



