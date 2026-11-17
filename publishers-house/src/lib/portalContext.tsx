"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { PortalUser, UserRole, Campus } from "@/lib/portalAuth";

interface PortalContextType {
  campus: "all" | Campus;
  setCampus: (c: "all" | Campus) => void;
  previewRole: UserRole | null;
  previewUnitId: string | null;
  previewLeaderKey: string | null;
  startPreview: (role: UserRole, unitId?: string) => void;
  startLeaderPreview: (leaderKey: string, profile: Partial<PortalUser>) => void;
  exitPreview: () => void;
  currentUser: PortalUser;
  updateCurrentUser: (partial: Partial<PortalUser>) => void;
  effectiveUser: PortalUser;
  isSuperAdmin: boolean;
  activeUnitId: string | null;
  setActiveUnitId: (unitId: string) => void;
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

export function PortalProvider({
  user,
  children,
}: {
  user: PortalUser;
  children: React.ReactNode;
}) {
  const [currentUser, setCurrentUser] = useState<PortalUser>(user);
  const [campus, setCampusState] = useState<"all" | Campus>("all");
  const [previewRole, setPreviewRole] = useState<UserRole | null>(null);
  const [previewUnitId, setPreviewUnitId] = useState<string | null>(null);
  const [previewLeaderKey, setPreviewLeaderKey] = useState<string | null>(null);
  const [previewProfile, setPreviewProfile] = useState<Partial<PortalUser> | null>(null);
  const [activeUnitIdState, setActiveUnitIdState] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("tph_active_unit_id");
    }
    return null;
  });

  // Sync if user prop updates
  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  // Real-time background sync with Firestore profile (solves Laptop vs Mobile sync disparity)
  useEffect(() => {
    const syncProfile = async () => {
      try {
        const res = await fetch("/api/portal/profile");
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            const p = data.profile;
            setCurrentUser((prev) => {
              const newUnit = p.assignedUnitId || undefined;
              const newRole = p.role || prev.role;
              if (prev.assignedUnitId !== newUnit || prev.role !== newRole) {
                return {
                  ...prev,
                  ...p,
                  assignedUnitId: newUnit,
                  role: newRole,
                  isUnitHead: Boolean(p.isUnitHead || newRole === "unit_head"),
                };
              }
              return prev;
            });
          }
        }
      } catch {}
    };

    // Run on initial mount
    syncProfile();

    // Re-verify immediately whenever the user brings the tab/window into focus
    window.addEventListener("focus", syncProfile);
    window.addEventListener("online", syncProfile);

    // Periodic check every 25 seconds
    const interval = setInterval(syncProfile, 25000);

    return () => {
      window.removeEventListener("focus", syncProfile);
      window.removeEventListener("online", syncProfile);
      clearInterval(interval);
    };
  }, []);

  // Listen for instant updates broadcast across components
  useEffect(() => {
    const handleUserUpdate = (e: Event) => {
      const custom = e as CustomEvent<Partial<PortalUser>>;
      if (custom.detail) {
        setCurrentUser((prev) => ({
          ...prev,
          ...custom.detail,
        }));
      }
    };

    window.addEventListener("tph_user_updated", handleUserUpdate as EventListener);
    return () => {
      window.removeEventListener("tph_user_updated", handleUserUpdate as EventListener);
    };
  }, []);

  const updateCurrentUser = (partial: Partial<PortalUser>) => {
    setCurrentUser((prev) => ({ ...prev, ...partial }));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("tph_user_updated", { detail: partial }));
    }
  };

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
    currentUser.role === "super_admin" ||
    currentUser.email.toLowerCase() === "joshuaagunbiade@gmail.com";

  const setActiveUnitId = (unitId: string) => {
    setActiveUnitIdState(unitId);
    if (previewProfile) {
      setPreviewProfile((prev) => (prev ? { ...prev, assignedUnitId: unitId } : prev));
      setPreviewUnitId(unitId);
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("tph_active_unit_id", unitId);
      window.dispatchEvent(new CustomEvent("tph_active_unit_changed", { detail: unitId }));
    }
  };

  const startPreview = (role: UserRole, unitId?: string) => {
    setPreviewRole(role);
    setPreviewUnitId(unitId || (role === "unit_head" ? "ushering" : null));
    setActiveUnitIdState(unitId || null);
    setPreviewLeaderKey(null);
    setPreviewProfile(null);
  };

  const startLeaderPreview = (leaderKey: string, profile: Partial<PortalUser>) => {
    setPreviewLeaderKey(leaderKey);
    setPreviewProfile(profile);
    setPreviewRole(profile.role || "unit_head");
    const targetUnit = profile.assignedUnitId || null;
    setPreviewUnitId(targetUnit);
    setActiveUnitIdState(targetUnit);
    if (typeof window !== "undefined" && targetUnit) {
      localStorage.setItem("tph_active_unit_id", targetUnit);
    }
  };

  const exitPreview = () => {
    setPreviewRole(null);
    setPreviewUnitId(null);
    setPreviewLeaderKey(null);
    setPreviewProfile(null);
    setActiveUnitIdState(null);
  };

  const effectiveUnitId =
    activeUnitIdState ||
    previewUnitId ||
    (previewProfile?.assignedUnitId ? previewProfile.assignedUnitId : currentUser.assignedUnitId) ||
    undefined;

  const effectiveUser: PortalUser = previewProfile
    ? ({
        ...currentUser,
        ...previewProfile,
        role: previewProfile.role || currentUser.role,
        assignedUnitId: effectiveUnitId || previewProfile.assignedUnitId || currentUser.assignedUnitId,
      } as PortalUser)
    : {
        ...currentUser,
        role: previewRole || currentUser.role,
        assignedUnitId: effectiveUnitId || previewUnitId || currentUser.assignedUnitId,
      };

  return (
    <PortalContext.Provider
      value={{
        campus,
        setCampus,
        previewRole,
        previewUnitId,
        previewLeaderKey,
        startPreview,
        startLeaderPreview,
        exitPreview,
        currentUser,
        updateCurrentUser,
        effectiveUser,
        isSuperAdmin,
        activeUnitId: effectiveUnitId || null,
        setActiveUnitId,
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
