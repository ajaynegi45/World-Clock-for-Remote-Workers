import React, { useState, useEffect, useMemo } from 'react';

/**
 * ClockFace Component
 * * Props:
 * - zone: Timezone string (e.g., "Asia/Kolkata")
 * - theme: "light" | "dark"
 * - size: number (diameter in pixels)
 * - id: string (unique identifier)
 */
const ClockFace = ({ zone = 'UTC', theme = 'light', size = 200, id }) => {
    const [time, setTime] = useState({ h: 0, m: 0, s: 0 });

    // Update time every second based on the provided timezone
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            try {
                const timeString = now.toLocaleTimeString('en-US', {
                    timeZone: zone,
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                });

                const [h, m, s] = timeString.split(':').map(Number);
                setTime({ h, m, s });
            } catch (e) {
                console.error(`Invalid timezone: ${zone}`, e);
            }
        };

        updateTime(); // Initial call
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, [zone]);

    // Calculate rotation degrees
    // Seconds: 6 degrees per second
    const secondsDeg = time.s * 6;
    // Minutes: 6 degrees per minute + adjustment for seconds
    const minutesDeg = time.m * 6 + time.s * 0.1;
    // Hours: 30 degrees per hour + adjustment for minutes
    const hoursDeg = (time.h % 12) * 30 + time.m * 0.5;

    // Theme configuration
    const isDark = theme === 'dark';

    // Dynamic Styles based on theme
    const styles = {
        container: {
            width: size,
            height: size,
            borderRadius: '50%',
            position: 'relative',
            // Neumorphism shadows
            boxShadow: isDark
                ? '10px 10px 20px #151922, -10px -10px 20px #2f3542'
                : '10px 10px 20px #d1d9e6, -4px -3px 20px #ffffff',
            background: isDark ? '#222831' : '#ecf0f3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'sans-serif',
            transition: 'all 0.3s ease',
        },
        face: {
            width: '90%',
            height: '90%',
            borderRadius: '50%',
            position: 'relative',
            // Inner shadow for depth
            boxShadow: isDark
                ? 'inset 5px 5px 10px #151922, inset -5px -5px 10px #2f3542'
                : 'inset 5px 5px 10px #d1d9e6, inset -5px -5px 10px #ffffff',
        },
        number: {
            position: 'absolute',
            color: isDark ? '#e0e0e0' : '#4a5568',
            fontSize: `${size * 0.1}px`,
            fontWeight: '600',
            textAlign: 'center',
            width: `${size * 0.15}px`,
            height: `${size * 0.15}px`,
            lineHeight: `${size * 0.15}px`,
        },
        tick: {
            position: 'absolute',
            backgroundColor: isDark ? '#555' : '#cbd5e0',
            width: '2px',
            height: '6px',
            borderRadius: '2px',
            left: '50%',
            transformOrigin: '50% 0', // Not used directly, but conceptual
        },
        centerDot: {
            width: `${size * 0.04}px`,
            height: `${size * 0.04}px`,
            borderRadius: '50%',
            backgroundColor: isDark ? '#cbd5e0' : '#718096',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            border: `2px solid ${isDark ? '#e53e3e' : '#e53e3e'}`, // Red accent
        },
        hand: {
            position: 'absolute',
            bottom: '50%',
            left: '50%',
            transformOrigin: '50% 100%',
            borderRadius: '4px',
            transition: 'transform 0.05s cubic-bezier(0.4, 2.08, 0.55, 0.44)',
        },
        hourHand: {
            backgroundColor: isDark ? '#ffffff' : '#4a5568',
            width: `${size * 0.025}px`,
            height: '28%',
            marginLeft: `-${size * 0.0125}px`,
            zIndex: 5,
        },
        minuteHand: {
            backgroundColor: isDark ? '#e2e8f0' : '#718096',
            width: `${size * 0.015}px`,
            height: '38%',
            marginLeft: `-${size * 0.0075}px`,
            zIndex: 6,
        },
        secondHand: {
            backgroundColor: '#e53e3e', // Red
            width: `${size * 0.01}px`,
            height: '42%',
            marginLeft: `-${size * 0.005}px`,
            zIndex: 7,
        }
    };

    // Generate numbers 12, 3, 6, 9
    const renderNumbers = () => {
        const positions = [
            { num: 12, top: '5%', left: '50%', transform: 'translate(-50%, 0)' },
            { num: 3, top: '50%', right: '5%', transform: 'translate(0, -50%)' },
            { num: 6, bottom: '5%', left: '50%', transform: 'translate(-50%, 0)' },
            { num: 9, top: '50%', left: '5%', transform: 'translate(0, -50%)' },
        ];

        return positions.map((pos) => (
            <div
                key={pos.num}
                style={{
                    ...styles.number,
                    top: pos.top,
                    bottom: pos.bottom,
                    left: pos.left,
                    right: pos.right,
                    transform: pos.transform,
                }}
            >
                {pos.num}
            </div>
        ));
    };

    // Generate ticks for other hours
    const renderTicks = () => {
        const ticks = [];
        for (let i = 0; i < 12; i++) {
            if (i % 3 !== 0) { // Skip 12, 3, 6, 9
                const deg = i * 30;
                // Calculate position on the circle
                // This is a bit complex in pure CSS without trig, but we can rotate a container
                // Easier method: Rotate a div from the center
                ticks.push(
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            top: '0',
                            left: '0',
                            width: '100%',
                            height: '100%',
                            transform: `rotate(${deg}deg)`,
                            pointerEvents: 'none',
                        }}
                    >
                        <div
                            style={{
                                width: `${size * 0.01}px`,
                                height: `${size * 0.05}px`,
                                backgroundColor: isDark ? '#4a5568' : '#cbd5e0',
                                margin: `${size * 0.05}px auto 0`, // Push it down from edge
                                borderRadius: '4px',
                            }}
                        />
                    </div>
                );
            }
        }
        return ticks;
    };

    return (
        <div id={id} style={styles.container}>
            <div style={styles.face}>
                {renderNumbers()}
                {renderTicks()}

                {/* Hour Hand */}
                <div
                    style={{
                        ...styles.hand,
                        ...styles.hourHand,
                        transform: `rotate(${hoursDeg}deg)`,
                    }}
                />

                {/* Minute Hand */}
                <div
                    style={{
                        ...styles.hand,
                        ...styles.minuteHand,
                        transform: `rotate(${minutesDeg}deg)`,
                    }}
                />

                {/* Second Hand */}
                <div
                    style={{
                        ...styles.hand,
                        ...styles.secondHand,
                        transform: `rotate(${secondsDeg}deg)`,
                    }}
                />

                {/* Center Dot */}
                <div style={styles.centerDot} />
            </div>
        </div>
    );
};


export default ClockFace;
