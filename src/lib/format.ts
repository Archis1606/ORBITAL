const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

export function formatCaptureDate(isoDate: string) {
  return dateFormatter.format(new Date(`${isoDate}T00:00:00`))
}

export function disciplineLabel(discipline: 'astrophotography' | 'aviation') {
  return discipline === 'astrophotography' ? 'Astrophotography' : 'Aviation'
}
