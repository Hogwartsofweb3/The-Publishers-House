"use client";

import React, { useState, useEffect } from "react";
import { PrivyProvider } from "@privy-io/react-auth";

class PrivyErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
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
    return <>{children}</>;
  }

  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "cmued569w00d20cl8zynnfgsk";

  return (
    <PrivyErrorBoundary fallback={fallback ?? <>{children}</>}>
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
