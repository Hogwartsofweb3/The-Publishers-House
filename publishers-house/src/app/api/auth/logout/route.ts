import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/sessionCookie";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const res = NextResponse.json({ ok: true });
  const host = req.headers.get("host") || "";
  const isApexOrSub = host.includes("thepublishershouse.org");
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    domain: isApexOrSub ? ".thepublishershouse.org" : undefined,
    maxAge: 0,
  });
  return res;
}
