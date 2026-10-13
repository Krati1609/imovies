const express = require('express');
const {
  createBooking,
  myBookings,
  cancelBooking,
  allBookings,
} = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// "/mine" must be declared before any "/:id" route.
router.post('/', protect, createBooking);
router.get('/mine', protect, myBookings);
router.patch('/:id/cancel', protect, cancelBooking);
router.get('/', protect, adminOnly, allBookings);

module.exports = router;
