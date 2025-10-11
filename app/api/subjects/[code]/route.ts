import { NextResponse } from "next/server"
import { getSingleSubjectDetail } from "@/server/queries/subjects"

export async function GET(
  _req: Request,
  { params }: { params: { code: string } }
) {
  try {
    const raw = params.code ?? ""
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



