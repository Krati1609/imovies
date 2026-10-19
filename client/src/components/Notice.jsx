export function Loading({ label = 'Loading' }) {
  return (
    <div className="d-flex justify-content-center py-5" role="status">
      <div className="spinner-border text-secondary" aria-hidden="true" />
      <span className="visually-hidden">{label}</span>
    </div>
  )
}

// type: "danger" | "success" | "warning" | "info"
export function Notice({ type = 'danger', children }) {
  if (!children) return null
  return (
    <div className={`alert alert-${type}`} role={type === 'danger' ? 'alert' : 'status'}>
      {children}
    </div>
  )
}

export function Empty({ title, children }) {
  return (
    <div className="empty">
      <h2 className="h4">{title}</h2>
      {children && <p className="mb-0">{children}</p>}
    </div>
  )
}
