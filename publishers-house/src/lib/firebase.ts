import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, query, where, limit as firestoreLimit } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (prevent multiple initializations in dev)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
export const auth = getAuth(app);
export { db };

// ---- Type Definitions (mirrored from CMS content.ts) ---- //

export type ContentTimestamps = {
  createdAt: Date | null;
  updatedAt: Date | null;
  published: boolean;
  order?: number;
};

export type Sermon = ContentTimestamps & {
  id: string;
  title: string;
  speaker: string;
  date: string;
  videoUrl: string;
  audioUrl: string;
  studyGuideUrl: string;
  series: string;
  tags: string[];
};

export type EventItem = ContentTimestamps & {
  id: string;
  title: string;
  summary: string;
  description: string;
  startAt: string;
  endAt: string;
  location: string;
  imageUrl: string;
  registrationUrl: string;
};

export type Article = ContentTimestamps & {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImageUrl: string;
  author: string;
  categories: string[];
  publishedAt: string;
};

export type Program = ContentTimestamps & {
  id: string;
  name: string;
  slug: string;
  summary: string;
  frequency: string;
  imageUrl: string;
  detailsUrl: string;
};

export type Leader = ContentTimestamps & {
  id: string;
  name: string;
  role: string;
  bio: string;
  photoUrl: string;
  order: number;
};


export type Transaction = {
  id?: string;
  name: string;
  email: string;
  amountNGN: number;
  category: string;
  method: string;
  network?: string;
  status: "pending" | "success" | "failed";
  timestamp: string;
};

// ---- Data Fetching Functions ---- //

export async function getSermons(limitCount = 12): Promise<Sermon[]> {
  const q = query(
    collection(db, "sermons"),
    where("published", "==", true),
    firestoreLimit(limitCount)
  );
  const snap = await getDocs(q);
  const results = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Sermon));
  // Sort by date descending in JS (avoids needing a composite Firestore index)
  return results.sort((a, b) => (a.date > b.date ? -1 : 1));
}

export async function getLatestSermon(): Promise<Sermon | null> {
  const q = query(
    collection(db, "sermons"),
    where("published", "==", true),
    firestoreLimit(10)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const results = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Sermon));
  results.sort((a, b) => (a.date > b.date ? -1 : 1));
  return results[0];
}

export async function getUpcomingEvents(limitCount = 6): Promise<EventItem[]> {
  const today = new Date().toISOString().split("T")[0];
  const q = query(
    collection(db, "events"),
    where("published", "==", true),
    firestoreLimit(limitCount * 3)
  );
  const snap = await getDocs(q);
  const results = snap.docs.map((d) => ({ id: d.id, ...d.data() } as EventItem));
  return results
    .filter((e) => e.startAt >= today)
    .sort((a, b) => (a.startAt < b.startAt ? -1 : 1))
    .slice(0, limitCount);
}

export async function getEvents(limitCount = 12): Promise<EventItem[]> {
  const q = query(
    collection(db, "events"),
    where("published", "==", true),
    firestoreLimit(limitCount)
  );
  const snap = await getDocs(q);
  const results = snap.docs.map((d) => ({ id: d.id, ...d.data() } as EventItem));
  return results.sort((a, b) => (a.startAt < b.startAt ? -1 : 1));
}

export async function getArticles(limitCount = 12): Promise<Article[]> {
  const q = query(
    collection(db, "articles"),
    where("published", "==", true),
    firestoreLimit(limitCount)
  );
  const snap = await getDocs(q);
  const results = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Article));
  return results.sort((a, b) => (a.publishedAt > b.publishedAt ? -1 : 1));
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const q = query(
    collection(db, "articles"),
    where("published", "==", true),
    where("slug", "==", slug),
    firestoreLimit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() } as Article;
}

export async function getPrograms(): Promise<Program[]> {
  const q = query(
    collection(db, "programs"),
    where("published", "==", true)
  );
  const snap = await getDocs(q);
  const results = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Program));
  return results.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getProgramBySlug(slug: string): Promise<Program | null> {
  const q = query(
    collection(db, "programs"),
    where("published", "==", true),
    where("slug", "==", slug),
    firestoreLimit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() } as Program;
}

export async function getLeadership(): Promise<Leader[]> {
  const q = query(
    collection(db, "leadership"),
    where("published", "==", true)
  );
  const snap = await getDocs(q);
  const results = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Leader));
  return results.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export async function saveTransaction(tx: Omit<Transaction, "id">) {
  try {
    const docRef = await addDoc(collection(db, "transactions"), tx);
    return docRef.id;
  } catch (e) {
    console.error("Error saving transaction:", e);
    return null;
  }
}

export async function getTransactions(limitCount = 50): Promise<Transaction[]> {
  const q = query(
    collection(db, "transactions"),
    firestoreLimit(limitCount)
  );
  const snap = await getDocs(q);
  const results = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction));
  return results.sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1));
}
