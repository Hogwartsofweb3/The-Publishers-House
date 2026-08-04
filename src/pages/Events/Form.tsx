import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { TextAreaField, TextField, ToggleField } from '../../components/ui/Field'
import {
  isValidOptionalUrl,
  toDateTimeLocalValue,
} from '../../lib/firestore'
import {
  createEvent,
  getEvent,
  updateEvent,
  type EventInput,
} from '../../services/events'
import '../../components/ui/Button.css'
import '../../components/ui/Field.css'
import '../../components/ui/table.css'

const emptyForm: EventInput = {
  title: '',
  summary: '',
  description: '',
  startAt: '',
  endAt: '',
  location: '',
  imageUrl: '',
  registrationUrl: '',
  published: false,
}

export function EventFormPage() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()

  const [form, setForm] = useState<EventInput>(emptyForm)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isNew) return
    let active = true
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const item = await getEvent(id)
        if (!active) return
        if (!item) {
          setError('Event not found.')
          return
        }
        setForm({
          title: item.title,
          summary: item.summary,
          description: item.description,
          startAt: toDateTimeLocalValue(item.startAt),
          endAt: toDateTimeLocalValue(item.endAt),
          location: item.location,
          imageUrl: item.imageUrl,
          registrationUrl: item.registrationUrl,
          published: item.published,
          order: item.order,
        })
      } catch {
        if (active) setError('Could not load this event.')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [id, isNew])

  function updateField<K extends keyof EventInput>(key: K, value: EventInput[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function validate(input: EventInput): Record<string, string> {
    const next: Record<string, string> = {}
    if (!input.title.trim()) next.title = 'Title is required.'
    if (!input.startAt.trim()) next.startAt = 'Start date & time is required.'
    if (!isValidOptionalUrl(input.imageUrl)) {
      next.imageUrl = 'Enter a valid http(s) URL or leave blank.'
    }
    if (!isValidOptionalUrl(input.registrationUrl)) {
      next.registrationUrl = 'Enter a valid http(s) URL or leave blank.'
    }
    return next
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const payload: EventInput = {
      ...form,
      title: form.title.trim(),
      summary: form.summary.trim(),
      description: form.description.trim(),
      startAt: form.startAt.trim(),
      endAt: form.endAt.trim(),
      location: form.location.trim(),
      imageUrl: form.imageUrl.trim(),
      registrationUrl: form.registrationUrl.trim(),
    }
    const nextErrors = validate(payload)
    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      setError('Please fix the highlighted fields.')
      return
    }

    setSaving(true)
    setError(null)
    try {
      if (isNew) await createEvent(payload)
      else if (id) await updateEvent(id, payload)
      navigate('/events')
    } catch {
      setError(
        'Could not save event. Confirm Firestore rules allow authenticated writes.',
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="list-loading cell-muted">Loading event…</p>

  return (
    <div className="page">
      <div className="page-header-row">
        <header className="page-header">
          <p className="page-eyebrow">Calendar</p>
          <h1 className="page-title">{isNew ? 'New event' : 'Edit event'}</h1>
          <p className="page-lead">
            Cover images and registration stay as URLs — no file uploads in this CMS.
          </p>
        </header>
        <Link to="/events" className="btn btn-secondary">
          Back to list
        </Link>
      </div>

      <form className="form-panel" onSubmit={(e) => void handleSubmit(e)}>
        <div className="form-grid">
          <TextField
            className="span-2"
            label="Title"
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
            error={fieldErrors.title}
            required
          />
          <TextField
            className="span-2"
            label="Summary"
            value={form.summary}
            onChange={(e) => updateField('summary', e.target.value)}
            hint="Short line for event cards."
          />
          <TextAreaField
            className="span-2"
            label="Description"
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            hint="Full event write-up (markdown or plain text)."
          />
          <TextField
            label="Starts"
            type="datetime-local"
            value={form.startAt}
            onChange={(e) => updateField('startAt', e.target.value)}
            error={fieldErrors.startAt}
            required
          />
          <TextField
            label="Ends"
            type="datetime-local"
            value={form.endAt}
            onChange={(e) => updateField('endAt', e.target.value)}
          />
          <TextField
            className="span-2"
            label="Location / venue"
            value={form.location}
            onChange={(e) => updateField('location', e.target.value)}
            placeholder="House of Bread, Jos"
          />
          <TextField
            className="span-2"
            label="Cover image URL"
            type="url"
            value={form.imageUrl}
            onChange={(e) => updateField('imageUrl', e.target.value)}
            error={fieldErrors.imageUrl}
          />
          <TextField
            className="span-2"
            label="Registration URL"
            type="url"
            value={form.registrationUrl}
            onChange={(e) => updateField('registrationUrl', e.target.value)}
            error={fieldErrors.registrationUrl}
          />
          <div className="span-2">
            <ToggleField
              label="Published"
              checked={form.published}
              onChange={(checked) => updateField('published', checked)}
              hint="Only published events should appear on the public site."
            />
          </div>
        </div>

        {error ? (
          <p className="form-status is-error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="form-actions">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : isNew ? 'Create event' : 'Save changes'}
          </Button>
          <Link to="/events" className="btn btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
