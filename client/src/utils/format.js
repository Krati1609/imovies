import { useEffect } from 'react'

const dayFmt = new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
const timeFmt = new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' })
const moneyFmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })

export const fmtDay = (d) => dayFmt.format(new Date(d))
export const fmtTime = (d) => timeFmt.format(new Date(d))
export const fmtDateTime = (d) => `${fmtDay(d)}, ${fmtTime(d)}`
export const money = (n) => moneyFmt.format(n)

// 148 -> "2h 28m"
export function fmtDuration(mins) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h ? `${h}h ${m}m` : `${m}m`
}

// Stable key for grouping shows by calendar day.
export const dayKey = (d) => new Date(d).toDateString()

// Seat labels must match the server: row letter + seat number (A1, A2, ... B1 ...).
export const seatLabel = (row, col) => `${String.fromCharCode(65 + row)}${col}`

// Sets the browser tab title for a page.
// eslint-disable-next-line react-refresh/only-export-components
export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | IMovies` : 'IMovies'
  }, [title])
}
