import { NextResponse } from "next/server";
import { getTimeslotsForStudent } from "@/server/queries/timeslots";

export async function GET(
  _request: Request,
  context: { params: Promise<{ studentId?: string }> }
) {
  try {
    const { studentId } = await context.params;
    if (!studentId) {
      return NextResponse.json({ error: "Invalid student id" }, { status: 400 });
    }
    const slots = await getTimeslotsForStudent(studentId);
    return NextResponse.json(slots);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}



