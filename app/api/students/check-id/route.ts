import { NextResponse } from "next/server";
import { isStudentIdTaken } from "@/server/queries/students";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId")?.trim();
    const excludeId = searchParams.get("excludeId")?.trim() || undefined;

    if (!studentId) {
      return NextResponse.json({ taken: false });
    }

    const taken = await isStudentIdTaken(studentId, excludeId);
    return NextResponse.json({ taken });
  } catch {
    return NextResponse.json({ taken: false });
  }
}
