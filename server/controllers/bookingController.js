const Show = require('../models/Show');
const Booking = require('../models/Booking');
const { asyncHandler, httpError } = require('../middleware/error');

const MAX_SEATS_PER_BOOKING = 10;

// Checks the seat list is well formed and exists in the show's seat grid.
// Returns a cleaned array, or throws a 400.
function validateSeats(show, seats) {
  if (!Array.isArray(seats) || seats.length === 0) {
    throw httpError(400, 'Select at least one seat');
  }
  if (seats.length > MAX_SEATS_PER_BOOKING) {
    throw httpError(400, `You can book at most ${MAX_SEATS_PER_BOOKING} seats at a time`);
  }
  const cleaned = seats.map((s) => String(s).trim().toUpperCase());
  if (new Set(cleaned).size !== cleaned.length) {
    throw httpError(400, 'Duplicate seats in request');
  }
  const valid = new Set(show.allSeats());
  const bad = cleaned.find((s) => !valid.has(s));
  if (bad) throw httpError(400, `Seat ${bad} does not exist in this show`);
  return cleaned;
}

// POST /api/bookings  { showId, seats: ["A1","A2"] }
const createBooking = asyncHandler(async (req, res) => {
  const { showId, seats } = req.body;
  const show = await Show.findById(showId);
  if (!show) throw httpError(404, 'Show not found');
  if (show.startTime <= new Date()) throw httpError(400, 'This show has already started');

  const cleaned = validateSeats(show, seats);

  // Atomic step: claim the seats only if NONE of them are booked yet.
  // The filter and the update happen in one database operation, so two people
  // clicking the same seat at the same moment cannot both succeed.
  const claimed = await Show.findOneAndUpdate(
    { _id: show._id, bookedSeats: { $nin: cleaned } },
    { $push: { bookedSeats: { $each: cleaned } } },
    { new: true }
  );
  if (!claimed) throw httpError(409, 'One or more seats are no longer available');

  try {
    const booking = await Booking.create({
      user: req.user._id,
      show: show._id,
      seats: cleaned,
      totalAmount: show.price * cleaned.length,
    });
    res.status(201).json(booking);
  } catch (err) {
    // If saving the booking failed, give the seats back.
    await Show.updateOne({ _id: show._id }, { $pullAll: { bookedSeats: cleaned } });
    throw err;
  }
});

// GET /api/bookings/mine
const myBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate({ path: 'show', populate: { path: 'movie', select: 'title posterUrl' } });
  res.json(bookings);
});

// PATCH /api/bookings/:id/cancel  (owner, or admin)
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw httpError(404, 'Booking not found');

  const isOwner = booking.user.equals(req.user._id);
  if (!isOwner && req.user.role !== 'admin') throw httpError(403, 'Not your booking');

  const show = await Show.findById(booking.show);
  if (show && show.startTime <= new Date()) {
    throw httpError(400, 'Cannot cancel after the show has started');
  }

  // Flip confirmed -> cancelled in one step, so a double click cannot release seats twice.
  const updated = await Booking.findOneAndUpdate(
    { _id: booking._id, status: 'confirmed' },
    { status: 'cancelled' },
    { new: true }
  );
  if (!updated) throw httpError(409, 'Booking is already cancelled');

  await Show.updateOne({ _id: booking.show }, { $pullAll: { bookedSeats: booking.seats } });
  res.json(updated);
});

// GET /api/bookings (admin)
const allBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find()
    .sort({ createdAt: -1 })
    .populate('user', 'name email')
    .populate({ path: 'show', populate: { path: 'movie', select: 'title' } });
  res.json(bookings);
});

module.exports = { createBooking, myBookings, cancelBooking, allBookings };
