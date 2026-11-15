# NSA-ASTRA

ASTRA (Autonomous System for Telemetry, Risk, and Assessment) is a prototype health check-in tool for astronauts, built for the NASA Space Apps 2026 challenge "Create Health Monitoring Software for Astronauts on Space Missions".

It compares a crew member with their own normal, from training on Earth through the mission and back, and helps decide what stays private, what the crew acts on, and what goes to the flight surgeon.

**Live site:** https://nsa-astra.vercel.app

> Prototype only. Not a medical device and not medical advice. All crew data is simulated.

## How to use it

Open **https://nsa-astra.vercel.app**. There is no sign-in and nothing to install.

1. **Pick a crew member** from the dropdown at the top right (four people, or "Compare crew").
2. **Pick a day** with the calendar in the top bar, from training on Earth to recovery after landing.
3. **Trigger a condition.** Press "Demo · trigger an alert" at the bottom right and choose one, for example "Kidney stone". The status turns amber or red, a dot appears on the body, and "ASTRA response" lists what ASTRA did: flagged it, compared it with the earlier scan, sent it to the doctor, called Earth, and added follow-up tasks to Today (tagged "New"). "Cancel" clears it.
4. **Hover or tap a dot** on the body to see the structure, the finding and where it was sent. Front / Back turns the figure.
5. **Run a guided scan** from a body area or from a scan task in Today. In flight it ends with the comparison screen: the earlier scan next to today's, with a ring on what changed.
6. **Check in with Mini Astra - Companion.** About five minutes of random questions, a personal one-line reply after each answer, then next steps.
7. **Look at Today.** The schedule is fixed until the person has an amber or red flag; then a task can be delayed or handed to a crewmate who is well.
8. **Open the Data box** to switch between sleep, heart rate, mood, cabin air, radiation and space weather.
9. **"Reset demo"** at the bottom of the page puts everything back.

## What makes it different

ASTRA does not stop at basic vital signs. It also follows the harder conditions that spaceflight causes and that can go unnoticed: blood flow in the neck veins, changes at the back of the eye, bone density, kidney and bladder findings. Each scan is compared with the last one and the exact structure is marked. It is also a daily companion: a private check-in with random questions, replies that fit the answers, and support options on a hard day. A red finding starts a call to Earth automatically.

## What is in this repository

| File | What it is |
|---|---|
| `index.html` | The app: page, styles and logic |
| `astra.css` | The visual design layer |
| `datacard.js` | The Data box: tabs, graphs, time range and the table of numbers |
| `feeds.js` | Live fetches: NASA ISS Live, NASA DONKI, NOAA SWPC GOES, station position |
| `checkin.js` | Mini Astra - Companion, the ASTRA check-in: a companion conversation of about five minutes, drawn at random from a bank of 120 questions, with a one-line reply after each answer (written by an AI model when a key is set — Google Gemini first, then DeepSeek — or scripted replies matched to the answer) and a next-steps screen |
| `api/reply.js` | The small server function that asks Google Gemini (when `GEMINI_API_KEY` is set, otherwise DeepSeek via `DEEPSEEK_API_KEY`) for Mini Astra's reply line, with the scripted replies as fallback |
| `body3d.js` | The body figure: a front and back outline drawn in SVG, with a marker and an anatomical label for every finding |
| `today.js` | The Today to-do list and the Mini Astra - Companion card. The schedule is fixed until the person has an amber or red health flag; then a task can be delayed or handed over within team-set limits, never to a crewmate who is unwell |
| `chart.js` | The shared chart module |
| `compare.js`, `compare.css` | The "How ASTRA works" strip and the "Compare crew" tab |
| `data.js` | Demo and reference data loaded by the page |

There is no build step. Vercel serves the files as they are, and every push to `main` redeploys the site.

## How it stores data

Everything stays in the browser on that device. There is no sign-in. The one exception is Mini Astra (below): for each tapped answer, the question, the option, the crew member's first name and role, the mission day and the earlier taps of the same check-in are sent to the AI model (Google Gemini or DeepSeek) to write a reply. With no key set, nothing is sent and the scripted replies are used. The four crew are named after Apollo astronauts and their profiles and health data are simulated; every day of sleep, mood and resting heart rate comes from real PMData rows.

