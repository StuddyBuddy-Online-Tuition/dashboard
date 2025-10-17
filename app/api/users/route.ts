import { NextResponse } from "next/server";
import { createUser } from "@/server/queries/users";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { name: string; email: string; role: "admin" | "staff"; password: string };
    if (!payload || !payload.name || !payload.email || !payload.password || payload.password.length < 8) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const created = await createUser(payload);
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    const message = err?.message ?? "Unknown error";
    // Optionally detect unique email errors and return 409
    const status = /duplicate key|users_email_key/i.test(String(message)) ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}


