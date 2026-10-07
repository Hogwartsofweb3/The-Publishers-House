import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getSermonById, getSermons } from "@/lib/firebase";
import SermonDetailClient from "./SermonDetailClient";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const sermon = await getSermonById(id);
  if (!sermon) return { title: "Sermon Not Found | The Publishers House" };
  return {
    title: `${sermon.title} | The Publishers House`,
    description: sermon.summary || "Sermon teaching from The Publishers House.",
  };
}

export default async function SermonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sermon = await getSermonById(id);
  if (!sermon) return notFound();

  // Fetch some related sermons (same series if possible, else just recent)
  let allSermons = await getSermons(10);
  let relatedSermons = allSermons.filter(s => s.id !== sermon.id);
  
  if (sermon.series) {
    const seriesMatches = relatedSermons.filter(s => s.series === sermon.series);
    if (seriesMatches.length > 0) {
      relatedSermons = seriesMatches;
    }
  }

  return (
    <>
      <Navbar />
      <SermonDetailClient sermon={sermon} relatedSermons={relatedSermons} />
      <Footer />
    </>
  );
}
