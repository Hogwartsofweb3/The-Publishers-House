import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where, orderBy, limit as firestoreLimit } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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


// ---- Data Fetching Functions ---- //

export async function getSermons(limitCount = 12): Promise<Sermon[]> {
  const q = query(
    collection(db, "sermons"),
    where("published", "==", true),
    orderBy("date", "desc"),
    firestoreLimit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Sermon));
}

export async function getLatestSermon(): Promise<Sermon | null> {
  const q = query(
    collection(db, "sermons"),
    where("published", "==", true),
    orderBy("date", "desc"),
    firestoreLimit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() } as Sermon;
}

export async function getUpcomingEvents(limitCount = 6): Promise<EventItem[]> {
  const today = new Date().toISOString().split("T")[0];
  const q = query(
    collection(db, "events"),
    where("published", "==", true),
    where("startAt", ">=", today),
    orderBy("startAt", "asc"),
    firestoreLimit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as EventItem));
}

export async function getEvents(limitCount = 12): Promise<EventItem[]> {
  const q = query(
    collection(db, "events"),
    where("published", "==", true),
    orderBy("startAt", "asc"),
    firestoreLimit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as EventItem));
}

export async function getArticles(limitCount = 12): Promise<Article[]> {
  const q = query(
    collection(db, "articles"),
    where("published", "==", true),
    orderBy("publishedAt", "desc"),
    firestoreLimit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Article));
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
    where("published", "==", true),
    orderBy("name", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Program));
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
    where("published", "==", true),
    orderBy("order", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Leader));
}
