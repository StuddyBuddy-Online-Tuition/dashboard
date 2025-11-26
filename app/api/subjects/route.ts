import { NextResponse } from "next/server";
import { createSubject } from "@/server/queries/subjects";
import { cleanSubjectName } from "@/lib/utils";

export async function POST(req: Request) {
  let code = "";
  try {
    const body = await req.json();
    code = String(body?.code ?? "").trim();
    const name = String(body?.name ?? "").trim();
    const standard = String(body?.standard ?? "").trim();
    const type = String(body?.type ?? "").trim();
    const subject = cleanSubjectName(String(body?.subject ?? "").trim() || name);

    if (!code || !name || !standard || !type || !subject) {
      return NextResponse.json({ error: "Missing required subject fields" }, { status: 400 });
    }

    const created = await createSubject({ code, name, standard, type, subject });
    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    const errorString = String(errorMessage);
    
    // Check for duplicate code error (unique constraint violation)
    // Supabase/Postgres returns error code 23505 or messages containing "duplicate key" or constraint name
    const isDuplicateCode = 
      /duplicate key|subjects_code_key|23505/i.test(errorString) ||
      (err && typeof err === "object" && "code" in err && err.code === "23505");
    
    if (isDuplicateCode) {
      const codeDisplay = code || "this code";
      return NextResponse.json(
        { error: `Subject code "${codeDisplay}" is already taken. Please use a different code.` },
        { status: 409 }
      );
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}


