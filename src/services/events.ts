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
import type { EventItem } from '../types/content'

export type EventInput = {
  title: string
  summary: string
  description: string
  startAt: string
  endAt: string
  location: string
  imageUrl: string
  registrationUrl: string
  published: boolean
  order?: number
}

function mapEvent(id: string, data: DocumentData): EventItem {
  return {
    id,
    title: String(data.title ?? ''),
    summary: String(data.summary ?? ''),
    description: String(data.description ?? ''),
    startAt: String(data.startAt ?? ''),
    endAt: String(data.endAt ?? ''),
    location: String(data.location ?? ''),
    imageUrl: String(data.imageUrl ?? ''),
    registrationUrl: String(data.registrationUrl ?? ''),
    published: Boolean(data.published),
    order: typeof data.order === 'number' ? data.order : undefined,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  }
}

const eventsCollection = collection(db, 'events')

export async function listEvents(): Promise<EventItem[]> {
  const snapshot = await getDocs(query(eventsCollection, orderBy('startAt', 'desc')))
  return snapshot.docs.map((item) => mapEvent(item.id, item.data()))
}

export async function getEvent(id: string): Promise<EventItem | null> {
  const snapshot = await getDoc(doc(eventsCollection, id))
  return snapshot.exists() ? mapEvent(snapshot.id, snapshot.data()) : null
}

export async function createEvent(input: EventInput): Promise<string> {
  const ref = await addDoc(eventsCollection, {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateEvent(id: string, input: EventInput): Promise<void> {
  await updateDoc(doc(eventsCollection, id), {
    ...input,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteEvent(id: string): Promise<void> {
  await deleteDoc(doc(eventsCollection, id))
}

export async function setEventPublished(id: string, published: boolean): Promise<void> {
  await updateDoc(doc(eventsCollection, id), {
    published,
    updatedAt: serverTimestamp(),
  })
}
