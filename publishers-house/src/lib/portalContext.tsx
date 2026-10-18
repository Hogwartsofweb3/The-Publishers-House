"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { PortalUser, UserRole, Campus } from "@/lib/portalAuth";

interface PortalContextType {
  campus: "all" | Campus;
  setCampus: (c: "all" | Campus) => void;
  previewRole: UserRole | null;
  previewUnitId: string | null;
  startPreview: (role: UserRole, unitId?: string) => void;
  exitPreview: () => void;
  effectiveUser: PortalUser;
  isSuperAdmin: boolean;
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

export function PortalProvider({
  user,
  children,
}: {
  user: PortalUser;
  children: React.ReactNode;
}) {
  const [campus, setCampusState] = useState<"all" | Campus>("all");
  const [previewRole, setPreviewRole] = useState<UserRole | null>(null);
  const [previewUnitId, setPreviewUnitId] = useState<string | null>(null);

  // Load saved campus from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCampus = localStorage.getItem("tph_portal_campus");
      if (savedCampus === "all" || savedCampus === "jos" || savedCampus === "abuja") {
        setCampusState(savedCampus as any);
      }
    }
  }, []);

  const setCampus = (c: "all" | Campus) => {
    setCampusState(c);
    if (typeof window !== "undefined") {
      localStorage.setItem("tph_portal_campus", c);
      window.dispatchEvent(new CustomEvent("tph_campus_changed", { detail: c }));
    }
  };

  const isSuperAdmin =
    user.role === "super_admin" ||
    user.email.toLowerCase() === "joshuaagunbiade@gmail.com";

  const startPreview = (role: UserRole, unitId?: string) => {
    setPreviewRole(role);
    setPreviewUnitId(unitId || (role === "unit_head" ? "ushering" : null));
  };

  const exitPreview = () => {
    setPreviewRole(null);
    setPreviewUnitId(null);
  };

  const effectiveUser: PortalUser = {
    ...user,
    role: previewRole || user.role,
    assignedUnitId: previewUnitId || user.assignedUnitId,
  };

  return (
    <PortalContext.Provider
      value={{
        campus,
        setCampus,
        previewRole,
        previewUnitId,
        startPreview,
        exitPreview,
        effectiveUser,
        isSuperAdmin,
      }}
    >
      {children}
    </PortalContext.Provider>
  );
}

export function usePortal() {
  const ctx = useContext(PortalContext);
  if (!ctx) {
    throw new Error("usePortal must be used within a PortalProvider");
  }
  return ctx;
}
