import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { TextAreaField, TextField, ToggleField } from '../../components/ui/Field'
import { isValidOptionalUrl, slugify } from '../../lib/firestore'
import {
  createProgram,
  FLAGSHIP_PROGRAM_HINTS,
  getProgram,
  updateProgram,
  type ProgramInput,
} from '../../services/programs'
import '../../components/ui/Button.css'
import '../../components/ui/Field.css'
import '../../components/ui/table.css'

const emptyForm: ProgramInput = {
  name: '',
  slug: '',
  summary: '',
  frequency: '',
  imageUrl: '',
  detailsUrl: '',
  published: false,
}

export function ProgramFormPage() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()

  const [form, setForm] = useState<ProgramInput>(emptyForm)
  const [slugTouched, setSlugTouched] = useState(false)
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
        const item = await getProgram(id)
        if (!active) return
        if (!item) {
          setError('Program not found.')
          return
        }
        setForm({
          name: item.name,
          slug: item.slug,
          summary: item.summary,
          frequency: item.frequency,
          imageUrl: item.imageUrl,
          detailsUrl: item.detailsUrl,
          published: item.published,
          order: item.order,
        })
        setSlugTouched(true)
      } catch {
        if (active) setError('Could not load this program.')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [id, isNew])

  function updateField<K extends keyof ProgramInput>(key: K, value: ProgramInput[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function handleNameChange(name: string) {
    setForm((current) => ({
      ...current,
      name,
      slug: slugTouched ? current.slug : slugify(name),
    }))
  }

  function applyHint(name: string, frequency: string) {
    setForm((current) => ({
      ...current,
      name,
      frequency,
      slug: slugTouched && current.slug ? current.slug : slugify(name),
    }))
  }

  function validate(input: ProgramInput): Record<string, string> {
    const next: Record<string, string> = {}
    if (!input.name.trim()) next.name = 'Name is required.'
    if (!input.slug.trim()) next.slug = 'Slug is required.'
    if (!isValidOptionalUrl(input.imageUrl)) {
      next.imageUrl = 'Enter a valid http(s) URL or leave blank.'
    }
    if (!isValidOptionalUrl(input.detailsUrl)) {
      next.detailsUrl = 'Enter a valid http(s) URL or leave blank.'
    }
    return next
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const payload: ProgramInput = {
      ...form,
      name: form.name.trim(),
      slug: slugify(form.slug) || slugify(form.name),
      summary: form.summary.trim(),
      frequency: form.frequency.trim(),
      imageUrl: form.imageUrl.trim(),
      detailsUrl: form.detailsUrl.trim(),
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
      if (isNew) await createProgram(payload)
      else if (id) await updateProgram(id, payload)
      navigate('/programs')
    } catch {
      setError(
        'Could not save program. Confirm Firestore rules allow authenticated writes.',
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="list-loading cell-muted">Loading program…</p>

  return (
    <div className="page">
      <div className="page-header-row">
        <header className="page-header">
          <p className="page-eyebrow">Ministry</p>
          <h1 className="page-title">{isNew ? 'New program' : 'Edit program'}</h1>
          <p className="page-lead">
            Free-form fields — use the quick fills below for flagship programs if helpful.
          </p>
        </header>
        <Link to="/programs" className="btn btn-secondary">
          Back to list
        </Link>
      </div>

      {isNew ? (
        <div className="hint-chips">
          {FLAGSHIP_PROGRAM_HINTS.map((hint) => (
            <button
              key={hint.name}
              type="button"
              className="btn btn-secondary"
              onClick={() => applyHint(hint.name, hint.frequency)}
            >
              {hint.name}
            </button>
          ))}
        </div>
      ) : null}

      <form className="form-panel" onSubmit={(e) => void handleSubmit(e)}>
        <div className="form-grid">
          <TextField
            className="span-2"
            label="Name"
            value={form.name}
            onChange={(e) => handleNameChange(e.target.value)}
            error={fieldErrors.name}
            required
          />
          <TextField
            label="Slug"
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true)
              updateField('slug', e.target.value)
            }}
            error={fieldErrors.slug}
            required
          />
          <TextField
            label="Frequency"
            value={form.frequency}
            onChange={(e) => updateField('frequency', e.target.value)}
            placeholder="Annual / Monthly…"
          />
          <TextAreaField
            className="span-2"
            label="Summary"
            value={form.summary}
            onChange={(e) => updateField('summary', e.target.value)}
          />
          <TextField
            className="span-2"
            label="Image URL"
            type="url"
            value={form.imageUrl}
            onChange={(e) => updateField('imageUrl', e.target.value)}
            error={fieldErrors.imageUrl}
          />
          <TextField
            className="span-2"
            label="Details URL"
            type="url"
            value={form.detailsUrl}
            onChange={(e) => updateField('detailsUrl', e.target.value)}
            error={fieldErrors.detailsUrl}
            hint="Optional public page or registration link."
          />
          <div className="span-2">
            <ToggleField
              label="Published"
              checked={form.published}
              onChange={(checked) => updateField('published', checked)}
              hint="Only published programs should appear on the public site."
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
            {saving ? 'Saving…' : isNew ? 'Create program' : 'Save changes'}
          </Button>
          <Link to="/programs" className="btn btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
