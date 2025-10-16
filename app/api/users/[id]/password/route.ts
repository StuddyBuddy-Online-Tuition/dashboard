import { NextResponse } from "next/server";
import { updateUserPassword } from "@/server/queries/users";

export async function PATCH(
  request: Request,
  context: { params?: { id?: string } }
) {
  try {
    const payload = (await request.json()) as { id?: string; password?: string };
    const routeId = context?.params?.id ?? "";
    const bodyId = payload?.id ?? "";
    const id = routeId || bodyId;
    const password = String(payload?.password ?? "");
    if (!id || (bodyId && bodyId !== routeId) || password.length < 8) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    await updateUserPassword({ id, password });
    return new NextResponse(null, { status: 204 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}


