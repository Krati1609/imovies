// Fills the database with an admin account, sample movies and shows.
// Run with:  npm run seed      (WARNING: it clears existing data first)
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Movie = require('./models/Movie');
const Show = require('./models/Show');
const Booking = require('./models/Booking');

const movies = [
  { title: 'Inception', genres: ['Sci-Fi', 'Thriller'], language: 'English', durationMins: 148, rating: 8.8, certificate: 'U/A', releaseDate: '2010-07-16', description: 'A thief who steals secrets through dreams is offered one last job: planting an idea in a target\'s mind.' },
  { title: 'Interstellar', genres: ['Sci-Fi', 'Drama'], language: 'English', durationMins: 169, rating: 8.7, certificate: 'U/A', releaseDate: '2014-11-07', description: 'Explorers travel through a wormhole in search of a new home for humanity.' },
  { title: 'The Dark Knight', genres: ['Action', 'Crime'], language: 'English', durationMins: 152, rating: 9.0, certificate: 'U/A', releaseDate: '2008-07-18', description: 'Batman faces the Joker, a criminal mastermind who pushes Gotham into chaos.' },
  { title: '3 Idiots', genres: ['Comedy', 'Drama'], language: 'Hindi', durationMins: 170, rating: 8.4, certificate: 'U', releaseDate: '2009-12-25', description: 'Two friends search for their long-lost college buddy and recall how he changed their view of education.' },
  { title: 'Dangal', genres: ['Drama', 'Sports'], language: 'Hindi', durationMins: 161, rating: 8.3, certificate: 'U', releaseDate: '2016-12-23', description: 'A former wrestler trains his daughters to become world-class wrestlers.' },
  { title: 'Spirited Away', genres: ['Animation', 'Fantasy'], language: 'Japanese', durationMins: 125, rating: 8.6, certificate: 'U', releaseDate: '2001-07-20', description: 'A girl wanders into a world of spirits and must work to free her parents.' },
];

const theatres = [
  { theatre: 'INOX City Mall', city: 'Bhopal', screen: 'Screen 1', price: 250 },
  { theatre: 'PVR DB Mall', city: 'Bhopal', screen: 'Screen 2', price: 300 },
];

// Today at the given hour, plus dayOffset days.
function at(dayOffset, hour) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, 0, 0, 0);
  return d;
}

async function seed() {
  await connectDB();
  // Drop any index in the database that the models no longer define
  // (an older version created a text index that rejects languages like "Hindi").
  await Movie.syncIndexes();
  await Promise.all([User.deleteMany(), Movie.deleteMany(), Show.deleteMany(), Booking.deleteMany()]);

  // Passwords are hashed by the User model's pre-save hook.
  await User.create({ name: 'Admin', email: 'admin@imovies.com', password: 'admin123', role: 'admin' });
  await User.create({ name: 'Demo User', email: 'user@imovies.com', password: 'user123' });

  const created = await Movie.insertMany(movies);

  const shows = [];
  created.forEach((movie, i) => {
    theatres.forEach((t, j) => {
      [1, 2, 3].forEach((day) => {
        shows.push({ movie: movie._id, ...t, startTime: at(day, 12 + ((i + j) % 4) * 2 + 1) });
      });
    });
  });
  await Show.insertMany(shows);

  console.log(`Seeded ${created.length} movies and ${shows.length} shows.`);
  console.log('Admin login: admin@imovies.com / admin123');
  console.log('User login:  user@imovies.com / user123');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});