# World Clock Pro — Global Time, Smart Overlaps, Remote-Work Focus

A modern, beginner-friendly world-clock dashboard designed for people working remotely across global teams.
Built originally for India ↔ US/UK collaboration, but works for any time zone on Earth.

The goal is simple: make it effortless to compare times, track important zones, and schedule meetings that avoid unnecessary late nights.

---

## Why this project exists

Working across continents is chaotic without the right tools.
This app solves the three core problems remote workers face:

1. **You want to compare your local time (India) to multiple countries at once.**
   The app displays clean analog clocks + digital time for every zone.

2. **You don’t want to search endlessly for a specific country.**
   Time zones are grouped into continents and sorted by *actual UTC offset*, not alphabetical order.

3. **You need to find a meeting time that works for both sides.**
   The 3-hour overlap finder shows whether a meeting window exists and visually highlights shared working hours.

---

## Key Features

### 1. Analog clocks (clean, readable, responsive)

Each clock includes:

* Hour, minute, and second hands
* Pixel-perfect circular indices
* Auto-scaled numbers positioned using trigonometry
* Smooth second-hand animation
* Localized digital time with AM/PM

All calculations are based on your system clock + IANA timezone rules.

---

### 2. Day/Night mode built into the clock cards

Each timezone card visually expresses the sky state:

* **Morning** — soft yellow/white gradient
* **Afternoon** — bright white
* **Evening** — orange/blue dusk
* **Night** — deep navy shade
* Subtle **Sun / Sunset / Moon SVG overlays** fade based on the zone’s local time

This allows you to glance at a card and instantly know whether the place is awake, working, or sleeping.

---

### 3. Smart timezone ordering (ascending UTC offset)

Time zones are not alphabetical.
They are sorted by their real-time UTC offset:

* Makes scanning intuitive
* Helps avoid mistakes like comparing India to New York when DST changes
* Places nearby offsets beside each other

---

### 4. Continent-based grouping

You can browse zones under:

* Africa
* Antarctica
* Asia
* Australia
* Europe
* North America
* South America

This keeps long lists manageable and helps identify countries at a glance.

---

### 5. Pin your favorite time zones

You can star any timezone.
Pinned zones appear at the top in a “Favorites” section.

**Data persists in localStorage**, so pins remain even after refreshing or reopening.

---

### 6. Quick Meeting Overlap Finder

A crucial feature for real remote work.

You pick a timezone → click **Quick 3h overlap with India** → you get:

* Exact overlap within the next 48 hours
* Visual bars showing each region’s working hours
* Highlighted segments where both sets overlap
* 15-minute resolution (if enabled)

If no overlap is possible, the app tells you plainly.

---

### 7. Light and Dark Theme with Toggle

* Button in the header switches modes
* Auto-saves preference in localStorage
* Smooth transitions for backgrounds, typography, and gradients

Useful for night work or bright daytime screens.

---

### 8. Fully responsive design

Works across:

* Desktop
* Tablet
* Mobile 
* Ultra-wide layouts

Responisve from min 320px to 1200px max.

Clock sizes adapt dynamically to container size.

---

## License

MIT — free to use, modify, or redistribute.
