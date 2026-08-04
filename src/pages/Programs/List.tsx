import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../../components/ui/EmptyState'
import { Button } from '../../components/ui/Button'
import {
  deleteProgram,
  listPrograms,
  setProgramPublished,
} from '../../services/programs'
import type { Program } from '../../types/content'
import '../../components/ui/Button.css'
import '../../components/ui/table.css'

export function ProgramsListPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      setPrograms(await listPrograms())
    } catch {
      setError(
        'Could not load programs. Confirm Firestore is enabled and you are signed in.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function handleTogglePublished(item: Program) {
    setPendingId(item.id)
    setError(null)
    try {
      await setProgramPublished(item.id, !item.published)
      setPrograms((current) =>
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

  async function handleDelete(item: Program) {
    if (
      !window.confirm(`Delete “${item.name || 'Untitled program'}”? This cannot be undone.`)
    ) {
      return
    }
    setPendingId(item.id)
    setError(null)
    try {
      await deleteProgram(item.id)
      setPrograms((current) => current.filter((row) => row.id !== item.id))
    } catch {
      setError('Could not delete this program.')
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="page">
      <div className="page-header-row">
        <header className="page-header">
          <p className="page-eyebrow">Ministry</p>
          <h1 className="page-title">Programs</h1>
          <p className="page-lead">
            Flagship and ongoing programs — FOL, Merismos, Jesus Convention, The Forge,
            Abuja Apostolic Camp, and more.
          </p>
        </header>
        <Link to="/programs/new" className="btn btn-primary">
          New program
        </Link>
      </div>

      {error ? (
        <p className="inline-feedback is-error" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="list-loading cell-muted">Loading programs…</p>
      ) : programs.length === 0 ? (
        <div className="list-empty-wrap">
          <EmptyState
            title="No programs yet"
            description="Add ministry programs with a clear summary and frequency. Suggested starters: Festival of Light, Merismos, Jesus Convention, The Forge, Abuja Apostolic Camp."
            action={
              <Link to="/programs/new" className="btn btn-primary">
                New program
              </Link>
            }
          />
        </div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Frequency</th>
                <th>Slug</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {programs.map((item) => {
                const busy = pendingId === item.id
                return (
                  <tr key={item.id}>
                    <td className="cell-title">{item.name || 'Untitled'}</td>
                    <td className="cell-muted">{item.frequency || '—'}</td>
                    <td className="cell-muted">{item.slug || '—'}</td>
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
                          to={`/programs/${item.id}`}
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
