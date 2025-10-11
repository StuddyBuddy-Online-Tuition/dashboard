import { NextResponse } from "next/server"
import { getAvailableStudentsForSubject } from "@/server/queries/students"

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

    const page = Number(url.searchParams.get("page") ?? "1")
    const pageSize = Number(url.searchParams.get("pageSize") ?? "10")
    const keyword = url.searchParams.get("keyword") ?? ""

    const { students, totalCount } = await getAvailableStudentsForSubject({
      subjectCode: code,
      page,
      pageSize,
      keyword,
    })
    return NextResponse.json({ students, totalCount, page, pageSize })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


