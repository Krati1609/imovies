import { useEffect, useMemo, useRef, useState } from 'react'
import api, { errorMessage } from '../services/api'
import Hero from '../components/Hero'
import MovieCard, { ComingSoonCard } from '../components/MovieCard'
import { Empty, Loading, Notice } from '../components/Notice'
import { usePageTitle } from '../utils/format'

const FEATURED_COUNT = 5

// A movie is "coming soon" while its release date is still in the future.
const isUpcoming = (movie, now) => Boolean(movie.releaseDate) && new Date(movie.releaseDate).getTime() > now

export default function Home() {
  usePageTitle('Movies')
  const [movies, setMovies] = useState([])
  const [featured, setFeatured] = useState([])
  const [options, setOptions] = useState({ genres: [], languages: [] })
  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('')
  const [language, setLanguage] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const firstLoad = useRef(true)

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
        // The first (unfiltered) result also fills the filter lists and the top banner.
        if (firstLoad.current) {
          firstLoad.current = false
          const now = Date.now()
          setOptions({
            genres: [...new Set(res.data.flatMap((m) => m.genres))].sort(),
            languages: [...new Set(res.data.map((m) => m.language))].sort(),
          })
          setFeatured(
            res.data
              .filter((m) => !isUpcoming(m, now))
              .sort((a, b) => b.rating - a.rating)
              .slice(0, FEATURED_COUNT),
          )
        }
      })
      .catch((err) => !cancelled && setError(errorMessage(err)))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [debouncedSearch, genre, language])

  const { nowShowing, comingSoon } = useMemo(() => {
    const now = Date.now()
    return {
      nowShowing: movies.filter((m) => !isUpcoming(m, now)),
      comingSoon: movies
        .filter((m) => isUpcoming(m, now))
        .sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate)),
    }
  }, [movies])

  const filtering = Boolean(debouncedSearch || genre || language)

  function clearFilters() {
    setSearch('')
    setDebouncedSearch('')
    setGenre('')
    setLanguage('')
  }

  return (
    <>
      <h1 className="visually-hidden">IMovies: book cinema tickets online</h1>
      <Hero movies={featured} />

      <main className="container py-5">
        <Notice>{error}</Notice>

        <section aria-labelledby="now-showing">
          <div className="section-head">
            <h2 id="now-showing" className="section-title">Now showing</h2>
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

          {loading && !movies.length ? (
            <Loading label="Loading movies" />
          ) : nowShowing.length === 0 && !error ? (
            <Empty title={filtering ? 'No movies match your search' : 'No movies yet'}>
              {filtering ? (
                <button className="btn btn-link p-0" onClick={clearFilters}>Clear filters</button>
              ) : (
                'Movies will appear here once an admin adds them.'
              )}
            </Empty>
          ) : (
            <div className="movie-grid">
              {nowShowing.map((m) => <MovieCard key={m._id} movie={m} />)}
            </div>
          )}
        </section>

        {comingSoon.length > 0 && (
          <section className="soon-section" aria-labelledby="coming-soon">
            <div className="section-head">
              <h2 id="coming-soon" className="section-title">Coming soon</h2>
            </div>
            <div className="soon-grid">
              {comingSoon.map((m) => <ComingSoonCard key={m._id} movie={m} />)}
            </div>
          </section>
        )}
      </main>
    </>
  )
}
