import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import './Shell.css'

export function Shell() {
  const [navOpen, setNavOpen] = useState(false)

  return (
    <div className="shell">
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <div className="shell-main">
        <header className="shell-topbar">
          <button
            type="button"
            className="shell-menu"
            aria-label="Open navigation"
            onClick={() => setNavOpen(true)}
          >
            <span />
            <span />
            <span />
          </button>
          <img
            src="/tph-symbol.png"
            alt=""
            className="shell-symbol"
            width={36}
            height={36}
          />
          <p className="shell-topbar-title">The Publishers House</p>
        </header>
        <main className="shell-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
