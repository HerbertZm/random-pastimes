import { NavLink, Outlet } from 'react-router-dom'
import './Layout.css'

export function Layout() {
  return (
    <div className="layout">
      <header className="layout__header">
        <h1 className="layout__title">Random Pastimes</h1>
        <nav className="layout__nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `layout__nav-link${isActive ? ' layout__nav-link--active' : ''}`
            }
          >
            Play
          </NavLink>
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `layout__nav-link${isActive ? ' layout__nav-link--active' : ''}`
            }
          >
            Admin
          </NavLink>
        </nav>
      </header>
      <main className="layout__main">
        <Outlet />
      </main>
    </div>
  )
}
