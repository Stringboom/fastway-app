export function formatZAR(amount) {
  const n = parseFloat(amount);
  return isNaN(n)
    ? '—'
    : new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(n);
}

export function labelBadge(colour = '') {
  const c = colour.toLowerCase();
  if (c.includes('red'))    return 'bg-danger';
  if (c.includes('green'))  return 'bg-success';
  if (c.includes('blue'))   return 'bg-primary';
  if (c.includes('orange')) return 'bg-warning text-dark';
  return 'bg-secondary';
}