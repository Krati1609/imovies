import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Poster from './Poster'
import { fmtDuration } from '../utils/format'

const ROTATE_MS = 6000

// The big banner at the top of the home page. It rotates through the featured movies,
// and stops while the mouse or keyboard focus is on it, and for people who ask for less motion.
export default function Hero({ movies }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = movies.length

  useEffect(() => {
    if (count < 2 || paused) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), ROTATE_MS)
    return () => clearInterval(timer)
  }, [count, paused])

  if (!count) return null
  const movie = movies[index % count]
  const year = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : null
  const facts = [year, fmtDuration(movie.durationMins), movie.language, movie.genres.join(', ')].filter(Boolean)

  return (
    <section
      className="hero"
      aria-label="Featured movies"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* A blurred copy of the poster fills the banner behind everything. */}
      <div className="hero-bg" aria-hidden="true">
        <Poster key={movie._id} movie={movie} />
      </div>

      <div className="container hero-inner">
        <div className="hero-copy hero-slide" key={movie._id}>
          <h2 className="hero-title">{movie.title}</h2>
          <p className="hero-meta">
            {facts.join(', ')}
            {movie.rating > 0 && <span className="rating">{movie.rating.toFixed(1)}</span>}
          </p>
          {movie.description && <p className="hero-desc">{movie.description}</p>}
          <Link className="btn btn-primary btn-lg" to={`/movies/${movie._id}`}>Get tickets</Link>

          {count > 1 && (
            <div className="hero-dots" role="group" aria-label="Choose a featured movie">
              {movies.map((m, i) => (
                <button
                  key={m._id}
                  type="button"
                  className="hero-dot"
                  aria-label={`Show ${m.title}`}
                  aria-current={i === index}
                  onClick={() => setIndex(i)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="hero-poster hero-slide" key={`${movie._id}-poster`}>
          <Poster movie={movie} />
        </div>
      </div>
    </section>
  )
}
