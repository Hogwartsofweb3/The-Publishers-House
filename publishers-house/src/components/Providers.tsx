"use client";

import { AudioProvider } from "./GlobalAudioPlayer";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AudioProvider>
      {children}
    </AudioProvider>
  );
}
