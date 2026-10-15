"use client";

import React, { useState, useEffect } from "react";
import { Buffer } from "buffer";

// Ensure Buffer is polyfilled on window and globalThis for web3 libraries in browser
if (typeof window !== "undefined") {
  if (!(window as unknown as { Buffer?: typeof Buffer }).Buffer) {
    (window as unknown as { Buffer: typeof Buffer }).Buffer = Buffer;
  }
  if (!(globalThis as unknown as { Buffer?: typeof Buffer }).Buffer) {
    (globalThis as unknown as { Buffer: typeof Buffer }).Buffer = Buffer;
  }
}

import { PrivyProvider } from "@privy-io/react-auth";

export class PrivyErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown) {
    console.warn("Privy error caught by safe boundary:", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export default function PrivySafeProvider({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return fallback ? <>{fallback}</> : null;
  }

  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "cmued569w00d20cl8zynnfgsk";

  return (
    <PrivyErrorBoundary fallback={fallback ?? null}>
      <PrivyProvider
        appId={appId}
        config={{
          appearance: {
            theme: "light",
            accentColor: "#0140C1",
            logo: "https://www.thepublishershouse.org/images/nav-logo.png",
          },
          loginMethods: ["wallet", "email"],
        }}
      >
        {children}
      </PrivyProvider>
    </PrivyErrorBoundary>
  );
}
