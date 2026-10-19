import { fmtDateTime, money } from '../utils/format'

// A booking, drawn as a ticket stub.
export default function Ticket({ title, theatre, screen, startTime, seats, reference, amount, status = 'confirmed', children }) {
  const cancelled = status === 'cancelled'
  return (
    <article className={`ticket ${cancelled ? 'is-cancelled' : ''}`}>
      <div className="ticket-main">
        <h3 className="ticket-title">{title}</h3>
        <p className="ticket-line">{theatre}{screen ? `, ${screen}` : ''}</p>
        {startTime && <p className="ticket-line">{fmtDateTime(startTime)}</p>}
        <p className="ticket-seats">Seats {seats.join(', ')}</p>
        {cancelled && <span className="badge text-bg-secondary">Cancelled</span>}
        {children}
      </div>
      <div className="ticket-stub">
        <span className="stub-label">Booking ID</span>
        <span className="stub-ref">{reference}</span>
        <span className="stub-amount">{money(amount)}</span>
      </div>
    </article>
  )
}
