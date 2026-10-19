import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import api, { errorMessage } from '../services/api'
import { useAuth } from '../context/AuthContext'
import SeatMap from '../components/SeatMap'
import Ticket from '../components/Ticket'
import { Loading, Notice } from '../components/Notice'
import { fmtDateTime, money, usePageTitle } from '../utils/format'

const POLL_MS = 5000 // how often the seat map refreshes
const MAX_SEATS = 10 // same limit as the server

export default function SeatSelection() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [show, setShow] = useState(null)
  const [selected, setSelected] = useState([])
  const [booking, setBooking] = useState(null) // set after a successful booking
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  usePageTitle(show ? `Seats for ${show.movie.title}` : 'Choose seats')

  const loadShow = useCallback(async () => {
    try {
      const { data } = await api.get(`/shows/${id}`)
      setShow(data)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadShow()
  }, [loadShow])

  // Real-time availability: refresh the seat map every few seconds while the tab is visible.
  useEffect(() => {
    if (booking) return undefined
    const timer = setInterval(() => {
      if (!document.hidden) loadShow()
    }, POLL_MS)
    return () => clearInterval(timer)
  }, [loadShow, booking])

  // If someone else takes a seat you picked, drop it from your selection and tell you.
  useEffect(() => {
    if (!show) return
    const taken = selected.filter((s) => show.bookedSeats.includes(s))
    if (taken.length) {
      setSelected((sel) => sel.filter((s) => !taken.includes(s)))
      setNotice(`${taken.join(', ')} just got booked by someone else. Pick another seat.`)
    }
  }, [show, selected])

  function toggleSeat(label) {
    setNotice('')
    setError('')
    setSelected((sel) => {
      if (sel.includes(label)) return sel.filter((s) => s !== label)
      if (sel.length >= MAX_SEATS) {
        setNotice(`You can book up to ${MAX_SEATS} seats at a time.`)
        return sel
      }
      return [...sel, label].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    })
  }

  async function handleBook() {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } })
      return
    }
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const { data } = await api.post('/bookings', { showId: id, seats: selected })
      setBooking(data)
      setSelected([])
      await loadShow()
    } catch (err) {
      setError(errorMessage(err))
      setSelected([])
      await loadShow() // refresh so the newly taken seats show as taken
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <Loading label="Loading seats" />
  if (!show) {
    return (
      <div className="container py-5">
        <Notice>{error || 'Show not found'}</Notice>
        <Link to="/">Back to all movies</Link>
      </div>
    )
  }

  const total = show.price * selected.length

  if (booking) {
    return (
      <main className="container py-5 confirmation">
        <h1 className="h2 mb-1">You're booked</h1>
        <p className="text-secondary mb-4">Show this booking ID at the cinema.</p>
        <Ticket
          title={show.movie.title}
          theatre={show.theatre}
          screen={show.screen}
          startTime={show.startTime}
          seats={booking.seats}
          reference={booking.reference}
          amount={booking.totalAmount}
        />
        <div className="d-flex gap-3 mt-4">
          <Link className="btn btn-primary" to="/my-bookings">View my bookings</Link>
          <Link className="btn btn-outline-dark" to="/">Book another movie</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="container py-5">
      <Link to={`/movies/${show.movie._id}`} className="back-link">Back to {show.movie.title}</Link>
      <h1 className="h2 mt-2">{show.movie.title}</h1>
      <p className="text-secondary">
        {show.theatre}, {show.screen}. {fmtDateTime(show.startTime)}. {money(show.price)} per seat.
      </p>

      <div className="row g-4 mt-1">
        <div className="col-12 col-lg-8">
          <div className="hall-wrap">
            <SeatMap
              rows={show.rows}
              seatsPerRow={show.seatsPerRow}
              bookedSeats={show.bookedSeats}
              selected={selected}
              onToggle={toggleSeat}
              disabled={busy}
            />
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <aside className="summary" aria-live="polite">
            <h2 className="h5">Your seats</h2>
            {selected.length === 0 ? (
              <p className="text-secondary">Tap a seat to select it.</p>
            ) : (
              <>
                <p className="summary-seats">{selected.join(', ')}</p>
                <p className="summary-total">
                  {selected.length} {selected.length === 1 ? 'seat' : 'seats'}, <strong>{money(total)}</strong>
                </p>
              </>
            )}
            <Notice type="warning">{notice}</Notice>
            <Notice>{error}</Notice>
            <button
              className="btn btn-primary w-100"
              disabled={selected.length === 0 || busy}
              onClick={handleBook}
            >
              {busy ? 'Booking...' : user ? `Book ${selected.length || ''} ${selected.length === 1 ? 'seat' : 'seats'}`.replace('  ', ' ') : 'Log in to book'}
            </button>
          </aside>
        </div>
      </div>
    </main>
  )
}
