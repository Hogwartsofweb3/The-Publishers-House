import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { TextField, ToggleField } from '../../components/ui/Field'
import { formatTags, isValidOptionalUrl, parseTags } from '../../lib/firestore'
import {
  createSermon,
  getSermon,
  updateSermon,
  type SermonInput,
} from '../../services/sermons'
import '../../components/ui/Button.css'
import '../../components/ui/Field.css'
import '../../components/ui/table.css'

const emptyForm: SermonInput = {
  title: '',
  speaker: '',
  date: '',
  videoUrl: '',
  audioUrl: '',
  studyGuideUrl: '',
  series: '',
  tags: [],
  published: false,
}

export function SermonFormPage() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()

  const [form, setForm] = useState<SermonInput>(emptyForm)
  const [tagsInput, setTagsInput] = useState('')
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
        const sermon = await getSermon(id)
        if (!active) return
        if (!sermon) {
          setError('Sermon not found.')
          return
        }
        setForm({
          title: sermon.title,
          speaker: sermon.speaker,
          date: sermon.date,
          videoUrl: sermon.videoUrl,
          audioUrl: sermon.audioUrl,
          studyGuideUrl: sermon.studyGuideUrl,
          series: sermon.series,
          tags: sermon.tags,
          published: sermon.published,
          order: sermon.order,
        })
        setTagsInput(formatTags(sermon.tags))
      } catch {
        if (active) setError('Could not load this sermon.')
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [id, isNew])

  function updateField<K extends keyof SermonInput>(key: K, value: SermonInput[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function validate(input: SermonInput): Record<string, string> {
    const next: Record<string, string> = {}
    if (!input.title.trim()) next.title = 'Title is required.'
    if (!input.speaker.trim()) next.speaker = 'Speaker is required.'
    if (!input.date.trim()) next.date = 'Date preached is required.'
    if (!isValidOptionalUrl(input.videoUrl)) {
      next.videoUrl = 'Enter a valid http(s) URL or leave blank.'
    }
    if (!isValidOptionalUrl(input.audioUrl)) {
      next.audioUrl = 'Enter a valid http(s) URL or leave blank.'
    }
    if (!isValidOptionalUrl(input.studyGuideUrl)) {
      next.studyGuideUrl = 'Enter a valid http(s) URL or leave blank.'
    }
    return next
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const payload: SermonInput = {
      ...form,
      title: form.title.trim(),
      speaker: form.speaker.trim(),
      date: form.date.trim(),
      videoUrl: form.videoUrl.trim(),
      audioUrl: form.audioUrl.trim(),
      studyGuideUrl: form.studyGuideUrl.trim(),
      series: form.series.trim(),
      tags: parseTags(tagsInput),
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
      if (isNew) {
        await createSermon(payload)
        navigate('/sermons')
      } else if (id) {
        await updateSermon(id, payload)
        navigate('/sermons')
      }
    } catch {
      setError(
        'Could not save sermon. Confirm Firestore rules allow authenticated writes.',
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="list-loading cell-muted">Loading sermon…</p>
  }

  return (
    <div className="page">
      <div className="page-header-row">
        <header className="page-header">
          <p className="page-eyebrow">Library</p>
          <h1 className="page-title">{isNew ? 'New sermon' : 'Edit sermon'}</h1>
          <p className="page-lead">
            Media stays as URLs — paste YouTube/Vimeo, audio, and study guide links.
          </p>
        </header>
        <Link to="/sermons" className="btn btn-secondary">
          Back to list
        </Link>
      </div>

      <form className="form-panel" onSubmit={(event) => void handleSubmit(event)}>
        <div className="form-grid">
          <TextField
            className="span-2"
            label="Title"
            value={form.title}
            onChange={(event) => updateField('title', event.target.value)}
            error={fieldErrors.title}
            required
          />
          <TextField
            label="Speaker"
            value={form.speaker}
            onChange={(event) => updateField('speaker', event.target.value)}
            error={fieldErrors.speaker}
            required
          />
          <TextField
            label="Date preached"
            type="date"
            value={form.date}
            onChange={(event) => updateField('date', event.target.value)}
            error={fieldErrors.date}
            required
          />
          <TextField
            className="span-2"
            label="Video URL"
            type="url"
            placeholder="https://youtube.com/… or https://vimeo.com/…"
            value={form.videoUrl}
            onChange={(event) => updateField('videoUrl', event.target.value)}
            error={fieldErrors.videoUrl}
            hint="YouTube or Vimeo link for the public site embed."
          />
          <TextField
            className="span-2"
            label="Audio URL"
            type="url"
            placeholder="https://…/sermon.mp3"
            value={form.audioUrl}
            onChange={(event) => updateField('audioUrl', event.target.value)}
            error={fieldErrors.audioUrl}
            hint="Direct MP3 (or hosted audio) URL."
          />
          <TextField
            className="span-2"
            label="Study guide URL"
            type="url"
            placeholder="https://…/study-guide.pdf"
            value={form.studyGuideUrl}
            onChange={(event) => updateField('studyGuideUrl', event.target.value)}
            error={fieldErrors.studyGuideUrl}
            hint="PDF or document link."
          />
          <TextField
            label="Series"
            value={form.series}
            onChange={(event) => updateField('series', event.target.value)}
            placeholder="e.g. Didache"
          />
          <TextField
            label="Tags"
            value={tagsInput}
            onChange={(event) => setTagsInput(event.target.value)}
            placeholder="faith, discipleship, prayer"
            hint="Comma-separated."
          />
          <div className="span-2">
            <ToggleField
              label="Published"
              checked={form.published}
              onChange={(checked) => updateField('published', checked)}
              hint="Only published sermons should appear on the public site."
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
            {saving ? 'Saving…' : isNew ? 'Create sermon' : 'Save changes'}
          </Button>
          <Link to="/sermons" className="btn btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
