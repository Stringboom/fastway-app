export default function Spinner({ message = 'Loading…' }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 text-secondary gap-3">
      <div
        className="spinner-border"
        style={{ color: 'var(--fw-red)', width: '2.5rem', height: '2.5rem' }}
        role="status"
        aria-label="Loading"
      />
      <span className="small">{message}</span>
    </div>
  )
}
