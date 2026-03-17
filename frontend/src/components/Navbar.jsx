import { NavLink } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="navbar navbar-fw navbar-expand-md navbar-dark sticky-top shadow-sm">
      <div className="container">
        <NavLink to="/" className="navbar-brand fw-bold d-flex align-items-center gap-2">
          <span
            className="rounded-circle"
            style={{ width: 10, height: 10, background: '#e8001d', display: 'inline-block' }}
          />
          fastway<span style={{ color: '#ff2340' }}>.</span>app
        </NavLink>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#fwNav"
          aria-controls="fwNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="fwNav">
          <ul className="navbar-nav ms-auto gap-1">
            {[
              { to: '/', end: true, icon: 'bi-house', label: 'Home' },
              { to: '/track', end: false, icon: 'bi-geo-alt', label: 'Track Parcel' },
              { to: '/quote', end: false, icon: 'bi-calculator', label: 'Get a Quote' },
            ].map(({ to, end, icon, label }) => (
              <li className="nav-item" key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    'nav-link rounded px-3' + (isActive ? ' active fw-semibold' : ' text-white-50')
                  }
                >
                  <i className={`bi ${icon} me-1`} />{label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  )
}
