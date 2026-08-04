import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../../components/ui/EmptyState'
import { Button } from '../../components/ui/Button'
import { formatDisplayDate } from '../../lib/firestore'
import {
  deleteSermon,
  listSermons,
  setSermonPublished,
} from '../../services/sermons'
import type { Sermon } from '../../types/content'
import '../../components/ui/Button.css'
import '../../components/ui/table.css'

export function SermonsListPage() {
  const [sermons, setSermons] = useState<Sermon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      const rows = await listSermons()
      setSermons(rows)
    } catch {
      setError(
        'Could not load sermons. Confirm Firestore is enabled and you are signed in.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function handleTogglePublished(sermon: Sermon) {
    setPendingId(sermon.id)
    setError(null)
    try {
      await setSermonPublished(sermon.id, !sermon.published)
      setSermons((current) =>
        current.map((row) =>
          row.id === sermon.id ? { ...row, published: !row.published } : row,
        ),
      )
    } catch {
      setError('Could not update publish status.')
    } finally {
      setPendingId(null)
    }
  }

  async function handleDelete(sermon: Sermon) {
    const confirmed = window.confirm(
      `Delete “${sermon.title || 'Untitled sermon'}”? This cannot be undone.`,
    )
    if (!confirmed) return

    setPendingId(sermon.id)
    setError(null)
    try {
      await deleteSermon(sermon.id)
      setSermons((current) => current.filter((row) => row.id !== sermon.id))
    } catch {
      setError('Could not delete this sermon.')
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="page">
      <div className="page-header-row">
        <header className="page-header">
          <p className="page-eyebrow">Library</p>
          <h1 className="page-title">Sermons</h1>
          <p className="page-lead">
            Video, audio, and study guide links for each teaching.
          </p>
        </header>
        <Link to="/sermons/new" className="btn btn-primary">
          New sermon
        </Link>
      </div>

      {error ? (
        <p className="inline-feedback is-error" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="list-loading cell-muted">Loading sermons…</p>
      ) : sermons.length === 0 ? (
        <div className="list-empty-wrap">
          <EmptyState
            title="No sermons yet"
            description="Create the first teaching with a title, speaker, date, and media URLs. The public site will only show published entries."
            action={
              <Link to="/sermons/new" className="btn btn-primary">
                New sermon
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
                <th>Speaker</th>
                <th>Date</th>
                <th>Series</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {sermons.map((sermon) => {
                const busy = pendingId === sermon.id
                return (
                  <tr key={sermon.id}>
                    <td className="cell-title">{sermon.title || 'Untitled'}</td>
                    <td className="cell-muted">{sermon.speaker || '—'}</td>
                    <td className="cell-muted">{formatDisplayDate(sermon.date)}</td>
                    <td className="cell-muted">{sermon.series || '—'}</td>
                    <td>
                      <span
                        className={`status-pill ${
                          sermon.published ? 'is-published' : 'is-draft'
                        }`}
                      >
                        {sermon.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td>
                      <div className="cell-actions">
                        <Link
                          to={`/sermons/${sermon.id}`}
                          className="btn btn-secondary"
                        >
                          Edit
                        </Link>
                        <Button
                          variant="ghost"
                          disabled={busy}
                          onClick={() => void handleTogglePublished(sermon)}
                        >
                          {sermon.published ? 'Unpublish' : 'Publish'}
                        </Button>
                        <Button
                          variant="danger"
                          disabled={busy}
                          onClick={() => void handleDelete(sermon)}
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
