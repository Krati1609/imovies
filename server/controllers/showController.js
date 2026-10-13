const Show = require('../models/Show');
const Movie = require('../models/Movie');
const Booking = require('../models/Booking');
const { asyncHandler, httpError } = require('../middleware/error');

// GET /api/shows/:id -> show details + live seat map (booked seats)
const getShow = asyncHandler(async (req, res) => {
  const show = await Show.findById(req.params.id).populate('movie');
  if (!show) throw httpError(404, 'Show not found');

  res.json({
    _id: show._id,
    movie: show.movie,
    theatre: show.theatre,
    city: show.city,
    screen: show.screen,
    startTime: show.startTime,
    price: show.price,
    rows: show.rows,
    seatsPerRow: show.seatsPerRow,
    bookedSeats: show.bookedSeats,
  });
});

// POST /api/shows (admin)
const createShow = asyncHandler(async (req, res) => {
  const movie = await Movie.findById(req.body.movie);
  if (!movie) throw httpError(404, 'Movie not found');
  const { bookedSeats, ...data } = req.body; // never accept pre-booked seats
  const show = await Show.create(data);
  res.status(201).json(show);
});

// DELETE /api/shows/:id (admin) - refused while confirmed bookings exist
const deleteShow = asyncHandler(async (req, res) => {
  const hasBookings = await Booking.exists({ show: req.params.id, status: 'confirmed' });
  if (hasBookings) throw httpError(409, 'This show has confirmed bookings');
  const show = await Show.findByIdAndDelete(req.params.id);
  if (!show) throw httpError(404, 'Show not found');
  res.json({ message: 'Show deleted' });
});

module.exports = { getShow, createShow, deleteShow };
