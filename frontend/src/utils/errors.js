export function friendlyError(err, isApiError) {
  if (isApiError(err)) {
    const msg = err.response?.data?.error;
    if (msg) return msg;
    if (err.code === 'ECONNABORTED') return 'The request timed out. Please try again.';
    if (!err.response) return 'Unable to reach the server.';
    if (err.response.status === 429) return 'Too many requests — please wait before trying again.';
    if (err.response.status === 404) return 'No shipping services available for this destination.';
    if (err.response.status >= 500) return 'The Fastway API is temporarily unavailable.';
  }
  return err.message || 'An unexpected error occurred.';
}