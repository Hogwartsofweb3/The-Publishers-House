"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  process.env.VAPID_PUBLIC_KEY ||
  "ds0gPNLM5jVSbXJMLSi4DWsP-1Nh3uH2cvBtxxdkqNPHFtVkfLGoCuoRUywC3DxTk1RF655GkvvS4fO6LGyY6w";

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

export function usePushNotifications({ uid, email, enabled = true }: UsePushNotificationsOptions = {}) {
  const registeredRef = useRef(false);
  const [permissionState, setPermissionState] = useState<NotificationPermission | "unsupported">("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // Check current permission state and active subscription on mount
  const checkStatus = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setPermissionState("unsupported");
      return;
    }
    setPermissionState(Notification.permission);

    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        const sub = await reg.pushManager.getSubscription();
        setIsSubscribed(Boolean(sub));
      }
    } catch {}
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const registerSubscription = useCallback(async (uidVal?: string, emailVal?: string): Promise<boolean> => {
    try {
      if (typeof window === "undefined") return false;
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;

      const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      await navigator.serviceWorker.ready;

      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }

      const activeUid = uidVal || uid || "";
      const activeEmail = emailVal || email || "";

      await fetch("/api/portal/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "subscribe",
          uid: activeUid,
          email: activeEmail,
          subscription: sub.toJSON(),
        }),
      });

      registeredRef.current = true;
      setIsSubscribed(true);
      return true;
    } catch (err: any) {
      console.warn("Push subscription failed:", err);
      return false;
    }
  }, [uid, email]);

  // Auto-sync if permission already granted
  useEffect(() => {
    if (!enabled || !uid || registeredRef.current) return;
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (Notification.permission !== "granted") return;

    registerSubscription(uid, email);
  }, [uid, email, enabled, registerSubscription]);

  // Request permission and subscribe (triggers phone OS modal)
  const requestPermissionAndSubscribe = useCallback(async () => {
    if (typeof window === "undefined") return "unsupported" as const;
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setPermissionState("unsupported");
      return "unsupported" as const;
    }

    setLoading(true);
    setStatusMessage("");
    try {
      const result = await Notification.requestPermission();
      setPermissionState(result);

      if (result === "granted") {
        const ok = await registerSubscription();
        if (ok) {
          setStatusMessage("Notifications enabled! You will now receive church alerts on your phone.");
        } else {
          setStatusMessage("Permission granted, but failed to register push service.");
        }
      } else if (result === "denied") {
        setStatusMessage("Notifications are blocked in your browser. Please tap the lock/settings icon in your address bar to allow.");
      }
      return result;
    } finally {
      setLoading(false);
    }
  }, [registerSubscription]);

  // Unsubscribe
  const unsubscribe = useCallback(async () => {
    if (typeof window === "undefined") return false;
    setLoading(true);
    setStatusMessage("");
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await sub.unsubscribe();
        }
      }
      setIsSubscribed(false);

      const activeUid = uid || "";
      const activeEmail = email || "";
      if (activeUid || activeEmail) {
        await fetch(`/api/portal/push?uid=${encodeURIComponent(activeUid)}&email=${encodeURIComponent(activeEmail)}`, {
          method: "DELETE",
        });
      }

      setStatusMessage("Push notifications turned off on this device.");
      return true;
    } catch (err: any) {
      console.warn("Unsubscribe failed:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [uid, email]);

  // Send test push alert to verify
  const sendTestNotification = useCallback(async () => {
    if (!uid && !email) return false;
    setLoading(true);
    setStatusMessage("");
    try {
      const res = await fetch("/api/portal/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send",
          targetUid: uid,
          targetEmail: email,
          title: "The Publishers House",
          message: "Grace & peace! Your push notifications are working properly on this device. 🎉",
          link: "/portal/member",
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatusMessage("Test alert sent! Check your phone lockscreen / notification bar.");
        return true;
      } else {
        setStatusMessage("Failed to send test alert: " + (data.error || "Device not registered"));
        return false;
      }
    } catch {
      setStatusMessage("Network error sending test alert.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [uid, email]);

  return {
    permissionState,
    isSubscribed,
    loading,
    statusMessage,
    requestPermissionAndSubscribe,
    unsubscribe,
    sendTestNotification,
    checkStatus,
  };
}
