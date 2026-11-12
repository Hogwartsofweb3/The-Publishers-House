"use client";

import { useEffect, useRef } from "react";

// VAPID public key — must match NEXT_PUBLIC_VAPID_PUBLIC_KEY in .env.local
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

  useEffect(() => {
    if (!enabled || !uid || registeredRef.current) return;
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (!VAPID_PUBLIC_KEY) return;

    const register = async () => {
      try {
        // Register service worker
        const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        await navigator.serviceWorker.ready;

        // Check existing permission
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        // Get or create push subscription
        let sub = await reg.pushManager.getSubscription();
        if (!sub) {
          sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
          });
        }

        // Send subscription to server
        await fetch("/api/portal/push", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "subscribe",
            uid,
            email,
            subscription: sub.toJSON(),
          }),
        });

        registeredRef.current = true;
      } catch (err) {
        // Non-critical — push notifications are progressive enhancement
        console.warn("Push subscription failed:", err);
      }
    };

    register();
  }, [uid, email, enabled]);
}
