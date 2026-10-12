import type { Metadata } from "next";
import GivingProviders from "@/components/GivingProviders";

export const metadata: Metadata = {
  title: "Give | The Publishers House",
  description:
    "Partner with The Publishers House through your giving. Support the ministry, weekly services, and the TPH building project — our permanent home.",
  openGraph: {
    siteName: "The Publishers House",
    title: "Give | The Publishers House",
    description:
      "Support the work of The Publishers House. Give online via card, bank transfer, or cryptocurrency.",
    url: "https://www.thepublishershouse.org/giving",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Give – The Publishers House" }],
  },
};

export default function GivingLayout({ children }: { children: React.ReactNode }) {
  return <GivingProviders>{children}</GivingProviders>;
}
