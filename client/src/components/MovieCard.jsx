import { Link } from 'react-router-dom'
import Poster from './Poster'
import { fmtDay, fmtDuration } from '../utils/format'

// A movie that is showing now: poster, details and a button to pick a showtime.
export default function MovieCard({ movie }) {
  return (
    <article className="movie-card">
      <Link to={`/movies/${movie._id}`} className="movie-card-link">
        <Poster movie={movie} />
        <h3 className="movie-card-title">{movie.title}</h3>
      </Link>
      <p className="movie-card-meta">
        {fmtDuration(movie.durationMins)}, {movie.language}
        {movie.rating > 0 && <span className="rating">{movie.rating.toFixed(1)}</span>}
      </p>
      <p className="movie-card-genres">{movie.genres.join(', ')}</p>
      <Link className="btn btn-primary btn-sm" to={`/movies/${movie._id}`}>Get tickets</Link>
    </article>
  )
}

// A movie that has not been released yet: smaller, with its release date instead of a button.
export function ComingSoonCard({ movie }) {
  return (
    <Link to={`/movies/${movie._id}`} className="soon-card">
      <Poster movie={movie} />
      <h3 className="soon-title">{movie.title}</h3>
      <p className="soon-date">Releases {fmtDay(movie.releaseDate)}</p>
    </Link>
  )
}
