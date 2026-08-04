import type { ReactNode } from 'react'
import './EmptyState.css'

type EmptyStateProps = {
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <h2 className="empty-state-title">{title}</h2>
      <p className="empty-state-copy">{description}</p>
      {action ? <div className="empty-state-action">{action}</div> : null}
    </div>
  )
}
