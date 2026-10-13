import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/serverAuth";
import CmsShell from "../CmsShell";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function CMSProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePortalUser();
  if (!user || user.role !== "admin") redirect("/cms/login");

  return <CmsShell>{children}</CmsShell>;
}
