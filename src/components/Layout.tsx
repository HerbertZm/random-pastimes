import { Outlet } from 'react-router-dom'
import './Layout.css'

export function Layout() {
  return (
    <div className="layout">
      <main className="layout__main">
        <Outlet />
      </main>
      <footer className="layout__footer">
        ™ &amp; ©2026 Wizards of the Coast LLC.
      </footer>
    </div>
  )
}
