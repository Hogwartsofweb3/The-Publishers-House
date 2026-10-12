import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { canAccessPortal, portalHomeFor, requirePortalUser } from "@/lib/serverAuth";
import PortalShell from "./PortalShell";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = (await headers()).get("x-pathname") || "";

  if (pathname === "/portal/login") {
    return <>{children}</>;
  }

  const user = await requirePortalUser();
  if (!user) redirect("/portal/login");
  if (!canAccessPortal(pathname, user.role)) redirect(portalHomeFor(user.role));

  return <PortalShell user={user}>{children}</PortalShell>;
}
