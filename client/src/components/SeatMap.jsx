import { seatLabel } from '../utils/format'

// Draws the hall: a screen, then rows of seats.
// Seats are buttons, so the map works with a keyboard and screen readers.
export default function SeatMap({ rows, seatsPerRow, bookedSeats, selected, onToggle, disabled }) {
  const booked = new Set(bookedSeats)
  const chosen = new Set(selected)
  // Leave an aisle in the middle of wider rows.
  const aisleAfter = seatsPerRow >= 8 ? Math.floor(seatsPerRow / 2) : null

  return (
    <div className="hall">
      <div className="screen" aria-hidden="true">
        <span>Screen this way</span>
      </div>

      <div className="seat-rows" role="group" aria-label="Seat map">
        {Array.from({ length: rows }, (_, r) => (
          <div className="seat-row" key={r}>
            <span className="row-label" aria-hidden="true">{String.fromCharCode(65 + r)}</span>
            <div className="seat-row-seats">
              {Array.from({ length: seatsPerRow }, (_, c) => {
                const label = seatLabel(r, c + 1)
                const isBooked = booked.has(label)
                const isChosen = chosen.has(label)
                return (
                  <span key={label} className="seat-slot">
                    <button
                      type="button"
                      className={`seat ${isBooked ? 'is-booked' : ''} ${isChosen ? 'is-selected' : ''}`}
                      disabled={isBooked || disabled}
                      aria-pressed={isChosen}
                      aria-label={`Seat ${label}, ${isBooked ? 'booked' : isChosen ? 'selected' : 'available'}`}
                      onClick={() => onToggle(label)}
                    >
                      {c + 1}
                    </button>
                    {aisleAfter === c + 1 && <span className="aisle" />}
                  </span>
                )
              })}
            </div>
            <span className="row-label" aria-hidden="true">{String.fromCharCode(65 + r)}</span>
          </div>
        ))}
      </div>

      <ul className="seat-legend">
        <li><span className="seat legend-seat" /> Available</li>
        <li><span className="seat legend-seat is-selected" /> Your pick</li>
        <li><span className="seat legend-seat is-booked" /> Taken</li>
      </ul>
    </div>
  )
}
