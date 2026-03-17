import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ApiProvider } from './context/ApiContext'
import Navbar    from './components/Navbar'
import Footer    from './components/Footer'
import HomePage  from './pages/HomePage'
import TrackPage from './pages/TrackPage'
import QuotePage from './pages/QuotePage'

export default function App() {
  return (
    <BrowserRouter>
      <ApiProvider>
        <div className="d-flex flex-column min-vh-100">
          <Navbar />
          <main className="flex-grow-1">
            <Routes>
              <Route path="/"      element={<HomePage />}  />
              <Route path="/track" element={<TrackPage />} />
              <Route path="/quote" element={<QuotePage />} />
              <Route path="*"      element={<NotFound />}  />
            </Routes>
          </main>
          <Footer />
        </div>
      </ApiProvider>
    </BrowserRouter>
  )
}

function NotFound() {
  return (
    <div className="py-5 text-center">
      <div className="container py-5">
        <p className="display-1 fw-bold text-muted opacity-25">404</p>
        <h2 className="fw-bold mb-3" style={{ color: 'var(--fw-navy)' }}>Page not found</h2>
        <p className="text-muted mb-4">The page you're looking for doesn't exist.</p>
        <a href="/" className="btn btn-fw btn-lg px-5">
          <i className="bi bi-house me-2" />Go Home
        </a>
      </div>
    </div>
  )
}
