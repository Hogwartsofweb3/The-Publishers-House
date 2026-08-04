import { Link } from 'react-router-dom'
import './Dashboard.css'

const sections = [
  {
    to: '/sermons',
    title: 'Sermons',
    copy: 'Teachings with video, audio, and study guide links.',
  },
  {
    to: '/events',
    title: 'Events',
    copy: 'Gatherings, locations, and registration links.',
  },
  {
    to: '/articles',
    title: 'Articles',
    copy: 'Written teaching for the public site.',
  },
  {
    to: '/programs',
    title: 'Programs',
    copy: 'FOL, Merismos, Jesus Convention, The Forge, and more.',
  },
  {
    to: '/leadership',
    title: 'Leadership',
    copy: 'Names, roles, bios, and photos by display order.',
  },
]

export function DashboardPage() {
  return (
    <div className="page">
      <header className="page-header">
        <p className="page-eyebrow">Overview</p>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-lead">
          Manage what the public site publishes. Open a section to create, edit, or
          publish content.
        </p>
      </header>

      <ul className="dash-grid">
        {sections.map((section) => (
          <li key={section.to}>
            <Link to={section.to} className="dash-tile">
              <h2>{section.title}</h2>
              <p>{section.copy}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
