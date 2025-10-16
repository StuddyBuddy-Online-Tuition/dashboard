import { NextResponse } from "next/server";
import { updateUser } from "@/server/queries/users";

export async function PATCH(
  request: Request,
  context: { params?: { id?: string } }
) {
  try {
    const payload = (await request.json()) as { id?: string; name: string; email: string; role: "admin" | "staff" };
    const routeId = context?.params?.id ?? "";
    const bodyId = payload?.id ?? "";
    const id = routeId || bodyId;
    if (!id || (bodyId && bodyId !== routeId)) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }
    const updated = await updateUser({ id, name: payload.name, email: payload.email, role: payload.role });
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}


