/** Return the effective "habit day" — before 5am counts as previous day. */
export function getToday(): Date {
  const now = new Date()
  if (now.getHours() < 5) {
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)
    return yesterday
  }
  now.setHours(0, 0, 0, 0)
  return now
}

/** Format a Date as YYYY-MM-DD */
export function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}
