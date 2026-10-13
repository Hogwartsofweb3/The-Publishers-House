import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { canAccessPortal, portalHomeFor, requirePortalUser } from "@/lib/serverAuth";
import PortalShell from "../PortalShell";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function PortalProtectedLayout({ children }: { children: React.ReactNode }) {
  const pathname = (await headers()).get("x-pathname") || "";
  const user = await requirePortalUser();
  if (!user) redirect("/portal/login");
  if (pathname && !canAccessPortal(pathname, user.role)) redirect(portalHomeFor(user.role));

  return <PortalShell user={user}>{children}</PortalShell>;
}
