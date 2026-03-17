import { useState } from 'react';
import { useApi } from '../context/ApiContext';
import { friendlyError } from '../utils/errors';
import QuoteForm from '../components/QuoteForm';
import QuoteResults from '../components/QuoteResults';

export default function QuotePage() {
  const { getQuote, isApiError } = useApi();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  async function handleQuote(fields) {
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await getQuote(fields);
      setResult(res.data);
    } catch (err) {
      setError(friendlyError(err, isApiError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="py-5">
      <div className="container">
        <div className="mb-4 fade-in">
          <h2 className="fw-bold mb-1" style={{ color: 'var(--fw-navy)' }}>
            <i className="bi bi-calculator me-2" style={{ color: 'var(--fw-red)' }} />
            Get a Shipping Quote
          </h2>
          <p className="text-muted">Enter your parcel details to see available shipping rates.</p>
        </div>

        <div className="row g-4">
          <div className="col-lg-5">
            <QuoteForm
              onSubmit={handleQuote}
              isLoading={loading}
            />
          </div>

          <div className="col-lg-7">
            <QuoteResults
              loading={loading}
              error={error}
              result={result}
            />
          </div>
        </div>
      </div>
    </div>
  );
}