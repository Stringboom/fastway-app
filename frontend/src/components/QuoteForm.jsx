import { useState } from 'react';
import SuburbAutocomplete from './QuoteSuburbAutocomplete';
import { EMPTY_FIELDS, validate } from '../utils/validation';

export default function QuoteForm({ onSubmit, isLoading = false }) {
  const [fields, setFields] = useState(EMPTY_FIELDS);
  const [touched, setTouched] = useState({});
  const [showDims, setShowDims] = useState(false);

  const errors = validate(fields);
  const hasErrors = Object.keys(errors).length > 0;

  function set(name, value) {
    setFields(prev => ({ ...prev, [name]: value }));
  }

  function touch(name) {
    setTouched(prev => ({ ...prev, [name]: true }));
  }

  function handleChange(e) {
    set(e.target.name, e.target.value);
    touch(e.target.name);
  }

  function handleBlur(e) {
    touch(e.target.name);
  }

  function handleSuburbSelect(town, postcode) {
    setFields(prev => ({ ...prev, suburb: town, postcode }));
    setTouched(prev => ({ ...prev, suburb: true, postcode: true }));
  }

  function toggleDims() {
    setShowDims(prev => {
      if (prev) {
        setFields(prev => ({ ...prev, length: '', width: '', height: '' }));
      }
      return !prev;
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setTouched({
      suburb: true, postcode: true, weight: true,
      length: true, width: true, height: true
    });
    if (hasErrors) return;
    onSubmit(fields);
  }

  return (
    <div className="card border shadow-sm fade-in fade-in-1">
      <div className="card-header d-flex align-items-center gap-2 fw-semibold"
        style={{ background: 'var(--fw-navy)', color: '#fff' }}>
        <i className="bi bi-box-seam" style={{ color: '#ff2340' }} />
        Parcel Details
      </div>

      <div className="card-body p-4">
        <form onSubmit={handleSubmit} noValidate>
          {/* Suburb */}
          <div className="mb-3">
            <label htmlFor="suburb" className="form-label fw-semibold small">
              Destination Suburb <span className="text-danger">*</span>
            </label>
            <SuburbAutocomplete
              value={fields.suburb}
              onChange={val => { set('suburb', val); touch('suburb'); }}
              onSelect={handleSuburbSelect}
              isInvalid={!!(touched.suburb && errors.suburb)}
              errorMsg={errors.suburb}
            />
            {!(touched.suburb && errors.suburb) && (
              <div className="form-text">
                <i className="bi bi-search me-1" />Start typing to search suburbs
              </div>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="postcode" className="form-label fw-semibold small">
              Postal Code <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <input
                id="postcode" name="postcode"
                className={`form-control${touched.postcode && errors.postcode ? ' is-invalid' : ''}`}
                type="text" inputMode="numeric" maxLength={4}
                value={fields.postcode}
                onChange={handleChange} onBlur={handleBlur}
                placeholder="e.g. 2196"
              />
              {fields.postcode && !errors.postcode && (
                <span className="input-group-text text-success">
                  <i className="bi bi-check-circle-fill" />
                </span>
              )}
              {touched.postcode && errors.postcode && (
                <div className="invalid-feedback">{errors.postcode}</div>
              )}
            </div>
            {!(touched.postcode && errors.postcode) && (
              <div className="form-text">Auto-filled when you select a suburb</div>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="weight" className="form-label fw-semibold small">
              Parcel Weight <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <input
                id="weight" name="weight"
                className={`form-control${touched.weight && errors.weight ? ' is-invalid' : ''}`}
                type="number" step="0.1" min="0.1" max="30"
                value={fields.weight}
                onChange={handleChange} onBlur={handleBlur}
                placeholder="e.g. 2.5"
              />
              <span className="input-group-text">kg</span>
              {touched.weight && errors.weight && (
                <div className="invalid-feedback">{errors.weight}</div>
              )}
            </div>
            {!(touched.weight && errors.weight) && (
              <div className="form-text">Max 30 kg for South Africa</div>
            )}
          </div>

          <div className="mb-3">
            <div
              className="d-flex align-items-center justify-content-between p-3 rounded"
              style={{ background: '#f8f9fa', border: '1px solid #dee2e6', cursor: 'pointer' }}
              onClick={toggleDims}
            >
              <span className="d-flex align-items-center gap-2 small fw-semibold">
                <i className="bi bi-rulers" style={{ color: 'var(--fw-navy)' }} />
                Parcel Dimensions
                <span className="badge bg-secondary fw-normal" style={{ fontSize: '0.7rem' }}>optional</span>
              </span>
              <i className={`bi bi-chevron-${showDims ? 'up' : 'down'} text-muted`} />
            </div>

            {showDims && (
              <div className="mt-2 p-3 rounded" style={{ background: '#f8f9fa', border: '1px solid #dee2e6' }}>
                <p className="text-muted mb-2" style={{ fontSize: '0.8rem' }}>
                  <i className="bi bi-info-circle me-1" />
                  The greater of cubic vs dead weight is used.
                </p>
                <div className="row g-2">
                  {['length', 'width', 'height'].map(dim => (
                    <div key={dim} className="col-4">
                      <label className="form-label small fw-semibold text-capitalize mb-1">{dim}</label>
                      <div className="input-group input-group-sm">
                        <input
                          name={dim}
                          className={`form-control${touched[dim] && errors[dim] ? ' is-invalid' : ''}`}
                          type="number" step="1" min="1"
                          value={fields[dim]}
                          onChange={handleChange} onBlur={handleBlur}
                          placeholder="cm"
                        />
                        <span className="input-group-text">cm</span>
                      </div>
                      {touched[dim] && errors[dim] && (
                        <div className="text-danger" style={{ fontSize: '0.75rem' }}>{errors[dim]}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="alert alert-info d-flex align-items-start gap-2 py-2 small mb-3">
            <i className="bi bi-info-circle-fill flex-shrink-0 mt-1" />
            <span>Pickup franchise <strong>JNB</strong> (Johannesburg) applied automatically.</span>
          </div>

          <button type="submit" className="btn btn-fw btn-lg w-100" disabled={isLoading}>
            {isLoading
              ? <><span className="spinner-border spinner-border-sm me-2" role="status" />Calculating…</>
              : <><i className="bi bi-calculator me-2" />Calculate Quote</>
            }
          </button>
        </form>
      </div>
    </div>
  );
}