## Mini Astra - Companion (Google Gemini)

The mind and mood check-in is called Mini Astra - Companion. After each tapped answer it shows one short, warm line written by Google Gemini (`gemini-3.5-flash-lite`, minimal thinking) when `GEMINI_API_KEY` is set, otherwise by DeepSeek (`deepseek-flash`) when `DEEPSEEK_API_KEY` is set. The privacy note names the provider that actually replied.

- The browser calls `/api/reply` on our own site. That function holds the key and calls the provider, so the key never reaches the browser.
- Only the question, the option tapped, the answer band (low, middle or high), the previous two questions and taps of the same check-in, the first name and role, the mission phase and day, and the time of day are sent, so the line can be written for this person and this answer. Health readings are never sent. Free text the crew member types is never sent; it is only checked on the device for crisis words.
- Every reply is checked before it is shown (one sentence, no questions, no numbers, no medical words). If the provider is slow, fails, or no key is set, Mini Astra uses its built-in scripted replies instead.

**Setting the key:** in Vercel, open the `nsa-astra` project, then Settings → Environment Variables, and add `GEMINI_API_KEY` for Production and Preview (optional: `GEMINI_MODEL`, `GEMINI_BASE_URL`; `DEEPSEEK_API_KEY` is used only when no Gemini key is set). Redeploy for it to take effect. Never put the key in a file in this repository.

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

Sample scan images in `scans/` (shown on the scan comparison screen; cropped, greyscale, 440x340, overlays removed):

| File | What it shows | Author | Licence | Source |
|---|---|---|---|---|
| scans/eyes.jpg | OCT of optic nerve and surrounding retina | Bobjgalindo | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Optical_Coherence_Tomography_of_optic_nerve_and_surrounding_retina.jpg |
| scans/neck.jpg | Neck ultrasound, axial view of the internal jugular vein | Cerevisae | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Ultrasound_showing_right_IJV_narrowing_at_the_mid_neck_due_to_mass_effect_from_adjacent_mass.jpg |
| scans/heart.jpg | Echocardiogram, four-chamber view | Not stated (Wikimedia Commons) | Public domain | https://commons.wikimedia.org/wiki/File:Echocardiogram_4chambers.jpg |
| scans/lungs.jpg | Lung ultrasound with B-lines | Tinss | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:B_lines_on_a_lung_ultrasound_of_a_patient_with_fibrosis.jpg |
| scans/bladder.jpg | Kidney ultrasound, sagittal view (used for kidneys and bladder) | Cerevisae | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Ultrasound_of_right_kidney_moderate_hydronephrosis.jpg |
| scans/legs.jpg | Femoral vein ultrasound (colour Doppler, shown in greyscale) | Mikael Häggström, M.D. | CC0 | https://commons.wikimedia.org/wiki/File:Ultrasonography_of_deep_vein_thrombosis_of_the_femoral_vein.jpg |

Fetched live when the page loads:

| Source | What it gives | Link |
|---|---|---|
| NASA ISS Live | Cabin CO2, pressure and temperature, each with its real age | https://push.lightstreamer.com |
| NASA DONKI | Space-weather events | https://ccmc.gsfc.nasa.gov/DONKI-API/get/notifications |
| NOAA SWPC GOES | Proton flux for the last 24 hours | https://services.swpc.noaa.gov/json/goes/primary/integral-protons-1-day.json |
| wheretheiss.at | The station's position now | https://api.wheretheiss.at/v1/satellites/25544 |

The body figure is drawn for this project in SVG. The demo film uses landing footage from NASA and Roscosmos.

None of the thresholds have been validated in astronauts.

## Use of AI

AI tools (Claude) were used to help write and organise code, set up the database, hosting and this README, and to review the project. The team chose the concept and the problems it covers. While the app runs, an AI model (Google Gemini or DeepSeek, whichever key is set) writes Mini Astra's one-line check-in replies; without a key the replies are scripted.
