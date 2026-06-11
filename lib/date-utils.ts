const TZ = 'America/Lima'

/** Returns YYYY-MM-DD for the current date in Peru time */
export function getPeruToday(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: TZ })
}

/** Converts a JS Date to YYYY-MM-DD in Peru time */
export function toPeruDateString(date: Date): string {
  return date.toLocaleDateString('en-CA', { timeZone: TZ })
}

/** Formats a YYYY-MM-DD string for display in Spanish */
export function formatDateES(
  dateStr: string,
  options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
): string {
  // Use noon UTC to safely avoid any date boundary issues across timezones
  const d = new Date(dateStr + 'T12:00:00Z')
  return d.toLocaleDateString('es-PE', { timeZone: TZ, ...options })
}

/** Returns month name + year for a JS Date */
export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('es-PE', { timeZone: TZ, month: 'long', year: 'numeric' })
}

/** Gets number of days in the month of the given Date */
export function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

/** Gets the day-of-week index (0=Mon) for the 1st of the month (adjusted for Monday-start grid) */
export function getMonthStartOffset(date: Date): number {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  // Convert Sunday=0 to Monday=0 based week
  return (firstDay + 6) % 7
}

/** Builds the YYYY-MM-DD string for a given day within the same month as `current` */
export function buildDateStr(current: Date, day: number): string {
  const y = current.getFullYear()
  const m = String(current.getMonth() + 1).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${y}-${m}-${d}`
}
