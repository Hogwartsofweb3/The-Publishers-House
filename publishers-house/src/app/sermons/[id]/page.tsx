import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getSermonById, getSermons, getSermonsBySeries, type Sermon } from "@/lib/firebase";
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

  // Fetch related sermons strictly in the same series
  let relatedSermons: Sermon[] = [];
  if (sermon.series) {
    relatedSermons = await getSermonsBySeries(sermon.series, sermon.id, 6);
  }
  // If no sermons in the same series, fallback to other teachings
  if (relatedSermons.length === 0) {
    const all = await getSermons(6);
    relatedSermons = all.filter(s => s.id !== sermon.id).slice(0, 3);
  }

  return (
    <>
      <Navbar />
      <SermonDetailClient sermon={sermon} relatedSermons={relatedSermons} />
      <Footer />
    </>
  );
}
