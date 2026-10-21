import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  function handleLogout() {
    logout()
    close()
    navigate('/')
  }

  return (
    <nav className="navbar navbar-expand-md navbar-dark site-nav">
      <div className="container">
        <Link className="navbar-brand" to="/" onClick={close}>
          IMovies
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          aria-controls="main-nav"
          aria-expanded={open}
          aria-label="Toggle navigation"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div id="main-nav" className={`collapse navbar-collapse ${open ? 'show' : ''}`}>
          <ul className="navbar-nav me-auto">
            {user && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/my-bookings" onClick={close}>My bookings</NavLink>
              </li>
            )}
            {user?.role === 'admin' && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin" onClick={close}>Admin</NavLink>
              </li>
            )}
          </ul>

          <ul className="navbar-nav align-items-md-center gap-md-2">
            {user ? (
              <>
                <li className="nav-item nav-user">{user.name}</li>
                <li className="nav-item">
                  <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>Log out</button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/login" onClick={close}>Log in</NavLink>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-primary btn-sm" to="/register" onClick={close}>Create account</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}
