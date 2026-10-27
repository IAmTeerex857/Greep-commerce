import { NextResponse } from "next/server";

// Stub endpoint. Swap the console.log for your CRM, database or email tool.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const role = body?.role === "seller" ? "seller" : "buyer";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  console.log("[waitlist]", { email, role, at: new Date().toISOString() });
  return NextResponse.json({ ok: true });
}
