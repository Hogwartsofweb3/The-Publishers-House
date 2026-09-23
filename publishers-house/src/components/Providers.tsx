"use client";

import { PrivyProvider } from "@privy-io/react-auth";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || "cmued569w00d20cl8zynnfgsk"}
      config={{
        appearance: {
          theme: "light",
          accentColor: "#0140C1",
          logo: "https://www.thepublishershouse.org/images/nav-logo.png",
        },
        // Display email and wallet as login methods
        loginMethods: ["email", "wallet"],
      }}
    >
      {children}
    </PrivyProvider>
  );
}
