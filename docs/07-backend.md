# Backend Development

This covers the five backend cards: structure, development and explanation, MongoDB configuration, database connection, and schemas and models.

## 1. Backend structure

```
server/
├── server.js            Entry point: middleware, routes, error handling, start-up
├── seed.js              Fills the database with an admin, sample movies and shows
├── smoke-test.js        End-to-end API check (run with: npm run smoke)
├── .env.example         Template for local settings
├── config/db.js         MongoDB connection
├── models/              User, Movie, Show, Booking (Mongoose schemas)
├── controllers/         authController, movieController, showController, bookingController
├── routes/              auth, movies, shows, bookings (URL to controller)
└── middleware/
    ├── auth.js          protect (JWT check) and adminOnly (role check)
    └── error.js         asyncHandler, notFound, errorHandler
```

A request flows like this: **route** matches the URL, then **middleware** checks the token and role, then the **controller** applies the logic using **models**, and finally JSON is sent back.

## 2. Configure MongoDB

You need a MongoDB the server can reach. Pick one:

**Option A: local MongoDB**
1. Install MongoDB Community Server from mongodb.com/try/download/community.
2. Start it (on Windows it runs as a service; otherwise run `mongod`).
3. The default address is `mongodb://127.0.0.1:27017`.

**Option B: MongoDB Atlas (cloud, free tier)**
1. Create a free cluster at mongodb.com/atlas.
2. Under Database Access, create a database user. Under Network Access, allow your IP.
3. Click Connect, then Drivers, and copy the connection string.

Then create `server/.env` by copying `server/.env.example`:

| Variable | Meaning |
|---|---|
| `PORT` | Port the API listens on (5000) |
| `MONGO_URI` | MongoDB address, ending with the database name, e.g. `mongodb://127.0.0.1:27017/imovies` |
| `JWT_SECRET` | Long random string used to sign tokens. Never share or commit it |
| `JWT_EXPIRES_IN` | How long a login lasts (7d) |
| `CLIENT_ORIGIN` | The React app's address, allowed by CORS (`http://localhost:5173`) |

## 3. Database connection (`config/db.js`)

`connectDB()` reads `MONGO_URI` and calls `mongoose.connect()`. It fails with a clear message if the variable is missing. `server.js` connects first and only then starts listening, so the API never accepts requests without a database. If the connection fails, the process exits with an error instead of hanging.

## 4. Schemas and models

| Model | Key fields | Notes |
|---|---|---|
| **User** | name, email (unique), password, role | Password is hashed with bcrypt before saving and is hidden from queries by default (`select: false`). Role is `user` or `admin` |
| **Movie** | title, description, genres, language, durationMins, rating, posterUrl, releaseDate | Searched with plain matching. It has no MongoDB text index, because that treats a `language` field as the text-search language and rejects values like Hindi |
| **Show** | movie, theatre, city, screen, startTime, price, rows, seatsPerRow, bookedSeats | `allSeats()` builds labels A1, A2, B1 ... from the grid |
| **Booking** | user, show, seats, totalAmount, status, reference | Reference is generated automatically; status is `confirmed` or `cancelled` |

## 5. Development and explanation

**Authentication.** `register` and `login` return a JWT plus a safe copy of the user (never the password). The `protect` middleware reads `Authorization: Bearer <token>`, verifies it, loads the user and attaches it as `req.user`. `adminOnly` then checks the role. Registration ignores any `role` sent by the client, so nobody can make themselves admin.

**Browsing.** `GET /api/movies` supports `search`, `genre` and `language` filters. User input is escaped before it becomes a regular expression, so it cannot be abused to run expensive patterns. `GET /api/movies/:id/shows` returns upcoming shows with the number of seats left.

**Booking, the core logic** (`bookingController.createBooking`):
1. Validate the seats: a non-empty list, at most 10, no duplicates, and every seat exists in the show's grid.
2. Reject shows that have already started.
3. **Claim the seats atomically:** one database operation updates the show only if *none* of the requested seats are already in `bookedSeats`. If two people click the same seat at the same moment, the database lets exactly one through and the other gets `409`.
4. Create the Booking. If that fails, the seats are released again.

**Cancelling.** Only the owner (or an admin) can cancel, and only before the show starts. The status flips from `confirmed` to `cancelled` in a single step, so a double click cannot release seats twice. Then the seats are removed from `bookedSeats`.

**Errors.** Controllers are wrapped in `asyncHandler`, and one `errorHandler` turns validation errors, bad ids and duplicates into clean JSON with the right status code (400, 409 and so on). Unknown API routes return a JSON 404.

## Running and testing

```bash
cd server
npm install
cp .env.example .env     # then edit JWT_SECRET
npm run seed             # admin@imovies.com / admin123, user@imovies.com / user123
npm run dev              # API on http://localhost:5000
npm run smoke            # in another terminal: end-to-end checks
```
