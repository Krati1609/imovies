# Roles and Responsibilities

| Role | Who | Can do | Cannot do |
|---|---|---|---|
| **Guest** | Visitor, not logged in | Browse movies, view details and showtimes, view seat availability | Book tickets, see bookings |
| **User** | Registered customer | Everything a guest can, plus book seats, view own bookings, cancel own bookings | Manage movies/shows, see other users' bookings |
| **Admin** | Cinema staff | Everything a user can, plus add/edit/delete movies, theaters and shows, view all bookings | N/A |

## Responsibilities by component

| Component | Responsibility |
|---|---|
| React client | Render UI, hold the token, guard routes by role, call the API |
| Express API | Validate input, enforce authentication and role checks, apply business rules |
| MongoDB | Store users, movies, theaters, shows and bookings |

## How roles are enforced

- On the server, the `protect` middleware verifies the JWT, and the `adminOnly` middleware checks `req.user.role === "admin"`.
- On the client, protected routes redirect guests to login, and admin pages are hidden from normal users. This is a convenience only, because the server is the real gatekeeper.
- Users can only read or cancel bookings where `booking.user` matches their own id.
