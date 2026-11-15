# NSA-ASTRA

ASTRA (Autonomous System for Telemetry, Risk, and Assessment) is a prototype health check-in tool for astronauts, built for the NASA Space Apps 2026 challenge "Create Health Monitoring Software for Astronauts on Space Missions".

It compares a crew member with their own normal, from training on Earth through the mission and back, and helps decide what stays private, what the crew acts on, and what goes to the flight surgeon.

**Live site:** https://nsa-astra.vercel.app

> Prototype only. Not a medical device and not medical advice. All crew data is simulated.

## What is in this repository

| File | What it is |
|---|---|
| `index.html` | The app: page, styles and logic |
| `astra.css` | The visual design layer |
| `datacard.js` | The Data box: tabs, graphs, time range and the table of numbers |
| `feeds.js` | Live fetches: NASA ISS Live, NASA DONKI, NOAA SWPC GOES, station position |
| `live.js` | The live monitor page (replays a real heart-rate recording) |
| `compare.js`, `compare.css` | The "How ASTRA works" strip and the "Compare crew" tab |
| `data.js` | Demo and reference data loaded by the page |

There is no build step. Vercel serves the files as they are, and every push to `main` redeploys the site.

## How it stores data

Everything stays in the browser on that device. There is no sign-in and nothing is sent to a server. The four crew profiles are simulated; every day of sleep, mood and resting heart rate comes from real PMData rows.

## How to try it

1. Pick a crew member from the dropdown at the top right (four people, "Live monitor" and "Compare crew").
2. Pick a mission day, from training to recovery.
3. Press a "Simulate an issue" button and watch the status turn amber or red.

## Data and sources

- **Simulated crew:** PMData lifelogging dataset (Simula, CC BY 4.0), with volunteers relabelled as crew members.
- **Stand-up test curves:** CVES dataset on PhysioNet (ODC-By 1.0). These are older adults on Earth, not astronauts.
- **Cabin air:** NASA ISS Live public telemetry.
- **Space weather and radiation samples:** NASA DONKI and NASA OSDR RadLab.
- **Limits:** NASA-STD-3001 where NASA sets a number; otherwise clinical scores, labelled as non-NASA in the app.

None of the thresholds have been validated in astronauts.

## Use of AI

AI tools (Claude) were used to help write and organise code, set up the database, hosting and this README, and to review the project. The team chose the concept and the problems it covers.
