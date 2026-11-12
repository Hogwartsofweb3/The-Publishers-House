"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

interface UsePushNotificationsOptions {
  uid?: string;
  email?: string;
  enabled?: boolean;
}

export function usePushNotifications({ uid, email, enabled = true }: UsePushNotificationsOptions) {
  const registeredRef = useRef(false);
  const [permissionState, setPermissionState] = useState<NotificationPermission | "unsupported">("default");

  // Check current permission state on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) {
      setPermissionState("unsupported");
      return;
    }
    setPermissionState(Notification.permission);
  }, []);

  // Auto-register if permission already granted (returning user)
  useEffect(() => {
    if (!enabled || !uid || registeredRef.current) return;
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (!VAPID_PUBLIC_KEY) return;
    if (Notification.permission !== "granted") return; // only auto-register if already allowed

    registerSubscription(uid, email);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, email, enabled]);

  const registerSubscription = useCallback(async (uidVal?: string, emailVal?: string) => {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      await navigator.serviceWorker.ready;

      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }

      await fetch("/api/portal/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "subscribe",
          uid: uidVal || uid,
          email: emailVal || email,
          subscription: sub.toJSON(),
        }),
      });

      registeredRef.current = true;
    } catch (err) {
      console.warn("Push subscription failed:", err);
    }
  }, [uid, email]);

  // Called explicitly on user button click — this is the ONLY way to trigger permission on iOS/Android
  const requestPermissionAndSubscribe = useCallback(async () => {
    if (typeof window === "undefined") return "unsupported" as const;
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setPermissionState("unsupported");
      return "unsupported" as const;
    }
    if (!VAPID_PUBLIC_KEY) return "denied" as const;

    const result = await Notification.requestPermission();
    setPermissionState(result);

    if (result === "granted") {
      await registerSubscription();
    }
    return result;
  }, [registerSubscription]);

  return { permissionState, requestPermissionAndSubscribe };
}
