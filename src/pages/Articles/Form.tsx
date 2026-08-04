import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { TextAreaField, TextField, ToggleField } from '../../components/ui/Field'
import {
  formatTags,
  isValidOptionalUrl,
  parseTags,
  slugify,
} from '../../lib/firestore'
import {
  createArticle,
  getArticle,
  updateArticle,
  type ArticleInput,
} from '../../services/articles'
import '../../components/ui/Button.css'
import '../../components/ui/Field.css'
import '../../components/ui/table.css'

const emptyForm: ArticleInput = {
  title: '',
  slug: '',
  excerpt: '',
  body: '',
  coverImageUrl: '',
  author: '',
  categories: [],
  publishedAt: '',
  published: false,
}

export function ArticleFormPage() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()

  const [form, setForm] = useState<ArticleInput>(emptyForm)
  const [categoriesInput, setCategoriesInput] = useState('')
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
        const item = await getArticle(id)
        if (!active) return
        if (!item) {
          setError('Article not found.')
          return
        }
        setForm({
          title: item.title,
          slug: item.slug,
          excerpt: item.excerpt,
          body: item.body,
          coverImageUrl: item.coverImageUrl,
          author: item.author,
          categories: item.categories,
          publishedAt: item.publishedAt,
          published: item.published,
          order: item.order,
        })
        setCategoriesInput(formatTags(item.categories))
        setSlugTouched(true)
      } catch {
        if (active) setError('Could not load this article.')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [id, isNew])

  function updateField<K extends keyof ArticleInput>(key: K, value: ArticleInput[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function handleTitleChange(title: string) {
    setForm((current) => ({
      ...current,
      title,
      slug: slugTouched ? current.slug : slugify(title),
    }))
  }

  function validate(input: ArticleInput): Record<string, string> {
    const next: Record<string, string> = {}
    if (!input.title.trim()) next.title = 'Title is required.'
    if (!input.slug.trim()) next.slug = 'Slug is required.'
    if (!isValidOptionalUrl(input.coverImageUrl)) {
      next.coverImageUrl = 'Enter a valid http(s) URL or leave blank.'
    }
    return next
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const payload: ArticleInput = {
      ...form,
      title: form.title.trim(),
      slug: slugify(form.slug) || slugify(form.title),
      excerpt: form.excerpt.trim(),
      body: form.body.trim(),
      coverImageUrl: form.coverImageUrl.trim(),
      author: form.author.trim(),
      categories: parseTags(categoriesInput),
      publishedAt: form.publishedAt.trim(),
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
      if (isNew) await createArticle(payload)
      else if (id) await updateArticle(id, payload)
      navigate('/articles')
    } catch {
      setError(
        'Could not save article. Confirm Firestore rules allow authenticated writes.',
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="list-loading cell-muted">Loading article…</p>

  return (
    <div className="page">
      <div className="page-header-row">
        <header className="page-header">
          <p className="page-eyebrow">Writing</p>
          <h1 className="page-title">{isNew ? 'New article' : 'Edit article'}</h1>
          <p className="page-lead">
            Body supports markdown or plain text. Categories power public filters.
          </p>
        </header>
        <Link to="/articles" className="btn btn-secondary">
          Back to list
        </Link>
      </div>

      <form className="form-panel" onSubmit={(e) => void handleSubmit(e)}>
        <div className="form-grid">
          <TextField
            className="span-2"
            label="Title"
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            error={fieldErrors.title}
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
            hint="URL path segment, e.g. faith-that-works"
            required
          />
          <TextField
            label="Author"
            value={form.author}
            onChange={(e) => updateField('author', e.target.value)}
            placeholder="Dr. Joshua Agunbiade"
          />
          <TextField
            label="Publish date"
            type="date"
            value={form.publishedAt}
            onChange={(e) => updateField('publishedAt', e.target.value)}
          />
          <TextField
            label="Categories"
            value={categoriesInput}
            onChange={(e) => setCategoriesInput(e.target.value)}
            placeholder="Faith, Devotionals, Family"
            hint="Comma-separated."
          />
          <TextField
            className="span-2"
            label="Excerpt"
            value={form.excerpt}
            onChange={(e) => updateField('excerpt', e.target.value)}
          />
          <TextAreaField
            className="span-2"
            label="Body"
            value={form.body}
            onChange={(e) => updateField('body', e.target.value)}
            hint="Markdown or plain text."
          />
          <TextField
            className="span-2"
            label="Cover image URL"
            type="url"
            value={form.coverImageUrl}
            onChange={(e) => updateField('coverImageUrl', e.target.value)}
            error={fieldErrors.coverImageUrl}
          />
          <div className="span-2">
            <ToggleField
              label="Published"
              checked={form.published}
              onChange={(checked) => updateField('published', checked)}
              hint="Only published articles should appear on the public site."
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
            {saving ? 'Saving…' : isNew ? 'Create article' : 'Save changes'}
          </Button>
          <Link to="/articles" className="btn btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
