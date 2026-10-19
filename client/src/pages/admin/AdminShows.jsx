import { useCallback, useEffect, useState } from 'react'
import api, { errorMessage } from '../../services/api'
import { Loading, Notice } from '../../components/Notice'
import { fmtDateTime, money } from '../../utils/format'

const EMPTY = { theatre: '', city: 'Bhopal', screen: 'Screen 1', startTime: '', price: '', rows: 8, seatsPerRow: 10 }

export default function AdminShows() {
  const [movies, setMovies] = useState([])
  const [movieId, setMovieId] = useState('')
  const [shows, setShows] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    api
      .get('/movies')
      .then((res) => {
        setMovies(res.data)
        if (res.data.length) setMovieId(res.data[0]._id)
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  const loadShows = useCallback(async () => {
    if (!movieId) return
    try {
      const { data } = await api.get(`/movies/${movieId}/shows`)
      setShows(data)
    } catch (err) {
      setError(errorMessage(err))
    }
  }, [movieId])

  useEffect(() => {
    loadShows()
  }, [loadShows])

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await api.post('/shows', {
        movie: movieId,
        theatre: form.theatre.trim(),
        city: form.city.trim(),
        screen: form.screen.trim(),
        startTime: new Date(form.startTime).toISOString(),
        price: Number(form.price),
        rows: Number(form.rows),
        seatsPerRow: Number(form.seatsPerRow),
      })
      setMessage('Show scheduled.')
      setForm((f) => ({ ...EMPTY, theatre: f.theatre, city: f.city, screen: f.screen, price: f.price }))
      await loadShows()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete(show) {
    if (!window.confirm(`Delete the ${fmtDateTime(show.startTime)} show at ${show.theatre}?`)) return
    setError('')
    setMessage('')
    try {
      await api.delete(`/shows/${show._id}`)
      setMessage('Show deleted.')
      await loadShows()
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  if (loading) return <Loading />
  if (movies.length === 0) return <Notice type="info">Add a movie first, then you can schedule shows for it.</Notice>

  return (
    <>
      <Notice>{error}</Notice>
      <Notice type="success">{message}</Notice>

      <div className="mb-4" style={{ maxWidth: 420 }}>
        <label className="form-label" htmlFor="s-movie">Movie</label>
        <select id="s-movie" className="form-select" value={movieId} onChange={(e) => setMovieId(e.target.value)}>
          {movies.map((m) => <option key={m._id} value={m._id}>{m.title}</option>)}
        </select>
      </div>

      <form className="admin-form" onSubmit={handleSubmit}>
        <h2 className="h5 mb-3">Schedule a show</h2>
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label" htmlFor="s-theatre">Theatre</label>
            <input id="s-theatre" className="form-control" required value={form.theatre} onChange={set('theatre')} />
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="s-city">City</label>
            <input id="s-city" className="form-control" value={form.city} onChange={set('city')} />
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="s-screen">Screen</label>
            <input id="s-screen" className="form-control" value={form.screen} onChange={set('screen')} />
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="s-time">Start time</label>
            <input id="s-time" type="datetime-local" className="form-control" required value={form.startTime} onChange={set('startTime')} />
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="s-price">Price per seat (INR)</label>
            <input id="s-price" type="number" min="0" className="form-control" required value={form.price} onChange={set('price')} />
          </div>
          <div className="col-6 col-md-2">
            <label className="form-label" htmlFor="s-rows">Rows</label>
            <input id="s-rows" type="number" min="1" max="26" className="form-control" required value={form.rows} onChange={set('rows')} />
          </div>
          <div className="col-6 col-md-2">
            <label className="form-label" htmlFor="s-seats">Seats per row</label>
            <input id="s-seats" type="number" min="1" max="30" className="form-control" required value={form.seatsPerRow} onChange={set('seatsPerRow')} />
          </div>
        </div>
        <button className="btn btn-primary mt-3" disabled={busy}>{busy ? 'Scheduling...' : 'Schedule show'}</button>
      </form>

      <h2 className="h5 mt-5 mb-3">Upcoming shows</h2>
      <div className="table-responsive">
        <table className="table align-middle admin-table">
          <thead>
            <tr><th>When</th><th>Where</th><th>Price</th><th>Seats left</th><th className="text-end">Actions</th></tr>
          </thead>
          <tbody>
            {shows.map((s) => (
              <tr key={s._id}>
                <td>{fmtDateTime(s.startTime)}</td>
                <td>{s.theatre}, {s.screen}</td>
                <td>{money(s.price)}</td>
                <td>{s.availableSeats} of {s.totalSeats}</td>
                <td className="text-end">
                  <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(s)}>Delete</button>
                </td>
              </tr>
            ))}
            {shows.length === 0 && <tr><td colSpan="5" className="text-secondary">No upcoming shows for this movie.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  )
}
