import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { errorMessage } from '../services/api'
import Ticket from '../components/Ticket'
import { Empty, Loading, Notice } from '../components/Notice'
import { usePageTitle } from '../utils/format'

export default function MyBookings() {
  usePageTitle('My bookings')
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [cancelling, setCancelling] = useState(null)

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/bookings/mine')
      setBookings(data)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleCancel(booking) {
    if (!window.confirm(`Cancel booking ${booking.reference}? The seats will be released.`)) return
    setCancelling(booking._id)
    setError('')
    setMessage('')
    try {
      await api.patch(`/bookings/${booking._id}/cancel`)
      setMessage(`Booking ${booking.reference} cancelled.`)
      await load()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setCancelling(null)
    }
  }

  if (loading) return <Loading label="Loading bookings" />

  return (
    <main className="container py-5">
      <h1 className="h2 mb-4">My bookings</h1>
      <Notice>{error}</Notice>
      <Notice type="success">{message}</Notice>

      {bookings.length === 0 ? (
        <Empty title="No bookings yet">
          <Link to="/">Find a movie</Link> and pick your seats.
        </Empty>
      ) : (
        <div className="ticket-list">
          {bookings.map((b) => {
            const show = b.show
            const upcoming = show && new Date(show.startTime) > new Date()
            return (
              <Ticket
                key={b._id}
                title={show?.movie?.title || 'Show no longer available'}
                theatre={show?.theatre}
                screen={show?.screen}
                startTime={show?.startTime}
                seats={b.seats}
                reference={b.reference}
                amount={b.totalAmount}
                status={b.status}
              >
                {b.status === 'confirmed' && upcoming && (
                  <button
                    className="btn btn-outline-danger btn-sm mt-3"
                    disabled={cancelling === b._id}
                    onClick={() => handleCancel(b)}
                  >
                    {cancelling === b._id ? 'Cancelling...' : 'Cancel booking'}
                  </button>
                )}
              </Ticket>
            )
          })}
        </div>
      )}
    </main>
  )
}
