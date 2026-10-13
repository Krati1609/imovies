# Features

## User features

- **Register and login** with email and password. Passwords are hashed with bcrypt and sessions use JWT.
- **Browse movies** in a card grid, with search by title and filters for genre and language.
- **Movie details** page with synopsis, duration, rating and upcoming showtimes.
- **Select a showtime** by theater, date and time.
- **Interactive seat map** with real-time availability. Booked seats are disabled and the selected seats are highlighted.
- **Book tickets** with an instant confirmation and a total price.
- **My bookings** page to view booking history.
- **Cancel a booking**, which releases the seats for others.

## Admin features

- **Manage movies**: add, edit and delete.
- **Manage theaters and shows**: schedule showtimes with pricing and seat-grid size.
- **View all bookings** across users.

## Platform features

- Secure authentication and protected routes (client and server).
- Role-based access control (user and admin).
- Double-booking prevention through atomic seat reservation.
- Input validation and consistent JSON error responses.
- Responsive, mobile-friendly UI built with Bootstrap.

## API overview

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create account |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | User | Current user profile |
| GET | `/api/movies` | Public | List/search movies |
| GET | `/api/movies/:id` | Public | Movie details |
| POST/PUT/DELETE | `/api/movies[/:id]` | Admin | Manage movies |
| GET | `/api/shows?movie=<id>` | Public | Showtimes for a movie |
| GET | `/api/shows/:id` | Public | Show details and seat map |
| POST | `/api/shows` | Admin | Create a show |
| POST | `/api/bookings` | User | Book seats |
| GET | `/api/bookings/mine` | User | My bookings |
| PATCH | `/api/bookings/:id/cancel` | User | Cancel a booking |
| GET | `/api/bookings` | Admin | All bookings |
