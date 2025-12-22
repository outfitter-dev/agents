/**
 * Time parsing utilities for status-reporting gatherers
 */

const TIME_UNITS: Record<string, number> = {
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
  w: 7 * 24 * 60 * 60 * 1000,
}

/**
 * Parse time constraint string to milliseconds
 * @example parseTimeConstraint("24h") → 86400000
 * @example parseTimeConstraint("7d") → 604800000
 * @example parseTimeConstraint("2w") → 1209600000
 */
export function parseTimeConstraint(input: string): number {
  const match = input.match(/^(\d+)([hdw])$/i)
  if (!match) {
    throw new Error(`Invalid time constraint: ${input}. Use format like "24h", "7d", or "2w"`)
  }
  const [, value, unit] = match
  const multiplier = TIME_UNITS[unit.toLowerCase()]
  if (!multiplier) {
    throw new Error(`Unknown time unit: ${unit}`)
  }
  return parseInt(value, 10) * multiplier
}

/**
 * Get cutoff Date from milliseconds offset
 */
export function toCutoffDate(ms: number): Date {
  return new Date(Date.now() - ms)
}

/**
 * Convert to git --since format
 * @example toGitSince(86400000) → "2024-12-21T12:00:00"
 */
export function toGitSince(ms: number): string {
  return toCutoffDate(ms).toISOString().replace("Z", "")
}

/**
 * Convert to ISO 8601 duration for Linear
 * @example toISOPeriod(86400000) → "-P1D" (1 day)
 * @example toISOPeriod(604800000) → "-P7D" (7 days)
 */
export function toISOPeriod(ms: number): string {
  const hours = ms / (60 * 60 * 1000)
  if (hours < 24) {
    return `-PT${Math.round(hours)}H`
  }
  const days = Math.round(hours / 24)
  return `-P${days}D`
}

/**
 * Convert to human-readable relative time
 * @example toRelativeTime(new Date(Date.now() - 3600000)) → "1 hour ago"
 */
export function toRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  const ms = Date.now() - d.getTime()

  if (ms < 60 * 1000) return "just now"
  if (ms < 60 * 60 * 1000) {
    const mins = Math.floor(ms / (60 * 1000))
    return `${mins} minute${mins === 1 ? "" : "s"} ago`
  }
  if (ms < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(ms / (60 * 60 * 1000))
    return `${hours} hour${hours === 1 ? "" : "s"} ago`
  }
  const days = Math.floor(ms / (24 * 60 * 60 * 1000))
  return `${days} day${days === 1 ? "" : "s"} ago`
}

/**
 * Filter items by updated_at field within time window
 */
export function filterByTime<T extends { updated_at?: string; updatedAt?: string }>(
  items: T[],
  ms: number
): T[] {
  const cutoff = toCutoffDate(ms)
  return items.filter((item) => {
    const updatedAt = item.updated_at || item.updatedAt
    if (!updatedAt) return false
    return new Date(updatedAt) >= cutoff
  })
}

/**
 * Format time constraint for display
 * @example formatTimeConstraint("24h") → "last 24 hours"
 */
export function formatTimeConstraint(input: string): string {
  const match = input.match(/^(\d+)([hdw])$/i)
  if (!match) return input

  const [, value, unit] = match
  const num = parseInt(value, 10)

  switch (unit.toLowerCase()) {
    case "h":
      return `last ${num} hour${num === 1 ? "" : "s"}`
    case "d":
      return `last ${num} day${num === 1 ? "" : "s"}`
    case "w":
      return `last ${num} week${num === 1 ? "" : "s"}`
    default:
      return input
  }
}
