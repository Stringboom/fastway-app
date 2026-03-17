import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useApi } from '../context/ApiContext'
import Spinner from '../components/Spinner'
import Alert from '../components/Alert'

const SCAN_BADGES = {
  D: { cls: 'bg-success',          label: 'Delivered',   icon: 'bi-check-circle-fill'       },
  T: { cls: 'bg-primary',           label: 'In Transit',  icon: 'bi-arrow-right-circle-fill' },
  P: { cls: 'bg-warning text-dark', label: 'Picked Up',   icon: 'bi-box-seam'                },
}

function scanBadge(type) {
  return SCAN_BADGES[type?.toUpperCase()] ?? { cls: 'bg-secondary', label: 'In Progress', icon: 'bi-circle-fill' }
}

function friendlyError(err, isApiError) {
  if (isApiError(err)) {
    const msg = err.response?.data?.error
    if (msg) return msg
    if (err.code === 'ECONNABORTED') return 'The request timed out. Please try again.'
    if (!err.response)               return 'Unable to reach the server.'
    if (err.response.status === 429) return 'Too many requests — please wait before trying again.'
    if (err.response.status === 404) return 'No tracking information found for this parcel number.'
    if (err.response.status >= 500)  return 'The Fastway API is temporarily unavailable.'
  }
  return err.message || 'An unexpected error occurred.'
}

function validateLabel(label) {
  if (!label.trim())                         return 'Please enter a tracking number.'
  if (!/^[a-zA-Z0-9]+$/.test(label.trim())) return 'Tracking numbers contain only letters and numbers.'
  if (label.trim().length < 8)               return 'Minimum 8 characters.'
  if (label.trim().length > 30)              return 'Maximum 30 characters.'
  return null
}

