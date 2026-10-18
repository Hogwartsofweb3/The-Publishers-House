import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resources & Study Guides | The Publishers House",
  description:
    "Explore categorized biblical teaching series, prayer school curriculum, 40-day devotionals, and downloadable apostolic study guides.",
  openGraph: {
    title: "Resources & Study Guides | The Publishers House",
    description:
      "Systematic teaching series, prayer class manuals, devotionals, and foundational apostolic courses designed to establish believers in Christ.",
    url: "https://www.thepublishershouse.org/resources",
  },
};

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
