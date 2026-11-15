# NSA-ASTRA

Baseline is a prototype health check-in tool for astronauts, built for the NASA Space Apps 2026 challenge "Create Health Monitoring Software for Astronauts on Space Missions".

It compares a crew member with their own normal, from training on Earth through the mission and back, and helps decide what stays private, what the crew acts on, and what goes to the flight surgeon.

**Live site:** https://nsa-astra.vercel.app

> Prototype only. Not a medical device and not medical advice. All crew data is simulated.

## What is in this repository

| File | What it is |
|---|---|
| `index.html` | The whole app: page, styles and logic |
| `data.js` | Demo and reference data loaded by the page |

There is no build step. Vercel serves the files as they are, and every push to `main` redeploys the site.

## How it stores data

- **Signed out (default):** everything stays in the browser on that device.
- **Signed in:** check-ins, and anything the crew member sends to their doctors, are copied to a Supabase database. Row-level security means a crew member can read only their own rows, and the flight surgeon role can read only what was sent.

The Supabase address and publishable key in `index.html` are public values that are safe to ship in a browser. The secret service key is not in this repository and must never be added to it.

## Data and sources

- **Simulated crew:** PMData lifelogging dataset (Simula, CC BY 4.0), with volunteers relabelled as crew members.
- **Stand-up test curves:** CVES dataset on PhysioNet (ODC-By 1.0). These are older adults on Earth, not astronauts.
- **Cabin air:** NASA ISS Live public telemetry.
- **Space weather and radiation samples:** NASA DONKI and NASA OSDR RadLab.
- **Limits:** NASA-STD-3001 where NASA sets a number; otherwise clinical scores, labelled as non-NASA in the app.

None of the thresholds have been validated in astronauts.

## Use of AI

AI tools (Claude) were used to help write and organise code, set up the database, hosting and this README, and to review the project. The team chose the concept and the problems it covers.
