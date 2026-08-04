import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { toDate } from '../lib/firestore'
import type { Sermon } from '../types/content'

export type SermonInput = {
  title: string
  speaker: string
  date: string
  videoUrl: string
  audioUrl: string
  studyGuideUrl: string
  series: string
  tags: string[]
  published: boolean
  order?: number
}

function mapSermon(id: string, data: DocumentData): Sermon {
  return {
    id,
    title: String(data.title ?? ''),
    speaker: String(data.speaker ?? ''),
    date: String(data.date ?? ''),
    videoUrl: String(data.videoUrl ?? ''),
    audioUrl: String(data.audioUrl ?? ''),
    studyGuideUrl: String(data.studyGuideUrl ?? ''),
    series: String(data.series ?? ''),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    published: Boolean(data.published),
    order: typeof data.order === 'number' ? data.order : undefined,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  }
}

const sermonsCollection = collection(db, 'sermons')

export async function listSermons(): Promise<Sermon[]> {
  const snapshot = await getDocs(query(sermonsCollection, orderBy('date', 'desc')))
  return snapshot.docs.map((item) => mapSermon(item.id, item.data()))
}

export async function getSermon(id: string): Promise<Sermon | null> {
  const snapshot = await getDoc(doc(sermonsCollection, id))
  return snapshot.exists() ? mapSermon(snapshot.id, snapshot.data()) : null
}

export async function createSermon(input: SermonInput): Promise<string> {
  const ref = await addDoc(sermonsCollection, {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateSermon(id: string, input: SermonInput): Promise<void> {
  await updateDoc(doc(sermonsCollection, id), {
    ...input,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteSermon(id: string): Promise<void> {
  await deleteDoc(doc(sermonsCollection, id))
}

export async function setSermonPublished(id: string, published: boolean): Promise<void> {
  await updateDoc(doc(sermonsCollection, id), {
    published,
    updatedAt: serverTimestamp(),
  })
}
