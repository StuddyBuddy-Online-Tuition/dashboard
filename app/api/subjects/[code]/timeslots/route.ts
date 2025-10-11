import { NextResponse } from "next/server"
import { getTimeslotsForSubject } from "@/server/queries/timeslots"

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
    const slots = await getTimeslotsForSubject(code)
    return NextResponse.json({ timeslots: slots })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}



