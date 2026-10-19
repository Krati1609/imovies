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

// Note: there is deliberately no MongoDB text index here. A text index treats a field called
// "language" as the text-search language, and rejects values like "Hindi". Searching is done
// with plain matching in movieController instead.

module.exports = mongoose.model('Movie', movieSchema);