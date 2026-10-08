import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Give | The Publishers House",
  description:
    "Partner with The Publishers House through your generous giving. Support the ministry, our weekly services, and The Publishers House building project — our permanent home.",
  openGraph: {
    title: "Give | The Publishers House",
    description:
      "Support the work of The Publishers House. Give online via card, bank transfer, or cryptocurrency.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Give – The Publishers House" }],
  },
};

export default function GivingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
