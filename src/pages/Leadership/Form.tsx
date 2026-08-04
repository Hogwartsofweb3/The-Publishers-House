import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { TextAreaField, TextField, ToggleField } from '../../components/ui/Field'
import { isValidOptionalUrl } from '../../lib/firestore'
import {
  createLeader,
  getLeader,
  updateLeader,
  type LeaderInput,
} from '../../services/leadership'
import '../../components/ui/Button.css'
import '../../components/ui/Field.css'
import '../../components/ui/table.css'

const emptyForm: LeaderInput = {
  name: '',
  role: '',
  bio: '',
  photoUrl: '',
  order: 0,
  published: false,
}

export function LeaderFormPage() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()

  const [form, setForm] = useState<LeaderInput>(emptyForm)
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
        const item = await getLeader(id)
        if (!active) return
        if (!item) {
          setError('Leader not found.')
          return
        }
        setForm({
          name: item.name,
          role: item.role,
          bio: item.bio,
          photoUrl: item.photoUrl,
          order: item.order,
          published: item.published,
        })
      } catch {
        if (active) setError('Could not load this leader.')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [id, isNew])

  function updateField<K extends keyof LeaderInput>(key: K, value: LeaderInput[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function validate(input: LeaderInput): Record<string, string> {
    const next: Record<string, string> = {}
    if (!input.name.trim()) next.name = 'Name is required.'
    if (!input.role.trim()) next.role = 'Role is required.'
    if (!isValidOptionalUrl(input.photoUrl)) {
      next.photoUrl = 'Enter a valid http(s) URL or leave blank.'
    }
    if (!Number.isFinite(input.order)) next.order = 'Order must be a number.'
    return next
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const payload: LeaderInput = {
      ...form,
      name: form.name.trim(),
      role: form.role.trim(),
      bio: form.bio.trim(),
      photoUrl: form.photoUrl.trim(),
      order: Number(form.order) || 0,
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
      if (isNew) await createLeader(payload)
      else if (id) await updateLeader(id, payload)
      navigate('/leadership')
    } catch {
      setError(
        'Could not save leader. Confirm Firestore rules allow authenticated writes.',
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="list-loading cell-muted">Loading leader…</p>

  return (
    <div className="page">
      <div className="page-header-row">
        <header className="page-header">
          <p className="page-eyebrow">People</p>
          <h1 className="page-title">{isNew ? 'New leader' : 'Edit leader'}</h1>
          <p className="page-lead">
            Photo stays as a URL. Lower order numbers appear first on the public site.
          </p>
        </header>
        <Link to="/leadership" className="btn btn-secondary">
          Back to list
        </Link>
      </div>

      <form className="form-panel" onSubmit={(e) => void handleSubmit(e)}>
        <div className="form-grid">
          <TextField
            label="Name"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            error={fieldErrors.name}
            placeholder="Dr. Joshua Agunbiade"
            required
          />
          <TextField
            label="Role"
            value={form.role}
            onChange={(e) => updateField('role', e.target.value)}
            error={fieldErrors.role}
            placeholder="Lead Pastor"
            required
          />
          <TextField
            label="Display order"
            type="number"
            value={String(form.order)}
            onChange={(e) => updateField('order', Number(e.target.value))}
            error={fieldErrors.order}
            hint="0 appears first."
          />
          <TextField
            label="Photo URL"
            type="url"
            value={form.photoUrl}
            onChange={(e) => updateField('photoUrl', e.target.value)}
            error={fieldErrors.photoUrl}
          />
          <TextAreaField
            className="span-2"
            label="Bio"
            value={form.bio}
            onChange={(e) => updateField('bio', e.target.value)}
          />
          <div className="span-2">
            <ToggleField
              label="Published"
              checked={form.published}
              onChange={(checked) => updateField('published', checked)}
              hint="Only published leaders should appear on the public site."
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
            {saving ? 'Saving…' : isNew ? 'Create leader' : 'Save changes'}
          </Button>
          <Link to="/leadership" className="btn btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
