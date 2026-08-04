import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../../components/ui/EmptyState'
import { Button } from '../../components/ui/Button'
import { formatDisplayDateTime } from '../../lib/firestore'
import {
  deleteEvent,
  listEvents,
  setEventPublished,
} from '../../services/events'
import type { EventItem } from '../../types/content'
import '../../components/ui/Button.css'
import '../../components/ui/table.css'

export function EventsListPage() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      setEvents(await listEvents())
    } catch {
      setError(
        'Could not load events. Confirm Firestore is enabled and you are signed in.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function handleTogglePublished(item: EventItem) {
    setPendingId(item.id)
    setError(null)
    try {
      await setEventPublished(item.id, !item.published)
      setEvents((current) =>
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

  async function handleDelete(item: EventItem) {
    if (!window.confirm(`Delete “${item.title || 'Untitled event'}”? This cannot be undone.`)) {
      return
    }
    setPendingId(item.id)
    setError(null)
    try {
      await deleteEvent(item.id)
      setEvents((current) => current.filter((row) => row.id !== item.id))
    } catch {
      setError('Could not delete this event.')
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="page">
      <div className="page-header-row">
        <header className="page-header">
          <p className="page-eyebrow">Calendar</p>
          <h1 className="page-title">Events</h1>
          <p className="page-lead">Upcoming gatherings and registration links.</p>
        </header>
        <Link to="/events/new" className="btn btn-primary">
          New event
        </Link>
      </div>

      {error ? (
        <p className="inline-feedback is-error" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="list-loading cell-muted">Loading events…</p>
      ) : events.length === 0 ? (
        <div className="list-empty-wrap">
          <EmptyState
            title="No events yet"
            description="Add gatherings with dates, venue, cover image URL, and optional registration link."
            action={
              <Link to="/events/new" className="btn btn-primary">
                New event
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
                <th>Starts</th>
                <th>Location</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {events.map((item) => {
                const busy = pendingId === item.id
                return (
                  <tr key={item.id}>
                    <td className="cell-title">{item.title || 'Untitled'}</td>
                    <td className="cell-muted">{formatDisplayDateTime(item.startAt)}</td>
                    <td className="cell-muted">{item.location || '—'}</td>
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
                        <Link to={`/events/${item.id}`} className="btn btn-secondary">
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
