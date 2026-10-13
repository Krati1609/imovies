const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    genres: [{ type: String, trim: true }],
    language: { type: String, default: 'English' },
    durationMins: { type: Number, required: true, min: 1 },
    rating: { type: Number, min: 0, max: 10, default: 0 },
    certificate: { type: String, default: 'U/A' },
    posterUrl: { type: String, default: '' },
    releaseDate: { type: Date },
    cast: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

movieSchema.index({ title: 'text', genres: 'text' });

module.exports = mongoose.model('Movie', movieSchema);
