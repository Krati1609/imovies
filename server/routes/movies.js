const express = require('express');
const {
  listMovies,
  getMovie,
  getMovieShows,
  createMovie,
  updateMovie,
  deleteMovie,
} = require('../controllers/movieController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', listMovies);
router.get('/:id', getMovie);
router.get('/:id/shows', getMovieShows);

router.post('/', protect, adminOnly, createMovie);
router.put('/:id', protect, adminOnly, updateMovie);
router.delete('/:id', protect, adminOnly, deleteMovie);

module.exports = router;
