/**
 * ZoneCard.jsx
 *
 * Displays one timezone card:
 *  - the ClockFace component (analog),
 *  - digital time (12h AM/PM + tz short name),
 *  - pin button,
 *  - Quick 3h overlap button.
 *
 * Props:
 *  - zone (tz string), offset, cont
 *  - pinned (bool), onTogglePin(), onShowMeeting()
 *  - workStart/workEnd (numbers)
 */

import React, { useEffect, useState } from 'react'
import ClockFace from './ClockFace'
import { tzOffsetMinutes } from '../utils/timeUtils' // small helper

function getParts(date, tz) {
    const fmt = new Intl.DateTimeFormat('en-US', {
        timeZone: tz, hour12: false,
        hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short'
    })
    const parts = fmt.formatToParts(date)
    const map = {}
    parts.forEach(p => { if (p.type) map[p.type] = p.value })
    const h = Number(map.hour), m = Number(map.minute), s = Number(map.second)
    const h12 = ((h % 12) === 0) ? 12 : (h % 12)
    return { hour24: h, hour12: h12, minute: m, second: s, isPM: h >= 12, tzName: map.timeZoneName || '' }
}

export default function ZoneCard({ zone, offset, cont, pinned, onTogglePin, onShowMeeting, workStart, workEnd, theme, localZoneName = 'your timezone' }) {
    // digital text updates
    const [digital, setDigital] = useState('--:--:--')

    useEffect(() => {
        let mounted = true
        const update = () => {
            const parts = getParts(new Date(), zone)
            if (!mounted) return
            setDigital(`${String(parts.hour12).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}:${String(parts.second).padStart(2, '0')} ${parts.isPM ? 'PM' : 'AM'} • ${parts.tzName}`)
        }
        update()
        const t = setInterval(update, 1000)
        return () => { mounted = false; clearInterval(t) }
    }, [zone])

    // compute time-of-day state for card styling
    // Day: 6-18, Night: 18-6
    const [timeOfDay, setTimeOfDay] = useState('day')
    const [isWorkingHour, setIsWorkingHour] = useState(false)
    const [skyOpacity, setSkyOpacity] = useState({ sun: 0, moon: 0 })

    useEffect(() => {
        const update = () => {
            const parts = getParts(new Date(), zone)
            const h = parts.hour24

            // Simplified Day/Night logic
            const isDay = h >= 6 && h < 18
            setTimeOfDay(isDay ? 'day' : 'night')

            // Working hours check (9 AM to 5 PM)
            setIsWorkingHour(h >= 9 && h < 17)

            // SVG Opacity Logic
            // Sun visible during day, Moon visible during night
            setSkyOpacity({
                sun: isDay ? 1 : 0,
                moon: isDay ? 0 : 0.4
            })
        }
        update()
        const t = setInterval(update, 60_000) // update once a minute
        return () => clearInterval(t)
    }, [zone])

    return (
        <div className={`zone-card card ${theme === 'dark' ? 'dark' : 'light'}`} data-continent={cont} data-time-of-day={timeOfDay}>
            {/* Sky overlay with large SVG watermarks */}
            <div className="sky-overlay">
                <svg className="sky-icon sun" style={{ opacity: skyOpacity.sun }} viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
                    <circle cx="60" cy="60" r="20" />
                    <line x1="60" y1="10" x2="60" y2="25" />
                    <line x1="60" y1="95" x2="60" y2="110" />
                    <line x1="20" y1="20" x2="30" y2="30" />
                    <line x1="90" y1="90" x2="100" y2="100" />
                    <line x1="10" y1="60" x2="25" y2="60" />
                    <line x1="95" y1="60" x2="110" y2="60" />
                    <line x1="20" y1="100" x2="30" y2="90" />
                    <line x1="90" y1="30" x2="100" y2="20" />
                </svg>
              
                <svg className="sky-icon moon" style={{ opacity: skyOpacity.moon}} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g clip-path="url(#a)" fill="#dcdcdcff">
    <path d="M10.5 12a5.25 5.25 0 0 1 5.25 5.333.75.75 0 0 0 .938.738A2.255 2.255 0 0 1 19.5 20.25a2.25 2.25 0 0 1-2.25 2.25H4.5a2.999 2.999 0 1 1 .15-5.997.75.75 0 0 0 .764-.562A5.25 5.25 0 0 1 10.5 12m6.71 4.5a6.75 6.75 0 0 0-13.08-1.485A4.5 4.5 0 0 0 4.5 24h12.75a3.75 3.75 0 1 0 0-7.5z"/>
    <path d="M16.929 2.667a.75.75 0 0 0-.848-1.132 6.89 6.89 0 0 0-4.77 7.504 8 8 0 0 1 1.583.314 5.4 5.4 0 0 1 1.851-5.427 6.89 6.89 0 0 0 6.465 8.616 5.36 5.36 0 0 1-3.361.95c.242.476.442.978.59 1.5a6.89 6.89 0 0 0 5.436-3.06.75.75 0 0 0-.847-1.132 5.389 5.389 0 0 1-6.097-8.133z"/>
  </g>
  <defs>
    <clipPath id="a">
      <path fill="#fff" d="M0 0h24v24H0z"/>
    </clipPath>
  </defs>
</svg>

            </div>

            <button className="pin" onClick={onTogglePin} aria-label="Pin zone">{pinned ? '★' : '☆'}</button>

            <div className="clock-wrap" >
                <ClockFace zone={zone} theme={theme} size={150} />
            </div>

            <div className="title" style={{zIndex: 100}} >
                <div className="zone-title">{zone}</div>
                <div className="zone-sub">UTC{offset >= 0 ? '+' : ''}{Math.floor(Math.abs(offset) / 60)}:{String(Math.abs(offset) % 60).padStart(2, '0')}</div>
            </div>

            <div className={`digital ${isWorkingHour ? 'working-hour' : ''}`} style={{zIndex: 100}}>{digital}</div>

            <div className="card-actions" style={{zIndex: 100}}>
                <button className="btn" onClick={() => onShowMeeting(zone)}>Quick 3h overlap with {localZoneName}</button>
            </div>
        </div>
    )
}
