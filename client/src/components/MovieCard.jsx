import { Link } from 'react-router-dom'
import Poster from './Poster'
import { fmtDuration } from '../utils/format'

export default function MovieCard({ movie }) {
  return (
    <Link to={`/movies/${movie._id}`} className="movie-card">
      <Poster movie={movie} />
      <div className="movie-card-body">
        <h3 className="movie-card-title">{movie.title}</h3>
        <p className="movie-card-meta">
          {fmtDuration(movie.durationMins)}, {movie.language}
          {movie.rating > 0 && <span className="rating">{movie.rating.toFixed(1)}</span>}
        </p>
        <p className="movie-card-genres">{movie.genres.join(', ')}</p>
      </div>
    </Link>
  )
}
