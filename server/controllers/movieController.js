const Movie = require('../models/Movie');
const Show = require('../models/Show');
const { asyncHandler, httpError } = require('../middleware/error');

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// GET /api/movies?search=&genre=&language=
const listMovies = asyncHandler(async (req, res) => {
  const { search, genre, language } = req.query;
  const filter = {};
  if (search) filter.title = new RegExp(escapeRegex(String(search)), 'i');
  if (genre) filter.genres = new RegExp(`^${escapeRegex(String(genre))}$`, 'i');
  if (language) filter.language = new RegExp(`^${escapeRegex(String(language))}$`, 'i');

  const movies = await Movie.find(filter).sort({ releaseDate: -1 });
  res.json(movies);
});

// GET /api/movies/:id
const getMovie = asyncHandler(async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) throw httpError(404, 'Movie not found');
  res.json(movie);
});

// GET /api/movies/:id/shows -> upcoming shows for a movie, with availability counts
const getMovieShows = asyncHandler(async (req, res) => {
  const shows = await Show.find({
    movie: req.params.id,
    startTime: { $gte: new Date() },
  }).sort({ startTime: 1 });

  res.json(
    shows.map((s) => ({
      _id: s._id,
      theatre: s.theatre,
      city: s.city,
      screen: s.screen,
      startTime: s.startTime,
      price: s.price,
      totalSeats: s.rows * s.seatsPerRow,
      availableSeats: s.rows * s.seatsPerRow - s.bookedSeats.length,
    }))
  );
});

// POST /api/movies (admin)
const createMovie = asyncHandler(async (req, res) => {
  const movie = await Movie.create(req.body);
  res.status(201).json(movie);
});

// PUT /api/movies/:id (admin)
const updateMovie = asyncHandler(async (req, res) => {
  const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!movie) throw httpError(404, 'Movie not found');
  res.json(movie);
});

// DELETE /api/movies/:id (admin) - refused while the movie still has shows
const deleteMovie = asyncHandler(async (req, res) => {
  const hasShows = await Show.exists({ movie: req.params.id });
  if (hasShows) throw httpError(409, 'Delete this movie\'s shows first');
  const movie = await Movie.findByIdAndDelete(req.params.id);
  if (!movie) throw httpError(404, 'Movie not found');
  res.json({ message: 'Movie deleted' });
});

module.exports = { listMovies, getMovie, getMovieShows, createMovie, updateMovie, deleteMovie };
