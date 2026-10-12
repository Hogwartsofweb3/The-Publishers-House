import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/serverAuth";
import CmsShell from "./CmsShell";

export default async function CMSLayout({ children }: { children: React.ReactNode }) {
  const pathname = (await headers()).get("x-pathname") || "";

  if (pathname === "/cms/login") {
    return <>{children}</>;
  }

  const user = await requirePortalUser();
  if (!user || user.role !== "admin") redirect("/cms/login");

  return <CmsShell>{children}</CmsShell>;
}
