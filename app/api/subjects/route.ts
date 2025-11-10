import { NextResponse } from "next/server";
import { createSubject } from "@/server/queries/subjects";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const code = String(body?.code ?? "").trim();
    const name = String(body?.name ?? "").trim();
    const standard = String(body?.standard ?? "").trim();
    const type = String(body?.type ?? "").trim();
    const subject = String(body?.subject ?? "").trim() || name;

    if (!code || !name || !standard || !type || !subject) {
      return NextResponse.json({ error: "Missing required subject fields" }, { status: 400 });
    }

    const created = await createSubject({ code, name, standard, type, subject });
    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