export default function TrackPage() {
  const { trackParcel, isApiError }     = useApi()
  const [searchParams, setSearchParams] = useSearchParams()
  const [label, setLabel]               = useState(searchParams.get('label') || '')
  const [fieldErr, setFieldErr]         = useState(null)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState(null)
  const [result, setResult]             = useState(null)

  useEffect(() => {
    const urlLabel = searchParams.get('label')
    if (urlLabel) { setLabel(urlLabel); doTrack(urlLabel) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function doTrack(trackLabel) {
    const lbl = (trackLabel || label).trim()
    const err = validateLabel(lbl)
    if (err) { setFieldErr(err); return }

    setFieldErr(null); setError(null); setResult(null); setLoading(true)

    try {
      const res = await trackParcel(lbl)
      setResult(res.data)
      setSearchParams({ label: lbl })
    } catch (e) {
      setError(friendlyError(e, isApiError))
    } finally {
      setLoading(false)
    }
  }

  const scans      = result?.scans ?? []
  const badge      = scanBadge(result?.scan_type)
  const latestScan = scans[0] ?? {}

  const infoItems = [
    { label: 'Last Location', value: latestScan.Name || latestScan.Franchise },
    { label: 'Franchise',     value: latestScan.Franchise },
    { label: 'Last Scan',     value: latestScan.Date },
    { label: 'Courier',       value: latestScan.Courier },
    { label: 'Delivered To',  value: result?.delivered_to },
    { label: 'Delivered On',  value: result?.delivered_date },
  ].filter(i => i.value)

  return (
    <div className="py-5">
      <div className="container">

        <div className="mb-4 fade-in">
          <h2 className="fw-bold mb-1" style={{ color: 'var(--fw-navy)' }}>
            <i className="bi bi-geo-alt-fill me-2" style={{ color: 'var(--fw-red)' }} />
            Track &amp; Trace
          </h2>
          <p className="text-muted">Enter your Fastway tracking number to view parcel status and history.</p>
        </div>

        <div className="card border shadow-sm mb-4 fade-in fade-in-1">
          <div className="card-body p-4">
            <form onSubmit={e => { e.preventDefault(); doTrack() }} noValidate>
              <div className="row g-3">
                <div className="col-md-8">
                  <label htmlFor="trackingLabel" className="form-label fw-semibold small">
                    Tracking Number <span className="text-danger">*</span>
                  </label>
                  <input
                    id="trackingLabel"
                    className={`form-control form-control-lg${fieldErr ? ' is-invalid' : ''}`}
                    type="text"
                    value={label}
                    onChange={e => { setLabel(e.target.value); setFieldErr(null) }}
                    placeholder="e.g. Z60000983328"
                    autoComplete="off"
                    spellCheck={false}
                    maxLength={30}
                  />
                  {fieldErr
                    ? <div className="invalid-feedback d-block"><i className="bi bi-exclamation-circle me-1" />{fieldErr}</div>
                    : <div className="form-text">Letters and numbers only — e.g. Z60000983328</div>
                  }
                </div>
                <div className="col-md-4 d-flex flex-column">
                  <div className="form-label small invisible" aria-hidden="true">&nbsp;</div>
                  <button type="submit" className="btn btn-fw btn-lg w-100" disabled={loading}>
                    {loading
                      ? <><span className="spinner-border spinner-border-sm me-2" role="status" />Searching…</>
                      : <><i className="bi bi-search me-2" />Track Parcel</>
                    }
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {loading && <Spinner message="Fetching parcel information…" />}
        {error && !loading && <Alert type="error" message="Tracking lookup failed" detail={error} />}

        {result && !loading && (
          <div className="fade-in">
            <div className="card border shadow-sm mb-4">
              <div className="card-header d-flex align-items-center gap-2 fw-semibold"
                style={{ background: 'var(--fw-navy)', color: '#fff' }}>
                <i className="bi bi-box-seam" style={{ color: '#ff2340' }} />
                Parcel {result.label}
              </div>
              <div className="card-body p-4">
                <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
                  <span className={`badge rounded-pill fs-6 px-3 py-2 ${badge.cls}`}>
                    <i className={`bi ${badge.icon} me-1`} />{badge.label}
                  </span>
                  <span className="text-muted small">{result.current_status}</span>
                </div>

                {infoItems.length > 0 && (
                  <div className="row g-2">
                    {infoItems.map(({ label: lbl, value }) => (
                      <div key={lbl} className="col-6 col-md-4">
                        <div className="bg-light rounded p-3 h-100">
                          <div className="text-uppercase text-muted fw-semibold mb-1"
                            style={{ fontSize: '0.7rem', letterSpacing: '0.06em' }}>{lbl}</div>
                          <div className="fw-semibold small">{value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {result.signature && (
                  <div className="mt-3">
                    <div className="text-muted small mb-1 fw-semibold">Proof of Delivery Signature</div>
                    <img src={result.signature} alt="Delivery signature"
                      className="border rounded" style={{ maxHeight: 100, background: '#fff' }} />
                  </div>
                )}
              </div>
            </div>

            {scans.length > 0 && (
              <div className="card border shadow-sm">
                <div className="card-header d-flex align-items-center gap-2 fw-semibold"
                  style={{ background: 'var(--fw-navy)', color: '#fff' }}>
                  <i className="bi bi-clock-history" style={{ color: '#ff2340' }} />
                  Scan History
                  <span className="badge bg-secondary ms-1">{scans.length}</span>
                </div>
                <div className="card-body p-4">
                  <div className="timeline">
                    {scans.map((scan, idx) => {
                      const tb = scanBadge(scan.Type)
                      return (
                        <div key={idx} className="timeline-item">
                          <div className={`timeline-dot${idx === 0 ? ' active' : ''}`} />
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <span className={`badge ${tb.cls}`} style={{ fontSize: '0.7rem' }}>{tb.label}</span>
                            <span className="text-muted" style={{ fontSize: '0.78rem' }}>{scan.Date ?? ''}</span>
                          </div>
                          <div className="fw-semibold small">
                            {scan.StatusDescription || scan.Description || 'Scan recorded'}
                          </div>
                          <div className="text-muted" style={{ fontSize: '0.82rem' }}>
                            <i className="bi bi-pin-map me-1" style={{ color: 'var(--fw-red)', opacity: 0.7 }} />
                            {scan.Name ?? scan.Franchise ?? '—'}
                            {scan.Franchise && scan.Name && scan.Franchise !== scan.Name ? ` (${scan.Franchise})` : ''}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {!result && !loading && !error && (
          <div className="text-center py-5 text-muted fade-in">
            <i className="bi bi-box-seam" style={{ fontSize: '3rem', opacity: 0.2 }} />
            <p className="mt-3 mb-0">Enter a tracking number above to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}
