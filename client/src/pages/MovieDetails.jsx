import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api, { errorMessage } from '../services/api'
import Poster from '../components/Poster'
import { Empty, Loading, Notice } from '../components/Notice'
import { dayKey, fmtDay, fmtDuration, fmtTime, money, usePageTitle } from '../utils/format'

export default function MovieDetails() {
  const { id } = useParams()
  const [movie, setMovie] = useState(null)
  const [shows, setShows] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  usePageTitle(movie?.title)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([api.get(`/movies/${id}`), api.get(`/movies/${id}/shows`)])
      .then(([m, s]) => {
        if (cancelled) return
        setMovie(m.data)
        setShows(s.data)
      })
      .catch((err) => !cancelled && setError(errorMessage(err)))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [id])

  // Group showtimes by day: [["Fri, 16 Oct", [show, show]], ...]
  const days = useMemo(() => {
    const groups = new Map()
    shows.forEach((s) => {
      const key = dayKey(s.startTime)
      if (!groups.has(key)) groups.set(key, { label: fmtDay(s.startTime), shows: [] })
      groups.get(key).shows.push(s)
    })
    return [...groups.values()]
  }, [shows])

  if (loading) return <Loading label="Loading movie" />
  if (error || !movie) {
    return (
      <div className="container py-5">
        <Notice>{error || 'Movie not found'}</Notice>
        <Link to="/">Back to all movies</Link>
      </div>
    )
  }

  return (
    <main className="container py-5">
      <div className="row g-5">
        <div className="col-12 col-md-4 col-lg-3">
          <Poster movie={movie} />
        </div>

        <div className="col-12 col-md-8 col-lg-9">
          <h1 className="detail-title">{movie.title}</h1>
          <p className="detail-meta">
            {fmtDuration(movie.durationMins)}, {movie.language}, {movie.certificate}
            {movie.rating > 0 && <span className="rating">{movie.rating.toFixed(1)}</span>}
          </p>
          {movie.genres.length > 0 && (
            <p className="mb-3">
              {movie.genres.map((g) => <span className="genre-pill" key={g}>{g}</span>)}
            </p>
          )}
          {movie.description && <p className="detail-description">{movie.description}</p>}

          <h2 className="h3 mt-5 mb-3">Showtimes</h2>
          {days.length === 0 ? (
            <Empty title="No upcoming shows">Check back soon, or pick another movie.</Empty>
          ) : (
            days.map((day) => (
              <section className="show-day" key={day.label}>
                <h3 className="show-day-label">{day.label}</h3>
                <div className="show-list">
                  {day.shows.map((s) => {
                    const soldOut = s.availableSeats === 0
                    const content = (
                      <>
                        <span className="show-time">{fmtTime(s.startTime)}</span>
                        <span className="show-where">{s.theatre}, {s.screen}</span>
                        <span className="show-price">
                          {soldOut ? 'Sold out' : `${money(s.price)}, ${s.availableSeats} seats left`}
                        </span>
                      </>
                    )
                    return soldOut ? (
                      <div className="show-chip is-soldout" key={s._id}>{content}</div>
                    ) : (
                      <Link className="show-chip" to={`/shows/${s._id}`} key={s._id}>{content}</Link>
                    )
                  })}
                </div>
              </section>
            ))
          )}
        </div>
      </div>
    </main>
  )
}
