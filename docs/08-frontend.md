# 8 Frontend Development

This covers the two frontend cards: structure, and development and explanation. The client is a React single-page app built with Vite, styled with Bootstrap plus a custom stylesheet.

## 1. Frontend structure

```
client/
├── index.html               Page shell, loads the Archivo font
├── vite.config.js           Dev server on 5173, proxies /api to the Express server
├── package.json
└── src/
    ├── main.jsx             Entry: Router, AuthProvider, Bootstrap CSS
    ├── App.jsx              All routes in one place
    ├── index.css            Look and feel (colours, seats, tickets)
    ├── services/api.js      One axios instance, token handling, error messages
    ├── context/AuthContext.jsx   Who is logged in (user, login, register, logout)
    ├── utils/format.js      Dates, prices, durations, seat labels, page titles
    ├── components/
    │   ├── Navbar.jsx           Links change with login state and role
    │   ├── Poster.jsx           Poster image, or a typographic poster if none
    │   ├── MovieCard.jsx        Tile on the home page
    │   ├── SeatMap.jsx          The hall: screen, rows, seats, legend
    │   ├── Ticket.jsx           A booking drawn as a ticket stub
    │   ├── ProtectedRoute.jsx   Login and admin guard
    │   └── Notice.jsx           Loading spinner, alerts, empty states
    └── pages/
        ├── Home.jsx             Movie grid with search, genre and language filters
        ├── MovieDetails.jsx     Movie info and showtimes grouped by day
        ├── SeatSelection.jsx    Seat map, live availability, booking
        ├── Login.jsx, Register.jsx
        ├── MyBookings.jsx       Booking history and cancellation
        ├── Admin.jsx            Tabs for the three admin panels
        ├── admin/AdminMovies.jsx, AdminShows.jsx, AdminBookings.jsx
        └── NotFound.jsx
```

## 2. Routes

| URL | Page | Who can open it |
|---|---|---|
| `/` | Home | Everyone |
| `/movies/:id` | Movie details and showtimes | Everyone |
| `/shows/:id` | Seat selection | Everyone can look; logging in is needed to book |
| `/login`, `/register` | Auth forms | Everyone |
| `/my-bookings` | Booking history | Logged-in users |
| `/admin` | Admin panels | Admins only |

## 3. How it works

**Talking to the server.** Every request goes through `services/api.js`. An axios interceptor adds `Authorization: Bearer <token>` automatically, and `errorMessage()` turns a failed request into a plain sentence. In development, Vite forwards `/api` to `http://localhost:5000`, so the browser sees a single origin and CORS never gets in the way.

**Login state.** `AuthContext` keeps the user in React state and the token in `localStorage`. On page load, if a token exists, the app asks `/auth/me` who it belongs to, so a refresh keeps you logged in. Logging out clears both. Storage calls are wrapped in `try/catch`, so a browser that blocks storage does not break the app.

**Route guards.** `ProtectedRoute` sends guests to `/login` and remembers where they were going, so after logging in they land back on the same page. With `adminOnly`, a normal user is sent home. This only saves people from dead ends. The real security is on the server.

**Browsing.** The home page sends `search`, `genre` and `language` to `GET /api/movies`. Typing is debounced by 300 ms, so the server is not called on every keystroke. Out-of-date responses are ignored, so a slow earlier request cannot overwrite a newer one.

**Seat selection** (`SeatSelection.jsx`, the core screen):
1. Loads the show and draws the hall from `rows` and `seatsPerRow`. Seat names (A1, B4 ...) are built the same way as on the server.
2. Taken seats are disabled. Picking a seat toggles it, up to 10, and the total updates instantly.
3. **Real-time availability:** the show is re-fetched every 5 seconds while the tab is visible. If someone else takes a seat you had picked, it is removed from your selection and a message says so.
4. **Booking:** `POST /api/bookings`. On success a ticket confirmation is shown. If the server answers 409 (a seat was taken a moment ago), the error is shown, the map refreshes and the selection is cleared.
5. Guests can pick seats, but the button reads "Log in to book" and takes them to login first.

**Tickets and cancelling.** Bookings are shown as ticket stubs with the booking ID and amount. A confirmed booking for a future show has a Cancel button, and the seats are freed on the server.

**Admin.** Three tabs: movies (add, edit, delete), shows (pick a movie, schedule or delete shows) and bookings (everyone's bookings). Server messages, such as "Delete this movie's shows first", are shown as they are.

**Accessibility and mobile.** Seats are real buttons with labels like "Seat A1, available", so keyboard and screen-reader users can book. Focus is clearly visible, forms have labels, and motion is switched off for people who ask for reduced motion. On phones the seats shrink so a 10-seat row fits without sideways scrolling.

## 4. Design choices

The look is built around a cinema hall rather than a generic dark template: ink-navy and paper-white, with velvet red (the colour of cinema seats) as the main colour and brass for selected seats. Movie tiles are square-cornered posters, and when a movie has no image a typographic poster is generated from its title. Bookings use a ticket-stub shape with a tear line.

## 5. Running it

```bash
cd client
npm install
npm run dev      # http://localhost:5173  (start the server on port 5000 first)
npm run build    # production build into client/dist
```

To point the app at a server on another address, create `client/.env` with `VITE_API_URL=https://your-server/api`.
