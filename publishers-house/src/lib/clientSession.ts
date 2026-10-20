import type { User } from "firebase/auth";

export async function establishSession(user: User): Promise<{ role: string; email: string }> {
  const idToken = await user.getIdToken(true);
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof body.error === "string" ? body.error : "Could not start a secure session.");
  }
  return {
    role: typeof body.role === "string" ? body.role : "member",
    email: typeof body.email === "string" ? body.email : (user.email || ""),
  };
}

export async function clearSession() {
  await fetch("/api/auth/logout", { method: "POST" });
}
