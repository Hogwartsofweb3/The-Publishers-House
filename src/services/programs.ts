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
import type { Program } from '../types/content'

export type ProgramInput = {
  name: string
  slug: string
  summary: string
  frequency: string
  imageUrl: string
  detailsUrl: string
  published: boolean
  order?: number
}

export const FLAGSHIP_PROGRAM_HINTS = [
  { name: 'Festival of Light', frequency: 'Annual' },
  { name: 'Merismos', frequency: 'Annual' },
  { name: 'Jesus Convention', frequency: 'Annual (Easter)' },
  { name: 'The Forge', frequency: 'Monthly (end of month)' },
  { name: 'Abuja Apostolic Camp', frequency: 'Monthly (first ~2 weeks)' },
] as const

function mapProgram(id: string, data: DocumentData): Program {
  return {
    id,
    name: String(data.name ?? ''),
    slug: String(data.slug ?? ''),
    summary: String(data.summary ?? ''),
    frequency: String(data.frequency ?? ''),
    imageUrl: String(data.imageUrl ?? ''),
    detailsUrl: String(data.detailsUrl ?? ''),
    published: Boolean(data.published),
    order: typeof data.order === 'number' ? data.order : undefined,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  }
}

const programsCollection = collection(db, 'programs')

export async function listPrograms(): Promise<Program[]> {
  const snapshot = await getDocs(query(programsCollection, orderBy('name', 'asc')))
  return snapshot.docs.map((item) => mapProgram(item.id, item.data()))
}

export async function getProgram(id: string): Promise<Program | null> {
  const snapshot = await getDoc(doc(programsCollection, id))
  return snapshot.exists() ? mapProgram(snapshot.id, snapshot.data()) : null
}

export async function createProgram(input: ProgramInput): Promise<string> {
  const ref = await addDoc(programsCollection, {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateProgram(id: string, input: ProgramInput): Promise<void> {
  await updateDoc(doc(programsCollection, id), {
    ...input,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteProgram(id: string): Promise<void> {
  await deleteDoc(doc(programsCollection, id))
}

export async function setProgramPublished(
  id: string,
  published: boolean,
): Promise<void> {
  await updateDoc(doc(programsCollection, id), {
    published,
    updatedAt: serverTimestamp(),
  })
}
