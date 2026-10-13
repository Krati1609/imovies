const mongoose = require('mongoose');

// A Show is one screening of a movie: a theatre + screen + start time + seat map.
const showSchema = new mongoose.Schema(
  {
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true, index: true },
    theatre: { type: String, required: true, trim: true },
    city: { type: String, default: 'Bhopal', trim: true },
    screen: { type: String, default: 'Screen 1' },
    startTime: { type: Date, required: true, index: true },
    price: { type: Number, required: true, min: 0 },
    rows: { type: Number, default: 8, min: 1, max: 26 }, // A..Z
    seatsPerRow: { type: Number, default: 10, min: 1, max: 30 },
    bookedSeats: { type: [String], default: [] },
  },
  { timestamps: true }
);

showSchema.methods.allSeats = function () {
  const seats = [];
  for (let r = 0; r < this.rows; r++) {
    for (let c = 1; c <= this.seatsPerRow; c++) {
      seats.push(`${String.fromCharCode(65 + r)}${c}`);
    }
  }
  return seats;
};

module.exports = mongoose.model('Show', showSchema);
