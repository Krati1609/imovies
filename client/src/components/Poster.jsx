import { useMemo, useState } from 'react'

// Deep poster colours. A movie always gets the same one, picked from its title.
const COLOURS = ['#7A1630', '#1F3A5F', '#2F4B3C', '#5B3A1E', '#3D2B5E', '#8A3B12', '#16506B']

// Image types we look for when a movie has no poster address saved.
const EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp']

function colourFor(title = '') {
  let hash = 0
  for (const ch of title) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return COLOURS[hash % COLOURS.length]
}

// "The Dark Knight" -> "the-dark-knight"
const slugify = (title = '') => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

// Where to look for a poster, best guess first: the saved address, then
// client/public/posters/<movie-name>.<jpg | jpeg | png | webp>.
function posterCandidates(movie) {
  const slug = slugify(movie.title)
  const guesses = EXTENSIONS.map((ext) => `/posters/${slug}.${ext}`)
  return [...new Set([movie.posterUrl, ...guesses].filter(Boolean))]
}

// Shows the movie's poster image, or a typographic poster when no image is found.
export default function Poster({ movie, className = '' }) {
  const urls = useMemo(() => posterCandidates(movie), [movie])
  const [attempt, setAttempt] = useState(0) // which candidate we are on; moves on when one fails to load

  if (attempt < urls.length) {
    return (
      <div className={`poster ${className}`}>
        <img
          key={urls[attempt]}
          src={urls[attempt]}
          alt={`${movie.title} poster`}
          onError={() => setAttempt((a) => a + 1)}
        />
      </div>
    )
  }

  return (
    <div className={`poster poster-type ${className}`} style={{ background: colourFor(movie.title) }}>
      <span className="poster-title">{movie.title}</span>
      <span className="poster-year">
        {movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : movie.language}
      </span>
    </div>
  )
}