"use client";

import dynamic from "next/dynamic";

// Lazy-load the GlobalAudioPlayer (heavy: 558 lines, 20 KB) after hydration.
// The context defaults (no-ops) in GlobalAudioPlayer serve as fallbacks until
// the component loads, which is fine — users only trigger playback on click.
const AudioProviderLazy = dynamic(
  () => import("./GlobalAudioPlayer").then((m) => ({ default: m.AudioProvider })),
  { ssr: false }
);

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AudioProviderLazy>
      {children}
    </AudioProviderLazy>
  );
}
