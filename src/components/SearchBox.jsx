/**
 * Quick search box for filtering zones. Very small component.
 * - props: query, onChange, placeholder
 *
 * Beginner notes:
 * - We lift search state to App.jsx; this component simply renders input and calls onChange.
 */

import React from 'react'

export default function SearchBox({ query, onChange, placeholder }) {
    return (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1, minWidth: '280px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
                <span style={{ 
                    position: 'absolute', 
                    left: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    fontSize: '18px',
                    opacity: 0.4,
                    pointerEvents: 'none'
                }}>🔍</span>
                <input
                    aria-label="Search timezones"
                    className="search-input"
                    value={query}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder || "Search timezones..."}
                    style={{ 
                        width: '100%',
                        paddingLeft: '40px'
                    }}
                />
            </div>
            {query && (
                <button 
                    className="btn" 
                    onClick={() => onChange('')}
                    style={{ whiteSpace: 'nowrap' }}
                >
                    Clear
                </button>
            )}
        </div>
    )
}

