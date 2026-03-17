export default function Alert({ type = 'error', message, detail }) {
  const map = {
    error: { bs: 'danger', icon: 'bi-exclamation-circle-fill' },
    success: { bs: 'success', icon: 'bi-check-circle-fill' },
    info: { bs: 'info', icon: 'bi-info-circle-fill' },
  }
  const { bs, icon } = map[type] ?? map.error
  return (
    <div className={`alert alert-${bs} d-flex gap-2 align-items-start fade-in`} role="alert">
      <i className={`bi ${icon} flex-shrink-0 mt-1`} />
      <div>
        <strong>{message}</strong>
        {detail && <div className="mt-1 fw-normal" style={{ opacity: 0.85 }}>{detail}</div>}
      </div>
    </div>
  )
}
