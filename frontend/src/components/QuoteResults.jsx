import { formatZAR, labelBadge } from '../utils/formatters';
import Spinner from './Spinner';
import Alert from './Alert';

export default function QuoteResults({ loading, error, result }) {
  if (loading) {
    return <Spinner message="Fetching shipping rates…" />;
  }

  if (error) {
    return <Alert type="error" message="Quote request failed" detail={error} />;
  }

  if (!result) {
    return (
      <div className="text-center py-5 text-muted fade-in">
        <i className="bi bi-calculator" style={{ fontSize: '3rem', opacity: 0.2 }} />
        <p className="mt-3 mb-0">Fill in the form to get your shipping quote.</p>
      </div>
    );
  }

  const services = result.services ?? [];

  const cheapest = services.reduce((best, s) => {
    const p = parseFloat(s.totalprice_normal ?? 0);
    const b = parseFloat(best?.totalprice_normal ?? Infinity);
    return p < b ? s : best;
  }, null);

  return (
    <div className="fade-in">
      {/* Summary bar */}
      <div className="d-flex flex-wrap gap-2 align-items-center mb-3 small text-muted">
        <span><i className="bi bi-building me-1" />{result.pickup_franchise ?? 'JNB'}</span>
        <i className="bi bi-arrow-right" />
        <span><i className="bi bi-geo-alt me-1" />{result.to ?? result.suburb}, {result.postcode}</span>
        {result.delivery_timeframe_days && (
          <>
            <span>·</span>
            <span>
              <i className="bi bi-clock me-1" />
              {result.delivery_timeframe_days} day{result.delivery_timeframe_days !== '1' ? 's' : ''}
            </span>
          </>
        )}
        <span>·</span>
        <span><i className="bi bi-box me-1" />{result.weight} kg</span>
        {result.has_dimensions && (
          <span className="badge bg-secondary fw-normal">Cubic weight applied</span>
        )}
      </div>

      {/* Cheapest card */}
      {cheapest && (
        <div className="rounded-4 p-4 mb-3 text-white"
          style={{ background: 'linear-gradient(135deg, var(--fw-navy), #2e4270)' }}>
          <div className="text-uppercase small fw-semibold mb-1" style={{ opacity: 0.6, letterSpacing: '0.08em' }}>
            Best Available Rate (incl. VAT)
          </div>
          <div className="display-5 fw-bold lh-1 mb-2">{formatZAR(cheapest.totalprice_normal)}</div>
          <div className="small" style={{ opacity: 0.85 }}>
            <i className="bi bi-truck me-1" />{cheapest.name} — {cheapest.type}
          </div>
          {cheapest.totalprice_normal_exgst && (
            <div className="small mt-1" style={{ opacity: 0.55 }}>
              {formatZAR(cheapest.totalprice_normal_exgst)} excl. VAT
            </div>
          )}
          {cheapest.totalprice_frequent && cheapest.totalprice_frequent !== cheapest.totalprice_normal && (
            <div className="small mt-1" style={{ opacity: 0.7 }}>
              <i className="bi bi-star me-1" />Frequent: {formatZAR(cheapest.totalprice_frequent)}
            </div>
          )}
        </div>
      )}

      {/* All services list */}
      {services.length > 0 && (
        <>
          <p className="text-uppercase text-muted fw-semibold mb-2"
            style={{ fontSize: '0.72rem', letterSpacing: '0.08em' }}>
            All Available Services
          </p>
          {services.map((s, idx) => (
            <div key={idx} className="card border mb-2"
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.1)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = ''}
              style={{ transition: 'box-shadow 0.2s' }}>
              <div className="card-body py-3 px-3 d-flex align-items-center justify-content-between gap-3">
                <div className="flex-grow-1">
                  <div className="fw-semibold small d-flex align-items-center gap-2 flex-wrap">
                    <i className="bi bi-truck text-secondary" />
                    {s.name}
                    <span className={`badge ${labelBadge(s.labelcolour_pretty ?? '')}`} style={{ fontSize: '0.65rem' }}>
                      {s.labelcolour_pretty || s.type}
                    </span>
                  </div>
                  <div className="text-muted mt-1" style={{ fontSize: '0.8rem' }}>
                    {s.type} · Up to {s.weightlimit} kg
                    {s.totalprice_frequent && s.totalprice_frequent !== s.totalprice_normal && (
                      <span className="text-success ms-2">Frequent: {formatZAR(s.totalprice_frequent)}</span>
                    )}
                  </div>
                </div>
                <div className="text-end flex-shrink-0">
                  <div className="fw-bold fs-5" style={{ color: 'var(--fw-red)' }}>
                    {formatZAR(s.totalprice_normal)}
                  </div>
                  {s.totalprice_normal_exgst && (
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                      {formatZAR(s.totalprice_normal_exgst)} ex VAT
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}