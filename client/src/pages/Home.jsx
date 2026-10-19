import { useEffect, useRef, useState } from 'react'
import api, { errorMessage } from '../services/api'
import MovieCard from '../components/MovieCard'
import { Empty, Loading, Notice } from '../components/Notice'
import { usePageTitle } from '../utils/format'

export default function Home() {
  usePageTitle('Movies')
  const [movies, setMovies] = useState([])
  const [options, setOptions] = useState({ genres: [], languages: [] })
  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('')
  const [language, setLanguage] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const optionsLoaded = useRef(false)

  // Wait until the person stops typing before asking the server.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api
      .get('/movies', { params: { search: debouncedSearch, genre, language } })
      .then((res) => {
        if (cancelled) return
        setMovies(res.data)
        setError('')
        // Build the filter lists once, from the first (unfiltered) result.
        if (!optionsLoaded.current) {
          optionsLoaded.current = true
          setOptions({
            genres: [...new Set(res.data.flatMap((m) => m.genres))].sort(),
            languages: [...new Set(res.data.map((m) => m.language))].sort(),
          })
        }
      })
      .catch((err) => !cancelled && setError(errorMessage(err)))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [debouncedSearch, genre, language])

  const filtering = Boolean(debouncedSearch || genre || language)

  function clearFilters() {
    setSearch('')
    setDebouncedSearch('')
    setGenre('')
    setLanguage('')
  }

  return (
    <>
      <header className="marquee">
        <div className="container">
          <h1 className="marquee-title">Now showing</h1>
          <form className="filters" role="search" onSubmit={(e) => e.preventDefault()}>
            <label className="visually-hidden" htmlFor="search">Search by title</label>
            <input
              id="search"
              className="form-control"
              type="search"
              placeholder="Search by title"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <label className="visually-hidden" htmlFor="genre">Genre</label>
            <select id="genre" className="form-select" value={genre} onChange={(e) => setGenre(e.target.value)}>
              <option value="">All genres</option>
              {options.genres.map((g) => <option key={g}>{g}</option>)}
            </select>
            <label className="visually-hidden" htmlFor="language">Language</label>
            <select id="language" className="form-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="">All languages</option>
              {options.languages.map((l) => <option key={l}>{l}</option>)}
            </select>
          </form>
        </div>
      </header>

      <main className="container py-5">
        <Notice>{error}</Notice>
        {loading && !movies.length ? (
          <Loading label="Loading movies" />
        ) : movies.length === 0 && !error ? (
          <Empty title={filtering ? 'No movies match your search' : 'No movies yet'}>
            {filtering ? (
              <button className="btn btn-link p-0" onClick={clearFilters}>Clear filters</button>
            ) : (
              'Movies will appear here once an admin adds them.'
            )}
          </Empty>
        ) : (
          <div className="movie-grid">
            {movies.map((m) => <MovieCard key={m._id} movie={m} />)}
          </div>
        )}
      </main>
    </>
  )
}
