export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata',
  })
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' })
}

export function formatGrams(grams: number): string {
  return grams >= 1000 ? `${(grams / 1000).toLocaleString('en-IN', { maximumFractionDigits: 1 })} kg` : `${grams} g`
}

export function formatLitres(litres: number): string {
  return `${litres.toLocaleString('en-IN')} L`
}
