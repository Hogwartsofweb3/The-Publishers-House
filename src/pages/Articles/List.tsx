import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../../components/ui/EmptyState'
import { Button } from '../../components/ui/Button'
import { formatDisplayDate } from '../../lib/firestore'
import {
  deleteArticle,
  listArticles,
  setArticlePublished,
} from '../../services/articles'
import type { Article } from '../../types/content'
import '../../components/ui/Button.css'
import '../../components/ui/table.css'

export function ArticlesListPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      setArticles(await listArticles())
    } catch {
      setError(
        'Could not load articles. Confirm Firestore is enabled and you are signed in.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function handleTogglePublished(item: Article) {
    setPendingId(item.id)
    setError(null)
    try {
      await setArticlePublished(item.id, !item.published)
      setArticles((current) =>
        current.map((row) =>
          row.id === item.id ? { ...row, published: !row.published } : row,
        ),
      )
    } catch {
      setError('Could not update publish status.')
    } finally {
      setPendingId(null)
    }
  }

  async function handleDelete(item: Article) {
    if (
      !window.confirm(`Delete “${item.title || 'Untitled article'}”? This cannot be undone.`)
    ) {
      return
    }
    setPendingId(item.id)
    setError(null)
    try {
      await deleteArticle(item.id)
      setArticles((current) => current.filter((row) => row.id !== item.id))
    } catch {
      setError('Could not delete this article.')
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="page">
      <div className="page-header-row">
        <header className="page-header">
          <p className="page-eyebrow">Writing</p>
          <h1 className="page-title">Articles</h1>
          <p className="page-lead">Published teaching and long-form content.</p>
        </header>
        <Link to="/articles/new" className="btn btn-primary">
          New article
        </Link>
      </div>

      {error ? (
        <p className="inline-feedback is-error" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="list-loading cell-muted">Loading articles…</p>
      ) : articles.length === 0 ? (
        <div className="list-empty-wrap">
          <EmptyState
            title="No articles yet"
            description="Draft written teaching with a slug, excerpt, categories, and optional cover image URL."
            action={
              <Link to="/articles/new" className="btn btn-primary">
                New article
              </Link>
            }
          />
        </div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Published</th>
                <th>Categories</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {articles.map((item) => {
                const busy = pendingId === item.id
                return (
                  <tr key={item.id}>
                    <td className="cell-title">{item.title || 'Untitled'}</td>
                    <td className="cell-muted">{item.author || '—'}</td>
                    <td className="cell-muted">
                      {formatDisplayDate(item.publishedAt)}
                    </td>
                    <td className="cell-muted">
                      {item.categories.length ? item.categories.join(', ') : '—'}
                    </td>
                    <td>
                      <span
                        className={`status-pill ${
                          item.published ? 'is-published' : 'is-draft'
                        }`}
                      >
                        {item.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td>
                      <div className="cell-actions">
                        <Link
                          to={`/articles/${item.id}`}
                          className="btn btn-secondary"
                        >
                          Edit
                        </Link>
                        <Button
                          variant="ghost"
                          disabled={busy}
                          onClick={() => void handleTogglePublished(item)}
                        >
                          {item.published ? 'Unpublish' : 'Publish'}
                        </Button>
                        <Button
                          variant="danger"
                          disabled={busy}
                          onClick={() => void handleDelete(item)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
