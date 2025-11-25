/**
 * App.jsx
 *
 * Main application. It wires up:
 *  - theme toggle (light/dark)
 *  - loading timezone list
 *  - continent filters and search
 *  - pinned favorites persistence
 *  - render of ZoneCard components
 *
 * This file contains beginner-friendly comments explaining each piece.
 */

import React, { useEffect, useMemo, useState } from 'react'
import ClockFace from './components/ClockFace'
import ZoneCard from './components/ZoneCard'
import MeetingPanel from './components/MeetingPanel'
import SearchBox from './components/SearchBox'
import { buildZonesList, continentOf } from './utils/timeUtils'

// Path to the uploaded reference image — dev note: the environment transform tool can map this local path.
// You can also copy the file into `public/reference.png` and set this to '/reference.png'
export const REFERENCE_IMAGE_PATH = '/mnt/data/Screenshot 2025-11-25 at 11.20.38 AM.png'

export default function App() {
    // theme stored in localStorage key 'wc_theme'
    const [theme, setTheme] = useState(() => localStorage.getItem('wc_theme') || 'light')

    // Auto-detect user's timezone
    const [userTimezone, setUserTimezone] = useState(() => {
        try {
            return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata'
        } catch {
            return 'Asia/Kolkata'
        }
    })

    // pinned favorites stored as array of zone strings
    const [pinned, setPinned] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('favZones') || '[]')
        } catch {
            return []
        }
    })

    // UI states
    const [zones, setZones] = useState([]) // full zone objects with offset
    const [filterContinent, setFilterContinent] = useState('all')
    const [showAll, setShowAll] = useState(true)
    const [query, setQuery] = useState('')
    const [meetingTarget, setMeetingTarget] = useState(null) // zone string to show MeetingPanel
    const [workWindow, setWorkWindow] = useState({ start: 9, end: 17 })

    // apply theme by toggling class on <html>
    useEffect(() => {
        const html = document.documentElement
        if (theme === 'dark') html.classList.add('dark')
        else html.classList.remove('dark')
        localStorage.setItem('wc_theme', theme)
    }, [theme])

    // load zones once on mount (uses the browser Intl APIs inside buildZonesList)
    useEffect(() => {
        const list = buildZonesList()
        setZones(list)
    }, [])

    // persist pinned changes to localStorage
    useEffect(() => {
        localStorage.setItem('favZones', JSON.stringify(pinned))
    }, [pinned])

    // helper: toggle pinned zone
    const togglePin = (zone) => {
        setPinned(prev => {
            const copy = [...prev]
            const idx = copy.indexOf(zone)
            if (idx >= 0) copy.splice(idx, 1)
            else copy.push(zone)
            return copy
        })
    }

    // computed: filter zones by continent and query, but keep pinned at top
    const filteredZones = useMemo(() => {
        const q = query.trim().toLowerCase()
        const byContinent = zones.filter(z => filterContinent.toLowerCase() === 'all' ? true : z.cont === filterContinent)
        const byQuery = q ? byContinent.filter(z => z.tz.toLowerCase().includes(q) || z.tz.replace('_', ' ').toLowerCase().includes(q)) : byContinent

        // pinned first (but keep original offset ordering)
        const pinnedItems = byQuery.filter(z => pinned.includes(z.tz))
        const others = byQuery.filter(z => !pinned.includes(z.tz))
        return [...pinnedItems, ...others]
    }, [zones, pinned, filterContinent, query])

    // continent list for UI
    const continents = ['All', 'Africa', 'Antarctica', 'Asia', 'Australia', 'Europe', 'North America', 'South America']

    return (
        <div className="app-wrap">
            <header className="app-header">
                <div>
                    <h1>World Clock for Remote Workers</h1>
                    <p className="muted">A modern, beginner-friendly world-clock dashboard designed for people working remotely across global teams.</p>
                </div>

                <div className="header-right">
                    <button className="theme-toggle" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>
                        {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
                    </button>
                    {/*<img className="reference" src={REFERENCE_IMAGE_PATH} alt="reference" />*/}
                </div>
            </header>

            <main>
                {/* Top Local Reference */}
                <section className="top">
                    <div className="india-card card">
                        <div className="clock-left">
                            <ClockFace zone={userTimezone} id="localClock" theme={theme} size={150} />
                        </div>
                        <div className="info">
                            <h2>Your Local Time — {userTimezone}</h2>
                            <div className="meta muted">Reference time. Adjust working hours and search for zones below.</div>
                        </div>
                    </div>

                    {meetingTarget && (
                        <MeetingPanel
                            zone={meetingTarget}
                            localZone={userTimezone}
                            workStart={workWindow.start}
                            workEnd={workWindow.end}
                            onClose={() => setMeetingTarget(null)}
                        />
                    )}
                </section>

                {/* Controls: search, work window, continent filters */}
                <section className="controls">
                    <SearchBox query={query} onChange={setQuery} placeholder="Search by city / country / timezone (e.g. London, New_York, Tokyo)" />
                    <label className="control-inline">
                        Working hours
                        <input type="number" value={workWindow.start} onChange={(e) => setWorkWindow(w => ({ ...w, start: Number(e.target.value) }))} min={0} max={23} />
                        -
                        <input type="number" value={workWindow.end} onChange={(e) => setWorkWindow(w => ({ ...w, end: Number(e.target.value) }))} min={1} max={24} />
                    </label>

                    <div className="continent-filters">
                        {continents.map(c => (
                            <button key={c} className={`cont-btn ${filterContinent === c ? 'active' : ''}`} onClick={() => setFilterContinent(c)}>
                                {c}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Zones grid */}
                <section className="zones-grid">
                    {filteredZones.map(z => (
                        <ZoneCard
                            key={z.tz}
                            zone={z.tz}
                            offset={z.offset}
                            cont={z.cont}
                            pinned={pinned.includes(z.tz)}
                            onTogglePin={() => togglePin(z.tz)}
                            onShowMeeting={() => setMeetingTarget(z.tz)}
                            workStart={workWindow.start}
                            workEnd={workWindow.end}
                            theme={theme}
                            localZoneName={userTimezone.split('/').pop().replace(/_/g, ' ')}
                        />
                    ))}
                </section>
            </main>

            <footer className="muted">Pinned zones persist to localStorage. Uses browser Intl API for accurate offsets & DST.</footer>
        </div>
    )
}
