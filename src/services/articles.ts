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
import type { Article } from '../types/content'

export type ArticleInput = {
  title: string
  slug: string
  excerpt: string
  body: string
  coverImageUrl: string
  author: string
  categories: string[]
  publishedAt: string
  published: boolean
  order?: number
}

function mapArticle(id: string, data: DocumentData): Article {
  return {
    id,
    title: String(data.title ?? ''),
    slug: String(data.slug ?? ''),
    excerpt: String(data.excerpt ?? ''),
    body: String(data.body ?? ''),
    coverImageUrl: String(data.coverImageUrl ?? ''),
    author: String(data.author ?? ''),
    categories: Array.isArray(data.categories) ? data.categories.map(String) : [],
    publishedAt: String(data.publishedAt ?? ''),
    published: Boolean(data.published),
    order: typeof data.order === 'number' ? data.order : undefined,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  }
}

const articlesCollection = collection(db, 'articles')

export async function listArticles(): Promise<Article[]> {
  const snapshot = await getDocs(
    query(articlesCollection, orderBy('publishedAt', 'desc')),
  )
  return snapshot.docs.map((item) => mapArticle(item.id, item.data()))
}

export async function getArticle(id: string): Promise<Article | null> {
  const snapshot = await getDoc(doc(articlesCollection, id))
  return snapshot.exists() ? mapArticle(snapshot.id, snapshot.data()) : null
}

export async function createArticle(input: ArticleInput): Promise<string> {
  const ref = await addDoc(articlesCollection, {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateArticle(id: string, input: ArticleInput): Promise<void> {
  await updateDoc(doc(articlesCollection, id), {
    ...input,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteArticle(id: string): Promise<void> {
  await deleteDoc(doc(articlesCollection, id))
}

export async function setArticlePublished(
  id: string,
  published: boolean,
): Promise<void> {
  await updateDoc(doc(articlesCollection, id), {
    published,
    updatedAt: serverTimestamp(),
  })
}
