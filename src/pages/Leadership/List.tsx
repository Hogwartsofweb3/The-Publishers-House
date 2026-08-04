import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../../components/ui/EmptyState'
import { Button } from '../../components/ui/Button'
import {
  deleteLeader,
  listLeaders,
  setLeaderPublished,
} from '../../services/leadership'
import type { Leader } from '../../types/content'
import '../../components/ui/Button.css'
import '../../components/ui/table.css'

export function LeadershipListPage() {
  const [leaders, setLeaders] = useState<Leader[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      setLeaders(await listLeaders())
    } catch {
      setError(
        'Could not load leadership. Confirm Firestore is enabled and you are signed in.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function handleTogglePublished(item: Leader) {
    setPendingId(item.id)
    setError(null)
    try {
      await setLeaderPublished(item.id, !item.published)
      setLeaders((current) =>
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

  async function handleDelete(item: Leader) {
    if (
      !window.confirm(`Delete “${item.name || 'Untitled leader'}”? This cannot be undone.`)
    ) {
      return
    }
    setPendingId(item.id)
    setError(null)
    try {
      await deleteLeader(item.id)
      setLeaders((current) => current.filter((row) => row.id !== item.id))
    } catch {
      setError('Could not delete this leader.')
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="page">
      <div className="page-header-row">
        <header className="page-header">
          <p className="page-eyebrow">People</p>
          <h1 className="page-title">Leadership</h1>
          <p className="page-lead">Leaders and roles shown on the public site.</p>
        </header>
        <Link to="/leadership/new" className="btn btn-primary">
          New leader
        </Link>
      </div>

      {error ? (
        <p className="inline-feedback is-error" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="list-loading cell-muted">Loading leadership…</p>
      ) : leaders.length === 0 ? (
        <div className="list-empty-wrap">
          <EmptyState
            title="No leaders yet"
            description="Add names, roles, bios, and photo URLs. Use order to control display sequence — e.g. Dr. Joshua Agunbiade first."
            action={
              <Link to="/leadership/new" className="btn btn-primary">
                New leader
              </Link>
            }
          />
        </div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {leaders.map((item) => {
                const busy = pendingId === item.id
                return (
                  <tr key={item.id}>
                    <td className="cell-muted">{item.order}</td>
                    <td className="cell-title">{item.name || 'Untitled'}</td>
                    <td className="cell-muted">{item.role || '—'}</td>
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
                          to={`/leadership/${item.id}`}
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
