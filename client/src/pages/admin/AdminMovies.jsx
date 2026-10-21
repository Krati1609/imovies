import { useCallback, useEffect, useState } from 'react'
import api, { errorMessage } from '../../services/api'
import { Loading, Notice } from '../../components/Notice'
import { fmtDuration } from '../../utils/format'

const EMPTY = {
  title: '', description: '', genres: '', language: 'English',
  durationMins: '', rating: '', posterUrl: '', releaseDate: '',
}

export default function AdminMovies() {
  const [movies, setMovies] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/movies')
      setMovies(data)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  function startEdit(movie) {
    setEditingId(movie._id)
    setMessage('')
    setError('')
    setForm({
      title: movie.title,
      description: movie.description || '',
      genres: movie.genres.join(', '),
      language: movie.language,
      durationMins: String(movie.durationMins),
      rating: String(movie.rating ?? ''),
      posterUrl: movie.posterUrl || '',
      releaseDate: movie.releaseDate ? movie.releaseDate.slice(0, 10) : '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function reset() {
    setEditingId(null)
    setForm(EMPTY)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      genres: form.genres.split(',').map((g) => g.trim()).filter(Boolean),
      language: form.language.trim() || 'English',
      durationMins: Number(form.durationMins),
      rating: form.rating === '' ? 0 : Number(form.rating),
      posterUrl: form.posterUrl.trim(),
      ...(form.releaseDate ? { releaseDate: form.releaseDate } : {}),
    }
    try {
      if (editingId) {
        await api.put(`/movies/${editingId}`, payload)
        setMessage('Movie updated.')
      } else {
        await api.post('/movies', payload)
        setMessage('Movie added.')
      }
      reset()
      await load()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete(movie) {
    if (!window.confirm(`Delete "${movie.title}"?`)) return
    setError('')
    setMessage('')
    try {
      await api.delete(`/movies/${movie._id}`)
      setMessage(`"${movie.title}" deleted.`)
      if (editingId === movie._id) reset()
      await load()
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  return (
    <>
      <Notice>{error}</Notice>
      <Notice type="success">{message}</Notice>

      <form className="admin-form" onSubmit={handleSubmit}>
        <h2 className="h5 mb-3">{editingId ? 'Edit movie' : 'Add a movie'}</h2>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label" htmlFor="m-title">Title</label>
            <input id="m-title" className="form-control" required value={form.title} onChange={set('title')} />
          </div>
          <div className="col-md-3">
            <label className="form-label" htmlFor="m-language">Language</label>
            <input id="m-language" className="form-control" value={form.language} onChange={set('language')} />
          </div>
          <div className="col-md-3">
            <label className="form-label" htmlFor="m-duration">Duration (minutes)</label>
            <input id="m-duration" type="number" min="1" className="form-control" required value={form.durationMins} onChange={set('durationMins')} />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="m-genres">Genres</label>
            <input id="m-genres" className="form-control" placeholder="Sci-Fi, Thriller" value={form.genres} onChange={set('genres')} />
            <div className="form-text">Separate with commas.</div>
          </div>
          <div className="col-md-3">
            <label className="form-label" htmlFor="m-rating">Rating (0 to 10)</label>
            <input id="m-rating" type="number" min="0" max="10" step="0.1" className="form-control" value={form.rating} onChange={set('rating')} />
          </div>
          <div className="col-md-3">
            <label className="form-label" htmlFor="m-release">Release date</label>
            <input id="m-release" type="date" className="form-control" value={form.releaseDate} onChange={set('releaseDate')} />
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="m-poster">Poster image URL</label>
            <input id="m-poster" type="url" className="form-control" placeholder="https://" value={form.posterUrl} onChange={set('posterUrl')} />
            <div className="form-text">Optional. Without one, a typographic poster is shown.</div>
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="m-desc">Description</label>
            <textarea id="m-desc" rows="3" className="form-control" value={form.description} onChange={set('description')} />
          </div>
        </div>
        <div className="d-flex gap-2 mt-3">
          <button className="btn btn-primary" disabled={busy}>
            {busy ? 'Saving...' : editingId ? 'Save changes' : 'Add movie'}
          </button>
          {editingId && <button type="button" className="btn btn-outline-light" onClick={reset}>Cancel edit</button>}
        </div>
      </form>

      <h2 className="h5 mt-5 mb-3">All movies</h2>
      {loading ? (
        <Loading />
      ) : (
        <div className="table-responsive">
          <table className="table align-middle admin-table">
            <thead>
              <tr><th>Title</th><th>Language</th><th>Duration</th><th className="text-end">Actions</th></tr>
            </thead>
            <tbody>
              {movies.map((m) => (
                <tr key={m._id}>
                  <td>{m.title}</td>
                  <td>{m.language}</td>
                  <td>{fmtDuration(m.durationMins)}</td>
                  <td className="text-end text-nowrap">
                    <button className="btn btn-outline-light btn-sm me-2" onClick={() => startEdit(m)}>Edit</button>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(m)}>Delete</button>
                  </td>
                </tr>
              ))}
              {movies.length === 0 && <tr><td colSpan="4" className="text-secondary">No movies yet. Add the first one above.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
