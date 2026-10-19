import { useEffect, useState } from 'react'
import api, { errorMessage } from '../../services/api'
import { Loading, Notice } from '../../components/Notice'
import { fmtDateTime, money } from '../../utils/format'

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/bookings')
      .then((res) => setBookings(res.data))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading />

  return (
    <>
      <Notice>{error}</Notice>
      <div className="table-responsive">
        <table className="table align-middle admin-table">
          <thead>
            <tr><th>Booking ID</th><th>Customer</th><th>Movie</th><th>Show time</th><th>Seats</th><th>Total</th><th>Status</th></tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id}>
                <td>{b.reference}</td>
                <td>{b.user?.name || 'Deleted user'}<br /><small className="text-secondary">{b.user?.email}</small></td>
                <td>{b.show?.movie?.title || 'Removed show'}</td>
                <td>{b.show ? fmtDateTime(b.show.startTime) : '-'}</td>
                <td>{b.seats.join(', ')}</td>
                <td>{money(b.totalAmount)}</td>
                <td>
                  <span className={`badge ${b.status === 'confirmed' ? 'text-bg-success' : 'text-bg-secondary'}`}>{b.status}</span>
                </td>
              </tr>
            ))}
            {bookings.length === 0 && !error && <tr><td colSpan="7" className="text-secondary">No bookings yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  )
}
