import { NextResponse } from "next/server"
import { deleteTimeslotById } from "@/server/queries/timeslots"

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url)
    const parts = url.pathname.split("/").filter(Boolean)
    const idx = parts.findIndex((p) => p === "timeslots")
    const rawId = idx !== -1 && parts[idx + 1] ? parts[idx + 1] : ""
    const timeslotId = (() => { try { return decodeURIComponent(rawId) } catch { return rawId } })()
    if (!timeslotId) return NextResponse.json({ error: "Missing timeslotId" }, { status: 400 })
    await deleteTimeslotById(timeslotId)
    return new NextResponse(null, { status: 204 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


