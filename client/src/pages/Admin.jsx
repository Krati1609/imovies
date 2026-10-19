import { useState } from 'react'
import AdminMovies from './admin/AdminMovies'
import AdminShows from './admin/AdminShows'
import AdminBookings from './admin/AdminBookings'
import { usePageTitle } from '../utils/format'

const TABS = [
  { id: 'movies', label: 'Movies', Panel: AdminMovies },
  { id: 'shows', label: 'Shows', Panel: AdminShows },
  { id: 'bookings', label: 'Bookings', Panel: AdminBookings },
]

export default function Admin() {
  usePageTitle('Admin')
  const [active, setActive] = useState('movies')
  const { Panel } = TABS.find((t) => t.id === active)

  return (
    <main className="container py-5">
      <h1 className="h2 mb-4">Admin</h1>
      <ul className="nav nav-tabs admin-tabs mb-4" role="tablist">
        {TABS.map((t) => (
          <li className="nav-item" role="presentation" key={t.id}>
            <button
              role="tab"
              aria-selected={active === t.id}
              className={`nav-link ${active === t.id ? 'active' : ''}`}
              onClick={() => setActive(t.id)}
            >
              {t.label}
            </button>
          </li>
        ))}
      </ul>
      <Panel />
    </main>
  )
}
