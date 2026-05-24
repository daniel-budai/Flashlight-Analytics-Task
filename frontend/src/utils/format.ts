export function formatPrice(price: number, locale = 'en-IE', currency = 'EUR') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatDate(iso: string, locale = 'en-IE') {
  return new Date(iso).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatMileage(km: number, locale = 'en-IE') {
  return `${new Intl.NumberFormat(locale).format(Math.round(km))} km`
}

export function formatDateTime(iso: string, locale = 'en-IE') {
  return new Date(iso).toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
