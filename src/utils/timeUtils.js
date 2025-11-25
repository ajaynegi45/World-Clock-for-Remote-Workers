/**
 * timeUtils.js
 *
 * Helper functions for timezone list, offsets, continent detection, and
 * utilities for converting local windows to UTC for overlap calculations.
 *
 * Explanations:
 * - buildZonesList() uses Intl.supportedValuesOf('timeZone') if available.
 * - tzOffsetMinutes(tz) computes current offset in minutes relative to UTC.
 * - continentOf(tz) uses the IANA naming to assign a continent for grouping.
 *
 * Comments are deliberately verbose for beginners.
 */

export function getAllTimeZones() {
    // Modern browsers provide Intl.supportedValuesOf('timeZone')
    if (typeof Intl.supportedValuesOf === 'function') {
        return Intl.supportedValuesOf('timeZone')
    }
    // Fallback: a minimal list used only if browser is old
    return [
        'Pacific/Midway','America/Adak','America/Anchorage','America/Los_Angeles',
        'America/Denver','America/Chicago','America/New_York','Atlantic/Azores',
        'Europe/London','Europe/Berlin','Europe/Moscow','Asia/Dubai',
        'Asia/Kolkata','Asia/Singapore','Asia/Tokyo','Australia/Sydney'
    ]
}

/**
 * Compute the offset in minutes between the given timeZone and UTC
 * at the current instant (or a provided Date).
 *
 * We use formatToParts to get the local date/time components in that tz,
 * then create a UTC timestamp from those parts; comparing that to the
 * real Date() timestamp yields the offset.
 */
export function tzOffsetMinutes(timeZone, now = new Date()) {
    const fmt = new Intl.DateTimeFormat('en-US', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    })
    const parts = fmt.formatToParts(now)
    const map = {}
    parts.forEach(p => { if (p.type) map[p.type] = p.value })
    const y = Number(map.year), m = Number(map.month), d = Number(map.day)
    const h = Number(map.hour), min = Number(map.minute), s = Number(map.second)
    const utcMs = Date.UTC(y, m - 1, d, h, min, s)
    const diffMin = Math.round((utcMs - now.getTime()) / 60000)
    return diffMin // positive means the timezone is ahead of UTC (e.g. +330)
}

/**
 * Return an array of objects [{ tz, offset, cont }, ...] sorted by offset asc.
 */
export function buildZonesList() {
    const zones = getAllTimeZones()
    const now = new Date()
    const arr = zones.map(tz => ({
        tz,
        offset: tzOffsetMinutes(tz, now),
        cont: continentOf(tz)
    }))
    arr.sort((a, b) => a.offset - b.offset || a.tz.localeCompare(b.tz))
    return arr
}

/**
 * Map IANA tz string to continent label for grouping.
 * This is a simple heuristic based on the standard naming.
 */
export function continentOf(tz) {
    if (tz.startsWith('Africa/')) return 'Africa'
    if (tz.startsWith('Antarctica/')) return 'Antarctica'
    if (tz.startsWith('Asia/')) return 'Asia'
    if (tz.startsWith('Australia/') || tz.startsWith('Pacific/')) return 'Australia'
    if (tz.startsWith('Europe/')) return 'Europe'
    if (tz.startsWith('America/')) {
        // lightweight heuristic: treat some known South America zones separately
        const south = ['Argentina','Sao_Paulo','Bogota','Lima','Caracas','Santiago','Montevideo','Asuncion','La_Paz']
        if (south.some(k => tz.includes(k))) return 'South America'
        return 'North America'
    }
    return 'Other'
}

/**
 * Convert a local date/time in a timezone into UTC ms.
 * - year/month/day/hour/min are local to the timezone tz.
 * - We compute the UTC timestamp by subtracting that tz's offset minutes at that date.
 *
 * This helper is used when we build working windows and find overlaps.
 */
export function localToUtcMs(tz, year, month, day, hour = 0, minute = 0) {
    const localUtcMs = Date.UTC(year, month - 1, day, hour, minute, 0)
    // offset in minutes at that local date
    const offsetMin = tzOffsetMinutes(tz, new Date(year, month - 1, day, hour, minute))
    return localUtcMs - offsetMin * 60000
}
