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
import type { Leader } from '../types/content'

export type LeaderInput = {
  name: string
  role: string
  bio: string
  photoUrl: string
  order: number
  published: boolean
}

function mapLeader(id: string, data: DocumentData): Leader {
  return {
    id,
    name: String(data.name ?? ''),
    role: String(data.role ?? ''),
    bio: String(data.bio ?? ''),
    photoUrl: String(data.photoUrl ?? ''),
    order: typeof data.order === 'number' ? data.order : 0,
    published: Boolean(data.published),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  }
}

const leadershipCollection = collection(db, 'leadership')

export async function listLeaders(): Promise<Leader[]> {
  const snapshot = await getDocs(query(leadershipCollection, orderBy('order', 'asc')))
  return snapshot.docs.map((item) => mapLeader(item.id, item.data()))
}

export async function getLeader(id: string): Promise<Leader | null> {
  const snapshot = await getDoc(doc(leadershipCollection, id))
  return snapshot.exists() ? mapLeader(snapshot.id, snapshot.data()) : null
}

export async function createLeader(input: LeaderInput): Promise<string> {
  const ref = await addDoc(leadershipCollection, {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateLeader(id: string, input: LeaderInput): Promise<void> {
  await updateDoc(doc(leadershipCollection, id), {
    ...input,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteLeader(id: string): Promise<void> {
  await deleteDoc(doc(leadershipCollection, id))
}

export async function setLeaderPublished(
  id: string,
  published: boolean,
): Promise<void> {
  await updateDoc(doc(leadershipCollection, id), {
    published,
    updatedAt: serverTimestamp(),
  })
}
