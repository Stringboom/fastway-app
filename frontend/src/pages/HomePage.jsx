import { Link } from 'react-router-dom'

const TEST_NUMBERS = ['Z60000983328', 'Z30002408261']

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="hero-section py-5">
        <div className="container py-3">
          <div className="row align-items-center g-5">
            <div className="col-lg-7 fade-in">
              <p className="text-uppercase fw-semibold small mb-3 ls-wider" style={{ color: '#ff2340', letterSpacing: '0.1em' }}>
                South Africa's Courier Network
              </p>
              <h1 className="display-5 fw-bold text-white lh-sm mb-3">
                Fast deliveries.<br />
                <span style={{ color: '#ff2340' }}>Smarter tracking.</span>
              </h1>
              <p className="text-white-50 lead mb-4">
                Track your parcel in real time or get an instant shipping quote —
                powered by the Fastway Couriers API.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/track" className="btn btn-fw btn-lg px-4">
                  <i className="bi bi-geo-alt me-2" />Track a Parcel
                </Link>
                <Link to="/quote" className="btn btn-outline-light btn-lg px-4">
                  <i className="bi bi-calculator me-2" />Get a Quote
                </Link>
              </div>
            </div>

            <div className="col-lg-5 d-none d-lg-block fade-in fade-in-2">
              <div
                className="rounded-4 p-4"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                {[
                  { icon: 'bi-truck', label: 'Fast & Reliable', sub: 'Door-to-door delivery across SA' },
                  { icon: 'bi-shield-check', label: 'Secure Handling', sub: 'Full parcel scan history' },
                  { icon: 'bi-lightning-charge', label: 'Instant Quotes', sub: 'Live pricing in seconds' },
                ].map((item, i) => (
                  <div key={i} className="d-flex align-items-start gap-3 mb-3 text-white">
                    <div
                      className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: 40, height: 40, background: 'rgba(232,0,29,0.2)', color: '#ff2340', fontSize: '1.1rem' }}
                    >
                      <i className={`bi ${item.icon}`} />
                    </div>
                    <div>
                      <div className="fw-semibold small">{item.label}</div>
                      <div className="text-white-50" style={{ fontSize: '0.8rem' }}>{item.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-5">
        <div className="container">
          <div className="row g-4 mb-4">
            {[
              {
                to: '/track', icon: 'bi-geo-alt-fill',
                title: 'Track & Trace',
                desc: 'Enter your tracking number to see current status, location, full scan history, and estimated delivery.',
                cta: 'Track your parcel',
              },
              {
                to: '/quote', icon: 'bi-calculator',
                title: 'Shipping Quote',
                desc: 'Provide your destination suburb, postal code, and parcel weight for an instant accurate shipping quote.',
                cta: 'Get a quote',
              },
            ].map(({ to, icon, title, desc, cta }, i) => (
              <div key={to} className={`col-md-6 fade-in fade-in-${i + 1}`}>
                <Link
                  to={to}
                  className="card h-100 border shadow-sm text-decoration-none text-dark"
                  style={{ transition: 'box-shadow 0.2s, transform 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
                >
                  <div className="card-body p-4">
                    <div
                      className="rounded-3 d-flex align-items-center justify-content-center mb-3"
                      style={{ width: 56, height: 56, background: 'var(--fw-navy)', color: '#ff2340', fontSize: '1.5rem' }}
                    >
                      <i className={`bi ${icon}`} />
                    </div>
                    <h5 className="card-title fw-bold">{title}</h5>
                    <p className="card-text text-muted">{desc}</p>
                    <span className="fw-semibold small" style={{ color: 'var(--fw-red)' }}>
                      {cta} <i className="bi bi-arrow-right" />
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Test numbers */}
          <div className="card border shadow-sm fade-in fade-in-3">
            <div className="card-header d-flex align-items-center gap-2 fw-semibold" style={{ background: 'var(--fw-navy)', color: '#fff' }}>
              <i className="bi bi-info-circle" style={{ color: '#ff2340' }} />
              Test Tracking Numbers
            </div>
            <div className="card-body">
              <p className="text-muted small mb-3">
                Click a number below to test the Track &amp; Trace feature:
              </p>
              <div className="d-flex flex-wrap gap-2">
                {TEST_NUMBERS.map(num => (
                  <Link
                    key={num}
                    to={`/track?label=${num}`}
                    className="btn btn-outline-secondary btn-sm font-monospace"
                  >
                    <i className="bi bi-search me-1" style={{ color: 'var(--fw-red)' }} />{num}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
