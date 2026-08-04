import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import './Field.css'

type FieldBaseProps = {
  label: string
  hint?: string
  error?: string
  children?: ReactNode
}

export function Field({
  label,
  hint,
  error,
  children,
  className = '',
}: FieldBaseProps & { className?: string }) {
  return (
    <label className={`field-block${className ? ` ${className}` : ''}`}>
      <span className="field-label">{label}</span>
      {children}
      {hint ? <span className="field-hint">{hint}</span> : null}
      {error ? (
        <span className="field-error" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  )
}

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> & {
  label: string
  hint?: string
  error?: string
  className?: string
}

export function TextField({ label, hint, error, className, ...props }: TextFieldProps) {
  return (
    <Field label={label} hint={hint} error={error} className={className}>
      <input className="field-input" {...props} />
    </Field>
  )
}

type TextAreaFieldProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> & {
  label: string
  hint?: string
  error?: string
  className?: string
}

export function TextAreaField({
  label,
  hint,
  error,
  className,
  ...props
}: TextAreaFieldProps) {
  return (
    <Field label={label} hint={hint} error={error} className={className}>
      <textarea className="field-input field-textarea" {...props} />
    </Field>
  )
}

type ToggleFieldProps = {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  hint?: string
}

export function ToggleField({ label, checked, onChange, hint }: ToggleFieldProps) {
  return (
    <label className="toggle-field">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>
        <span className="toggle-label">{label}</span>
        {hint ? <span className="field-hint">{hint}</span> : null}
      </span>
    </label>
  )
}
