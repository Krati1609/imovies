# ER Diagram

MongoDB is document-based, but the data still has clear relationships. These are modelled with ObjectId references.

```mermaid
erDiagram
    USER ||--o{ BOOKING : makes
    SHOW ||--o{ BOOKING : "is booked in"
    MOVIE ||--o{ SHOW : "is screened as"
    THEATER ||--o{ SHOW : hosts

    USER {
        ObjectId _id PK
        string name
        string email UK
        string password "bcrypt hash"
        string role "user | admin"
        date createdAt
    }
    MOVIE {
        ObjectId _id PK
        string title
        string description
        string[] genre
        string language
        number duration "minutes"
        number rating
        string posterUrl
        date releaseDate
    }
    THEATER {
        ObjectId _id PK
        string name
        string city
        string address
    }
    SHOW {
        ObjectId _id PK
        ObjectId movie FK
        ObjectId theater FK
        string screen
        date startTime
        number price
        number rows
        number seatsPerRow
        string[] bookedSeats "e.g. A1, B4"
    }
    BOOKING {
        ObjectId _id PK
        ObjectId user FK
        ObjectId show FK
        string[] seats
        number totalAmount
        string status "confirmed | cancelled"
        date createdAt
    }
```

## Relationships

| Relationship | Type | Notes |
|---|---|---|
| User to Booking | one-to-many | A user can have many bookings |
| Movie to Show | one-to-many | One movie has many showtimes |
| Theater to Show | one-to-many | One theater hosts many shows |
| Show to Booking | one-to-many | Many bookings share a show, each with different seats |

## Notes

- `Show.bookedSeats` is the source of truth for availability. Cancelling a booking removes its seats from this array.
- `email` has a unique index, so duplicate accounts are rejected by the database too.
- Seat labels are built from the grid: row letter plus seat number (A1, A2 ... B1 ...).
