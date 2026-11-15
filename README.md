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
| `checkin.js` | The mood check-in: five fixed questions in a scripted personal voice, with an optional read-aloud using the browser's built-in speech |
| `body3d.js` | The rotatable 3D body figure with a marker for every area (three.js, loaded on demand) |
| `today.js` | The Today to-do list with wellbeing permissions (delay or hand over, within team-set limits) and the Mind card |
| `chart.js` | The shared chart module |
| `compare.js`, `compare.css` | The "How ASTRA works" strip and the "Compare crew" tab |
| `data.js` | Demo and reference data loaded by the page |

There is no build step. Vercel serves the files as they are, and every push to `main` redeploys the site.

## How it stores data

Everything stays in the browser on that device. There is no sign-in and nothing is sent to a server. The four crew profiles are simulated; every day of sleep, mood and resting heart rate comes from real PMData rows.

## How to try it

1. Pick a crew member from the dropdown at the top right (four people and "Compare crew").
2. Pick a mission day, from training to recovery.
3. Press "Demo · trigger an alert" at the bottom right and watch the status turn amber or red.

## How scan comparison works

A guided scan covers a general body area: eyes, neck veins, heart, lungs, bladder and kidneys, or legs. ASTRA's job is to compare the new images with the same crew member's earlier scans and with their pre-flight baseline, and to mark the exact place where something has changed, for example "Left heel bone: less dense than the pre-flight scan". Doctors on the ground then review the images and reply.

In this prototype the scan results are simulated. The comparison step is the part a real system would connect to image-analysis software: that software would line up each scan with the previous ones day by day, measure what changed, and pass ASTRA the location and size of any anomaly. ASTRA would show it on the body figure, set the amber or red status, and send it to the flight surgeon. ASTRA does not diagnose.

## Data and sources

Bundled in `data.js`:

| Dataset | Used for | Licence | Link |
|---|---|---|---|
| PMData (Simula) | Daily sleep, mood and resting heart rate for the four crew. Volunteers p06, p07, p01 and p09, Nov 2019 to Mar 2020, relabelled as crew. | CC BY 4.0 | https://datasets.simula.no/pmdata/ |
| CVES (PhysioNet) | Stand-up heart-rate curve (67 recordings) and the two traces replayed on the live monitor. These are older adults on Earth, not astronauts. | ODC-By 1.0 | https://physionet.org/content/cves/1.0.0/ |
| Inspiration4 crew blood data (NASA OSDR) | The real-astronaut chart on the Compare page. | Not confirmed | https://osdr.nasa.gov/bio/repo/data/studies/OSD-575 and https://osdr.nasa.gov/bio/repo/data/studies/OSD-569 |
| NASA OSDR RadLab | Radiation dose rate by ISS module, sample from 5 Dec 2019. | Not confirmed | https://visualization.osdr.nasa.gov/radlab/api/ |
| NASA DONKI | Space-weather notifications, used as the fallback sample. | Not confirmed | https://ccmc.gsfc.nasa.gov/DONKI-API/get/ |
| NASA ISS Live snapshot | Cabin air values, used when the live feed is down. | Not confirmed | https://push.lightstreamer.com |
| NASA-STD-3001 Vol 1 and Vol 2 | The limits where NASA sets a number. Other limits are clinical scores, labelled as non-NASA in the app. | Not confirmed | https://standards.nasa.gov/ |

Fetched live when the page loads:

| Source | What it gives | Link |
|---|---|---|
| NASA ISS Live | Cabin CO2, pressure and temperature, each with its real age | https://push.lightstreamer.com |
| NASA DONKI | Space-weather events | https://ccmc.gsfc.nasa.gov/DONKI-API/get/notifications |
| NOAA SWPC GOES | Proton flux for the last 24 hours | https://services.swpc.noaa.gov/json/goes/primary/integral-protons-1-day.json |
| wheretheiss.at | The station's position now | https://api.wheretheiss.at/v1/satellites/25544 |

None of the thresholds have been validated in astronauts.

## Use of AI

AI tools (Claude) were used to help write and organise code, set up the database, hosting and this README, and to review the project. The team chose the concept and the problems it covers.
