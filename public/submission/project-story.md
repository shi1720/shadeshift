# ShadeShift

## Elevator pitch

ShadeShift helps event operators decide where a limited budget can reduce outdoor arrival and queue exposure, with transparent assumptions and a plan for community reuse.

## Inspiration

The ticket gets you a seat. It does not get you shade.

A visitor’s event experience begins long before the turnstile. It includes the walk from transit, the ride-share arrival, and the outdoor queue. An operations team has a concrete decision: where should its limited preparation budget go?

We chose Track 3 because this decision connects visitor activity, heat and the built environment. Houston’s stadium-and-transit geography provides a grounded case. We use the 2026 World Cup as a case study for future games, concerts, festivals and conventions.

## What it does

ShadeShift combines a geographic evidence view with an interactive investment workbench. Operators set a budget and a minimum community-weighted allocation, change arrival and queue assumptions, compare interventions, and inspect baseline versus proposed direct-sun exposure.

The detailed Houston pilot contains six candidate arrival links. Its historical evidence includes 654 measured street-temperature observations and official METRO stop coordinates. An eleven-market atlas compares 49 local-afternoon weather samples per venue using one consistent historical model.

Users can edit package cost allowances, test lower delivered effectiveness, compare pinned plans, export spreadsheet-safe CSV and versioned JSON, import a scenario, and save private plans with ChatGPT sign-in. A legacy view separates everyday resident reuse from event-day activity and accounts for maintenance and repeated event operations.

## How we built it

The application uses React and TypeScript with Vinext, Leaflet maps, Recharts charts, a Cloudflare-compatible Worker and D1 persistence through Sites. Authentication and saved-plan ownership checks run on the server.

The pure TypeScript allocation engine exhaustively checks up to 15,625 possible portfolios. It maximizes avoided direct-sun person-minutes within the initial budget and community constraint. A transparent finite search avoids inventing demand or effects with a language model.

Baseline exposure equals arrivals multiplied by walking-plus-queue duration, unshaded fraction and a time-of-day sunlight assumption. Combined shade and queue improvements modify those factors before subtraction, avoiding additive double counting. Water service remains a separate refill-capacity measure.

The data pipeline retains raw weather responses and rebuilds the 11-market benchmark offline. Each exported plan freezes its inputs, model version, catalog and calculated results. Historical evidence, editable assumptions and calculated outputs have distinct labels.

## Results

Under the illustrative Houston inputs, 22,000 arrivals create 409,260 direct-sun person-minutes of baseline exposure. A starting $70,000 portfolio models a 23.8% reduction, 1,200 refills of capacity per arrival window, and a 53.3% community-weighted allocation.

With a $75,000 cap and a 25% community minimum, the exposure-maximizing portfolio also spends $70,000 and models a 31.3% reduction. Its community allocation is 27.4% and refill capacity is zero. This tradeoff is visible: the exposure objective does not satisfy every service need. At 60% delivered effectiveness, the same optimized portfolio models an 18.8% reduction.

In the atlas’s historical 49-afternoon sample, Houston has the highest median heat index at 97.8°F, while Philadelphia has the highest 95th percentile at 107.8°F. Typical heat and hot-tail conditions suggest different preparation needs. These are sampled modeled-weather comparisons, not readiness rankings or forecasts.

All intervention outcomes are scenario estimates. No venue deployment, clinical benefit, customer adoption or revenue is claimed.

## Challenges

The largest analytical challenge was false precision. A map can look authoritative even when its visitor inputs are hypothetical or its temperatures are historical. We made those differences part of the interface.

We also treated sun exposure, water service, weather, money and resident use as different quantities. They should not disappear into a single unvalidated “safety score.”

Independent review found and helped correct sign-in draft loss, export traceability, zero-benefit recommendations, resident timing assumptions and keyboard-dialog behavior. Automated tests verify the calculations and workflows, not empirical field accuracy.

## What we learned

A sustainability product needs a buyer and a recurring job. Our first buyer hypothesis is the venue operations director who prepares each event’s outdoor arrival plan. The product must save planning effort and improve an actual allocation decision to earn repeat use.

Established GIS, heat-mapping, weather-alert and incident-management products already serve this market. Our proposed contribution is the narrow step between those tools: an inspectable budget-to-intervention comparison with a repeatable evidence trail.

## Commercial path and legacy

We propose a $5,000 assisted two-event pilot and a $6,000 annual venue subscription as prices to test, not validated willingness to pay. Physical infrastructure, staffing and permits remain separate. The first pilot measures planning time, checks demand and shade on site, compares modeled and observed inputs, and tests renewal value.

Reusable shade needs an owner, a maintenance allowance and a verified community destination. Our legacy model counts resident walking exposure separately and makes reuse days and sunlight assumptions editable. Future defensibility would come from verified venue data and actual deployment performance, not ownership of public heat maps.

## What’s next

Field-check the six candidate links with venue, transit and accessibility staff. Replace illustrative inputs with pedestrian counts, shade audits, queue observations and supplier quotes. Trial a reversible approved portfolio, document prediction error, and evaluate a second event before expanding.

## Built with

TypeScript, React, Vinext, Leaflet, Recharts, Zod, Drizzle, Cloudflare Workers/D1, Sites authentication and hosting, Playwright, Node test runner, Python, H3AT/CAPA/HARC observations, Houston METRO GTFS, Open-Meteo/ERA5 and OpenStreetMap.

## Data and methodology attachments

Submit the anonymous methods/results PDF and deck from this folder. Source dates and limitations are also embedded in the app. Preserve third-party attribution. Applicant identity appears only in permitted organizer fields, not this narrative.
