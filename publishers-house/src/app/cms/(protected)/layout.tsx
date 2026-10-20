import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/serverAuth";
import CmsShell from "../CmsShell";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function CMSProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePortalUser();
  const allowedRoles = ["admin", "super_admin", "portal_manager"];
  const isAllowed =
    user &&
    (allowedRoles.includes(user.role) ||
      user.email === "thepublishershouse007@gmail.com" ||
      user.email === "joshuaagunbiade@gmail.com");
  if (!isAllowed) redirect("/cms/login");

  return <CmsShell>{children}</CmsShell>;
}
