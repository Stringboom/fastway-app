export default function Footer() {
  return (
    <footer className="py-4 mt-auto" style={{ backgroundColor: 'var(--fw-navy)' }}>
      <div className="container text-center">
        <p className="text-white-50 mb-1 small">
          © {new Date().getFullYear()} Fastway Couriers South Africa &nbsp;·&nbsp;
          <a
            href="https://www.fastway.co.za"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white-50 text-decoration-none"
          >
            fastway.co.za
          </a>
        </p>
        <p className="mb-0 text-white-50" style={{ fontSize: '0.75rem', opacity: 0.5 }}>
          Technical Assessment — Senior FullStack Developer
        </p>
      </div>
    </footer>
  )
}
