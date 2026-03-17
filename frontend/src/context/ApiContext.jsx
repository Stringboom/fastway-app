import { createContext, useContext } from 'react'
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 20000,
  headers: { Accept: 'application/json' },
})

const ApiContext = createContext(null)

export function ApiProvider({ children }) {
  const value = {
    trackParcel: (label) =>
      api.get('/track', { params: { label: label.trim() } }).then(r => r.data),

    getQuote: ({ suburb, postcode, weight, length, width, height }) => {
      const params = { suburb: suburb.trim(), postcode: postcode.trim(), weight }
      if (length) params.length = length
      if (width) params.width = width
      if (height) params.height = height
      return api.get('/quote', { params }).then(r => r.data)
    },

    searchSuburbs: (term) =>
      api.get('/suburbs', { params: { term: term.trim() } }).then(r => r.data),

    isApiError: axios.isAxiosError,
  }

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>
}

export function useApi() {
  const ctx = useContext(ApiContext)
  if (!ctx) throw new Error('useApi must be used within ApiProvider')
  return ctx
}
