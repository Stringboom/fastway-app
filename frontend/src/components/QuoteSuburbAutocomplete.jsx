import { useState, useEffect, useRef, useCallback } from 'react';
import { useApi } from '../context/ApiContext';

export default function SuburbAutocomplete({ value, onChange, onSelect, isInvalid, errorMsg }) {
  const { searchSuburbs } = useApi()
  const [suggestions, setSuggestions] = useState([])
  const [showDrop, setShowDrop] = useState(false)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef(null)
  const wrapRef = useRef(null)

  useEffect(() => {
    function onOutsideClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setShowDrop(false)
    }
    document.addEventListener('mousedown', onOutsideClick)
    return () => document.removeEventListener('mousedown', onOutsideClick)
  }, [])

  const fetchSuggestions = useCallback(async (term) => {
    if (term.length < 2) { setSuggestions([]); setShowDrop(false); return }
    setLoading(true)
    try {
      const res = await searchSuburbs(term)
      setSuggestions(res.data?.suburbs ?? [])
      setShowDrop(true)
    } catch {
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }, [searchSuburbs])

  function handleInput(e) {
    onChange(e.target.value)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(e.target.value), 300)
  }

  function handlePick(s) {
    onSelect(s.Town, s.Postcode)
    setSuggestions([])
    setShowDrop(false)
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <div className="input-group">
        <input
          id="suburb"
          className={`form-control${isInvalid ? ' is-invalid' : ''}`}
          type="text"
          value={value}
          onChange={handleInput}
          onFocus={() => suggestions.length > 0 && setShowDrop(true)}
          placeholder="e.g. Sandton"
          autoComplete="off"
        />
        {loading && (
          <span className="input-group-text bg-white border-start-0">
            <span className="spinner-border spinner-border-sm text-secondary" />
          </span>
        )}
        {isInvalid && <div className="invalid-feedback">{errorMsg}</div>}
      </div>
      {showDrop && suggestions.length > 0 && (
        <ul className="list-group shadow" style={{
          position: 'absolute', zIndex: 1050, width: '100%',
          maxHeight: 220, overflowY: 'auto',
          border: '1px solid #dee2e6', borderRadius: '0 0 6px 6px',
        }}>
          {suggestions.map((s, i) => (
            <li key={i}
              className="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-2 px-3"
              style={{ cursor: 'pointer', fontSize: '0.9rem' }}
              onMouseDown={() => handlePick(s)}
            >
              <span>{s.Town}</span>
              <span className="badge bg-light text-dark border" style={{ fontSize: '0.75rem' }}>{s.Postcode}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}