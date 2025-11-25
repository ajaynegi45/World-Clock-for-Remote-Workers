/**
 * MeetingPanel.jsx
 *
 * Shows a panel that visualizes working windows and a 15-minute resolution overlap grid.
 *
 * Implementation notes:
 * - We display the next 24 hours in the UTC day as 96 slots (24 * 4).
 * - Each slot is tested whether it falls inside the working window in a timezone.
 * - Overlap slots are highlighted with .overlap class.
 *
 * Props:
 *  - zone: the other timezone to compare with India (Asia/Kolkata).
 *  - workStart, workEnd: integers in 0..24 specifying work window local hours.
 *  - onClose: callback to close.
 *
 * Beginner explanation:
 * - For each 15-minute slot (UTC timestamp) we compute local hour/min for both India and the other tz.
 * - If a slot lies within both work windows -> overlap.
 */

import React, { useMemo } from 'react'
import { tzOffsetMinutes } from '../utils/timeUtils'

function localHourMinuteFromUtcMs(utcMs, tz) {
    const d = new Date(utcMs)
    const fmt = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour12: false, hour: '2-digit', minute: '2-digit' })
    const parts = fmt.formatToParts(d)
    const map = {}; parts.forEach(p => { if (p.type) map[p.type] = p.value })
    const h = Number(map.hour), m = Number(map.minute)
    return { h, m }
}

export default function MeetingPanel({ zone, localZone = 'Asia/Kolkata', workStart, workEnd, onClose }) {
    // build 96 slots for the current UTC day (starting at today's 00:00 UTC)
    const now = new Date()
    const utcDayStart = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0)

    // create array of slots with metadata
    const slots = useMemo(() => {
        const arr = []
        for (let i = 0; i < 96; i++) { // 96 * 15 minutes = 24 hours
            const slotStart = utcDayStart + i * 15 * 60 * 1000
            const slotEnd = slotStart + 15 * 60 * 1000
            const localLM = localHourMinuteFromUtcMs(slotStart, localZone)
            const otherLM = localHourMinuteFromUtcMs(slotStart, zone)
            const localWork = (localLM.h >= workStart && localLM.h < workEnd) ||
                (localLM.h === workEnd && localLM.m === 0 && workEnd === 24) // inclusive corner
            const otherWork = (otherLM.h >= workStart && otherLM.h < workEnd) ||
                (otherLM.h === workEnd && otherLM.m === 0 && workEnd === 24)
            const overlap = localWork && otherWork
            arr.push({
                i, slotStart, slotEnd, localLM, otherLM, localWork, otherWork, overlap
            })
        }
        return arr
    }, [utcDayStart, zone, localZone, workStart, workEnd])

    // compute longest contiguous overlap segments and check if any contiguous >= 3 hours (12 slots)
    const overlapSegments = useMemo(() => {
        const segs = []
        let cur = null
        slots.forEach(s => {
            if (s.overlap) {
                if (!cur) cur = { startIdx: s.i, endIdx: s.i }
                else cur.endIdx = s.i
            } else {
                if (cur) { segs.push(cur); cur = null }
            }
        })
        if (cur) segs.push(cur)
        return segs
    }, [slots])

    const hasFull3h = overlapSegments.some(s => (s.endIdx - s.startIdx + 1) >= (3 * 4)) // 3 hours * 4 slots per hour

    // earliest full 3h start (if present)
    const earliestFull3h = (() => {
        for (const seg of overlapSegments) {
            if ((seg.endIdx - seg.startIdx + 1) >= 12) { // 12 slots = 3 hours
                const startMs = utcDayStart + seg.startIdx * 15 * 60 * 1000
                return startMs
            }
        }
        return null
    })()

    return (
        <div className="meeting-panel" role="dialog" aria-modal="true">
            <button className="close" onClick={onClose}>×</button>
            <h3>3-hour meeting overlap — {zone}</h3>

            {hasFull3h ? (
                <p>There is at least one full 3-hour overlap in this UTC day. Earliest start:</p>
            ) : (
                <p>No full 3-hour overlap in the next 24 hours. Here is the best overlap visualization.</p>
            )}

            {earliestFull3h && (
                <div className="meta">
                    Start ({localZone}): {new Date(earliestFull3h).toLocaleString('en-US', { timeZone: localZone, hour: 'numeric', minute: '2-digit', hour12: true })}
                    &nbsp;•&nbsp;
                    Start ({zone}): {new Date(earliestFull3h).toLocaleString('en-US', { timeZone: zone, hour: 'numeric', minute: '2-digit', hour12: true })}
                </div>
            )}

            <div className="bars" style={{ marginTop: 12 }}>
                <div className="bar-title">{localZone} (UTC)</div>
                <div className="bar">
                    {slots.map(s => (
                        <div
                            key={'i' + s.i}
                            className={`hour-block ${s.localWork ? 'work' : ''} ${s.overlap ? 'overlap' : ''}`}
                            title={`${s.localLM.h.toString().padStart(2, '0')}:${s.localLM.m.toString().padStart(2, '0')} local`}
                        />
                    ))}
                </div>

                <div className="bar-title" style={{ marginTop: 8 }}>{zone} (UTC)</div>
                <div className="bar">
                    {slots.map(s => (
                        <div
                            key={'o' + s.i}
                            className={`hour-block ${s.otherWork ? 'work' : ''} ${s.overlap ? 'overlap' : ''}`}
                            title={`${s.otherLM.h.toString().padStart(2, '0')}:${s.otherLM.m.toString().padStart(2, '0')} local`}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
