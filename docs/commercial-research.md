# ShadeShift — commercial strategy and submission narrative

Working tagline: **Turn a heat map into a funded shade plan.**

Public pitch opener: **The ticket gets you a seat. It does not get you shade.**

Track 3: Public Health & the Built Environment. This is a September 2026 submission using World Cup 2026 as a historical case and a planning template for subsequent events. Do not describe the tournament as upcoming. Judging materials below are anonymous; creator credit belongs in the project README and submission fields only if the rules permit it.

## Core product promise

ShadeShift helps a venue operations team decide where a limited event budget can remove the most time spent in direct sun. The Houston case connects historic measured heat, real transit and venue locations, and explicitly hypothetical pedestrian demand. A small, auditable optimizer compares shade and queue interventions. Water access remains a separate service measure: a water station does not mathematically cancel exposure to sunlight. A public comparison view lets residents inspect the same assumptions and see which assets could keep serving the community after the event.

**One customer, one decision, one unit:** an event operations director; allocate a defined shade/queue budget; estimated direct-sun person-minutes avoided. This unit is an exposure-planning proxy, not a clinical outcome, thermal comfort index, or measured temperature reduction.

**Analogy:** weather tools explain whether a hot day is coming; ShadeShift helps an operations team compare where to spend its preparation budget. It supplements qualified safety planning, site permissions, and existing incident systems.

## Verified context and evidence boundaries

- Houston's official 2026 transport map marks Stadium Park/Astrodome on the Red Line at Houston Stadium. FIFA's Houston transport page also identifies the station and a designated rideshare area in the Yellow Lot near McNee Road. This makes station-to-venue and rideshare-to-gate areas a grounded starting point. It does not prove that any drawn path is a surveyed, publicly accessible route. Sources: [City of Houston transport map](https://www.houstontx.gov/houston2026/pdfs/metro-map-overview.pdf), [FIFA Houston transport](https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/stadiums/houston/transport).
- Research retrieved 654 measured street-temperature sample points around NRG from the August 7, 2020, afternoon mobile campaign, 15:00–16:00 local. The subset ranges from 93.2°F to 96.62°F, with sample mean approximately 94.70°F. These are historical street samples from one survey period, not a current forecast, a citywide mean, a heat-index layer, or evidence of actual 2026 visitor exposure. Source: [HARC/CAPA Houston afternoon dataset](https://www.arcgis.com/home/item.html?id=d8dd6004e1ab4dccbfb36a5992f480bc). Data artifact supplied by research agent: `/tmp/houston-historical-heat.geojson`. Retain dataset attribution.
- Houston's 2024 H3AT campaign reports a maximum of 103°F and a 14°F difference between neighborhoods on August 10, 2024, from 431,348 points. That campaign does not cover the immediate NRG pilot area; do not attach its temperatures to NRG. [H3AT 2024 results](https://www.h3at.org/2024-campaign/2024-campaign-results/).
- The National Weather Service explains that heat index assumes shade and light wind; full sun can raise apparent exposure. Do not subtract a fixed 15°F for every canopy, infer illness probability, or call air temperature heat index. [NWS heat forecast tools](https://www.weather.gov/safety/heat-index).
- No customer interviews, paid pilots, procurement commitments, measured deployment results, medical validation, or production certification have been completed. All prices below are testable hypotheses. Any modeled percentage displayed by the app must be labeled as a scenario result, with its inputs and baseline.

### Comparable host-location benchmark now available

The research pipeline also supplies a reproducible historical-weather comparison at all 11 venue coordinates: ERA5 modeled grid weather via Open-Meteo, June 1–July 19, 2025, using 49 daily samples at 15:00 local time per venue. These are reanalysis estimates, not on-site observations or a 2026 forecast. One season is not a climate normal. Source: [Open-Meteo historical API documentation](https://open-meteo.com/en/docs/historical-weather-api). Credit Open-Meteo and ERA5 / ECMWF / Copernicus; preserve coordinate attribution.

A useful analytical finding from this sampled season: Houston's median shade heat index is 97.8°F and its 95th percentile 105.0°F; Philadelphia's median is 90.7°F and its 95th percentile 107.8°F. New York / New Jersey's median is 85.0°F and its 95th percentile 102.8°F. Thus the hottest typical location need not have the largest upper-tail value in the comparison. Use this to motivate event-specific planning, not to label one city ready or safe. Validate these numbers against the final artifact before publication. Artifacts: `/tmp/host-climate-2025.json` and `/tmp/fetch-host-climate.py`.

This strengthens the atlas beyond a geographic index while leaving the Houston intervention model uniquely detailed. Keep the two layers separate: cross-host modeled weather benchmark versus Houston measured street samples and assumed exposure planning.

## What makes this different

The novelty is the operational decision loop: **evidence → assumptions → constrained allocation → implementation brief → post-event recalibration.** A map is the entry point; a defensible allocation is the output. Legacy use is a second decision criterion, not a slogan. For example, a relocatable canopy that serves a station approach on event day and a recurring community market later may be preferred under a reuse-oriented scenario, with any reuse hours explicitly entered as assumptions.

| Existing option | Verified public emphasis | ShadeShift's proposed role |
|---|---|---|
| Esri ArcGIS heat workflows | Landsat-based surface-heat mapping and broader GIS analysis | Add a focused operational budget allocation workflow with clear separation of measured data and assumptions; export into existing GIS workflows |
| Google Heat Resilience | Tree planting, cool roofs and surface-temperature planning; 2026 expansion includes rooftop reflectivity | Short-horizon event interventions and their reuse; potentially consume long-term city evidence rather than replace it |
| DTN WeatherSentry / Weather Hub | Venue-specific forecasts, weather monitoring, alerts and meteorologist support | Use weather as context for pre-event allocation; no claim to replace forecasting or warning services |
| Juvare WebEOC / event operations | Coordination, incident response, resource management and situational awareness | Supply a pre-event shade plan and after-event evidence package to established operations processes |
| Spreadsheet + QGIS + experienced planner | Flexible and low-cost existing tools; QGIS is free/open source | Earn adoption through lower setup time, repeatable scenarios, understandable outputs and reduced rework |

Sources: [Esri Landsat heat workflow](https://www.esri.com/arcgis-blog/products/arcgis-living-atlas/imagery/learn-to-map-urban-heat-with-landsat), [Google Heat Resilience](https://blog.google/company-news/outreach-and-initiatives/sustainability/google-ai-research-extreme-heat-resilience/), [Google 2026 data expansion](https://research.google/blog/expanding-our-heat-resilience-data-to-50-global-cities/), [DTN WeatherSentry](https://www.dtn.com/weather/outdoor-safety/weathersentry-sports-edition/), [Juvare](https://www.juvare.com/), [QGIS](https://qgis.org/).

These are comparisons of public positioning, not exhaustive feature audits. Do not assert that incumbents cannot optimize, lack equity features, or have higher costs. Juvare already discusses World Cup coordination; “first World Cup planning platform” would be indefensible.

## Commercial thesis

**Initial buyer:** the operations director of a recurring outdoor venue, university athletics department, fairground, or festival producer. Their job includes outdoor arrivals, queue layouts, temporary rentals and deployment handoffs. The economic buyer is likely the venue general manager or event producer. The city heat office, transit agency, public health team and accessibility lead are partners or reviewers, not all simultaneous purchasers.

**Initial wedge:** an assisted planning service for one venue's outdoor arrival and queuing area. Customers bring their existing counts, queue observations, site constraints and supplier costs. ShadeShift returns a comparable set of plans plus a deployment brief. A procurement-ready brief should include location, intervention, budget line, owner, deadline, evidence confidence, site permissions, egress/accessibility checks, and post-event verification tasks. Include only fields actually implemented in claims about the current build.

**Recurring trigger:** each new event changes arrival timing, gates, attendance assumptions, weather context, construction restrictions and available inventory. Saved assets, site constraints and validated counts reduce the work of the next plan. Expansion goes from one venue to a venue portfolio; municipal procurement follows demonstrated repeat use.

**Defensibility hypothesis:** trusted venue-specific data and learning from actual deployments, supplier specifications/costs, operational approvals and repeat-event benchmarks. The optimization algorithm and public heat maps alone are not a moat. Customers must retain data export rights. The current project does not yet possess this data advantage.

**Why pay:** potentially fewer planning hours, more consistent handoffs, and better allocation of existing rental budgets. Do not monetize hypothetical prevented deaths, hospital visits, insurance savings, avoided lawsuits or emissions. A buyer should be able to disprove the value proposition during a small pilot.

### Pricing and costs to validate

All amounts are internally constructed USD estimates, not vendor quotations or proven willingness to pay. Hardware/rentals, permits, certified engineering, licensed medical review, on-site labor and city integrations are separate customer costs.

| Offer | Test price | Included | Estimated delivery cost | Contribution before sales, tax and R&D |
|---|---:|---|---:|---:|
| Assisted one-venue pilot | $5,000 | Two event plans, one baseline audit, assumptions review, training and after-action comparison | $3,600 | $1,400 / 28% |
| Venue annual plan, after pilot | $6,000/year | Repeat scenario planning, saved venue template, exports and bounded support | $2,400/year | $3,600 / 60% |
| Public viewer | $0 | Read-only shared assumptions and outcomes | Included in operator plan | Civic transparency / distribution |

Pilot delivery estimate: 18 analyst hours × $60 = $1,080; 12 implementation/support hours × $60 = $720; 16 observation hours × $35 = $560; travel/equipment allowance $340; contingency $900. Total $3,600. Annual estimate: 30 support/analyst hours × $60 = $1,800; hosting/monitoring allowance $300; administration allowance $300. Total $2,400. These are loaded labor assumptions, not wage facts. Free tiers keep the demonstration inexpensive; do not assume free infrastructure is adequate forever.

**Economic hurdle:** at a buyer-assumed loaded planning cost of $75/hour, a $6,000 license requires 80 hours/year of demonstrated labor savings if that is its only benefit. With 24 events/year, that is approximately 3.3 hours/event. If the pilot cannot show sufficient time or allocation value, lower price, target a more frequent operator, or remain a service business. No made-up market size is needed: an illustrative first cohort of 10 annual customers is $60,000 annual recurring revenue, before churn and expenses, not a revenue forecast.

### Pilot design and go / no-go decision

1. Recruit one operator with two comparable hot-season events and authority over at least two candidate sites. No partner is currently committed.
2. Week 1: walk the site with operations and accessibility leads; verify paths, ownership, shade at relevant times, egress, utilities and installation feasibility. Capture manual counts and queue dwell samples without identifiers.
3. Week 2: estimate baseline exposure, enter vendor quotes and constraints, review low/base/high demand and shade-effect assumptions. Compare the optimizer with the operator's pre-existing plan using the same budget and candidate set.
4. Events 1 and 2: measure actual flow, queue duration, shade coverage and deployment timing. Do not withhold required safety measures or use an untreated unsafe comparison. Use an approved staged rollout or matched observations when appropriate.
5. After each event: report observed inputs separately from modeled outcomes. Compare predicted and observed segment-level counts/dwell/shade. Investigate error and log changes before reuse.
6. Success gates: operator can create/revise a plan in under 30 minutes after setup; no inaccessible or unavailable site survives the field review; predicted peak counts within a prespecified tolerance chosen with the operator (initial target ±25%, not an achieved result); plan stays within approved budget; all actions have an owner; at least one accepted repeat-event plan; buyer verifies enough annual planning value for the proposed price.
7. Stop or narrow if site-data work repeatedly exceeds the pilot budget, operators will not provide counts, no decisions change, or the value cannot justify price. The first purchase should fund a useful planning deliverable even if the SaaS hypothesis fails.

### Adoption plan

- **First 30 days:** discovery with five operations staff across two venue types, plus one accessibility reviewer and one transit/heat-policy contact. Use workflow interviews, not “would you use this?” surveys. Request an anonymized last-event plan and observe a revision. No outreach has been sent.
- **Days 31–60:** one paid pilot and documented data agreement; site verification; two scenario sessions; operator approval of candidate interventions. Keep interventions advisory until site-specific sign-off.
- **Days 61–90:** second event, before/after planning-time measurement, willingness-to-pay test, renewal decision and cost-to-serve review.
- **Distribution:** event-production and venue-management partners can bring recurring portfolios. Transit or resilience grants may fund public-benefit pilots, but grant dependence is not the core revenue model.
- **Production gate:** authenticated tenancy and role permissions, durable storage and backups, audit trail, data retention/deletion, accessibility review, penetration/security testing, operational monitoring, service terms, source licensing, and a support/incident process need verification before commercial operations. A working login alone is not production readiness.

## Anonymous Devpost narrative — ready to adapt to the final implemented build

### Project name
ShadeShift

### Elevator pitch
Turn a heat map into a funded shade plan. ShadeShift helps event operators compare where shade and queue changes can reduce time in direct sun, within a budget, with transparent assumptions and a plan for community reuse.

### Inspiration
The ticket gets you a seat. It does not get you shade.

For an event visitor, the outdoor walk and queue are part of the venue experience. For an operator, they are also a series of budget decisions: which arrival area gets shade, which queue changes first, and what remains useful after the crowd leaves?

We chose Track 3 because this is a specific, practical decision that connects heat, visitor activity and the built environment. Houston's stadium-and-transit setting gives us a grounded case. The World Cup is the starting case; recurring sports, concerts, festivals and community events are the long-term users.

### What it does
ShadeShift connects a map of candidate locations to an interactive budget and scenario comparison. Operators can compare a baseline with a proposed shade-and-queue plan, inspect the assumptions driving the estimates, and see how changing demand changes the allocation.

The primary result is estimated direct-sun person-minutes avoided: people multiplied by time in exposed areas, reduced only through the modeled shade or queue intervention. Water access is reported separately. The product does not claim to predict medical outcomes or turn water into a temperature reduction.

The detailed Houston case uses historical measured heat and real transport/venue anchors. A host-city overview compares a consistent historical modeled-weather sample across the 11 U.S. World Cup host locations. Detailed Houston assumptions and broad city context have different evidence levels; the overview should not be mistaken for 11 equally validated local models.

### How we built it
We separated three layers that dashboards often blur: observed evidence, scenario assumptions, and calculated results. Historical Houston temperature observations supply spatial context. Transport and venue locations anchor the map. Visitor demand, dwell time, shade coverage, intervention effectiveness and costs remain visible planning assumptions until an operator supplies measurements and quotes.

The allocation engine evaluates feasible intervention combinations under the chosen budget. Its objective and constraints are inspectable, so the user can understand why an intervention is selected and what changes when inputs change. Implementation details, tests and data provenance are documented with the code. Replace this sentence with the final verified technology stack in the submission.

### Challenges we ran into
The hardest problem was avoiding false precision. A colored map can look authoritative even when its visitor counts are assumptions or its temperature measurements are years old. We designed the evidence labels and methodology around that limitation.

A second challenge was choosing useful units. Shade exposure, water access, temperatures, money and legacy reuse are different quantities. We keep them separate rather than hiding them inside a single unvalidated “safety score.”

### Accomplishments we are proud of
The project turns an abstract heat concern into a decision that an operator can debate: a budget, candidate locations, a baseline and a proposed allocation. Its transparency is part of its usability. A resident can challenge an assumption; an operator can change a cost; a reviewer can trace a result to its inputs.

Only list actual shipped and verified features here. Do not imply that a paid pilot, deployment or measured public-health improvement has occurred.

### What we learned
A commercially useful sustainability tool needs a buyer and a recurring job. Our first buyer hypothesis is the venue operations team that already plans temporary infrastructure for every event. The long-term opportunity is to learn from verified deployments and reduce the work of producing the next defensible plan.

### What's next
Validate one venue through a paid two-event pilot: field-check candidate sites, replace assumed counts and costs, compare predictions with observations, and measure planning time saved. Then test whether repeat use supports an annual subscription. Community reuse remains explicit: assets and improvements should have an owner and a purpose after the headline event.

### Built with
Populate only from the final package manifest and deployed services; do not list planned integrations as implemented.

## Verbatim three-minute voiceover

Read at approximately 135–140 words per minute. This version is approximately 400 words and deliberately avoids fragile numerical outputs. Record the exact screen sequence only after checking that each interaction is present in the shipped app.

> The ticket gets you a seat. It does not get you shade.
>
> Imagine arriving in Houston for a major event. You leave the train, walk toward the stadium, and join a queue. The event has an indoor destination, but your journey still includes time outside.
>
> Now imagine you run that event. You have a limited budget for shade, queue improvements and water access. Where should it go?
>
> ShadeShift turns that question into a plan you can explain.
>
> We built it for Track Three, using the twenty twenty-six World Cup as a case for future events. Houston is our detailed pilot. The other ten U.S. host locations provide broader context.
>
> Start with the map. Our Houston evidence includes historical street-temperature observations and real transport and venue locations. Those observations are clearly dated. They are not today's weather, and they are not a prediction of how many people will arrive.
>
> The visitor counts, waiting times, intervention effects and costs are visible scenario assumptions. An operator can replace them with measurements and supplier quotes.
>
> Here, I choose a budget and compare the baseline with an intervention plan. The model looks for a feasible allocation across the candidate sites. Its main unit is direct-sun person-minutes: how many people spend how long in exposed areas.
>
> Change the assumptions, and the recommendation can change. That matters. A plan should reveal its uncertainty before someone spends money on it.
>
> Notice that water access is separate. A water station provides an important service, but our model does not pretend that drinking water removes sunlight, or that a modeled exposure reduction proves an avoided illness.
>
> We also ask what happens after the event. Can an asset support another event or a community gathering? Who will maintain it? Legacy becomes a planning decision rather than a promise on the final slide.
>
> Our first customer hypothesis is a venue operations team. The recurring job is preparing each event's outdoor arrival and queue plan. We would begin with a paid, two-event pilot, measure planning time, validate the inputs on site, and test whether repeated use earns a subscription.
>
> Heat maps, weather alerts and incident systems already exist. Our contribution is the decision between them: where to put a limited preparation budget, why that allocation makes sense, and what needs verification before deployment.
>
> ShadeShift. Turn a heat map into a funded shade plan.

### Recording shot list

| Time | Visual | Purpose |
|---|---|---|
| 0:00–0:20 | Opening title, then Houston map | Establish walk-and-queue problem |
| 0:20–0:45 | Budget and baseline view | Show a real decision |
| 0:45–1:10 | Historical layer / source details | Establish data provenance |
| 1:10–1:40 | Run plan, change budget or demand, show comparison | Demonstrate interactive allocation |
| 1:40–2:00 | Assumptions and water-access result | Explain boundaries |
| 2:00–2:20 | Legacy/reuse view, if implemented; otherwise static pilot slide | Make legacy concrete |
| 2:20–2:45 | Buyer and pilot slide | Demonstrate commercial thinking |
| 2:45–3:00 | Final product view and tagline | Finish with the product's decision |

Recording guidance: use 1920×1080 or 1440×900, browser zoom 100%, hide personal tabs and notifications, move the pointer deliberately, pause after each state change, and use a screen recorder with microphone. No music is necessary. Add concise captions for “historical observations,” “scenario assumptions,” and “modeled result.” Export MP4. Avoid applicant identity in a double-blind video unless the verified rules permit it.

## Eight-slide pitch structure

1. **The ticket gets you a seat. It does not get you shade.** One pedestrian arrival illustration and one sentence on the operator's budget decision.
2. **One buyer. One recurring decision.** Venue operations; allocate outdoor shade/queue budget; city/transit/accessibility stakeholders.
3. **Grounded in Houston. Honest about the evidence.** Real historic measured data + transport anchors, beside clearly labeled scenario inputs. Show survey date prominently.
4. **From map to allocation.** Actual product screenshot, budget, baseline, selected plan. Use only a verified run's numbers; never type an invented impact statistic.
5. **Show the tradeoffs.** A second scenario and sensitivity view, separate water measure, plus what remains uncertain.
6. **A business with a testable buyer.** $5,000 pilot / $6,000 annual hypotheses; what must be measured; comparison to established GIS/weather/incident workflows.
7. **The asset stays useful after the event.** Reuse owner, destination and assumed use schedule; 90-day pilot path and field validation.
8. **A plan worth checking—and acting on.** Demo URL, source link/QR, explicit ask: one venue partner for two events. No implied committed partner.

## Judge Q&A

**Isn't this just a heat map?**
The map supplies context. The decision product is a constrained comparison of interventions, with costs, assumptions and estimated exposure effects. The operator can challenge an input and see the allocation change. We would judge success by accepted plans and verified planning value, not map views.

**What is actually measured?**
The Houston historical street-temperature sample and geographic anchors are sourced. Demand, dwell, shade coverage, costs and effectiveness are scenario assumptions unless separately labeled with operator measurements. We do not present the historical temperature layer as 2026 weather or the scenario as observed visitor behavior.

**Why direct-sun person-minutes?**
It is an understandable operational proxy: people times exposed duration. It helps compare where shade or shorter queues might remove exposure. It does not capture humidity, exertion, physiology, clothing or all radiant conditions, and it is not an illness prediction or full thermal comfort model.

**Does the temperature layer actually enter the optimizer?**
Answer from the final implementation. If it is contextual, say exactly that: “Historical temperature is contextual evidence for site discussion; the optimization objective is direct-sun person-minutes from demand, dwell and shade assumptions.” Do not imply a thermal coupling that the code does not contain.

**Why not just put shade at the busiest gate?**
Counts alone miss duration, existing coverage, costs and overlapping interventions. A less busy but slower queue could have more reducible exposed time. The optimizer should account for shared/overlapping effects instead of summing the same person's benefit twice. Check this in the final code before claiming it.

**How accurate is it?**
We have tested the calculations and constraints; that is different from validating field accuracy. No deployment-level accuracy is established yet. We show assumption sensitivity, and the proposed pilot measures counts, waiting times and shade to calibrate the model.

**Are your uncertainty ranges confidence intervals?**
No. Unless a statistical model with supported distributions is implemented, they are low/base/high assumption scenarios. They expose sensitivity, not a guaranteed probability range.

**Why are you showing all eleven cities with only one detailed pilot?**
The host overview helps orient the opportunity. Houston has the deeper local evidence. We label that coverage difference and would not rank the other cities as if all have equivalent validated exposure models.

**Is this feasible before the next event?**
The software can compare small candidate sets quickly. Real implementation still needs site permission, accessibility and egress review, supplier quotes and operational approval. The practical first step is one venue and a few field-verified locations, not a citywide deployment claim.

**Who pays?**
The first hypothesis is the venue/event operator, from planning or event operations budgets. A $5,000 assisted pilot and $6,000 annual plan are prices to test, not established demand. We measure planning time and decision value before expanding.

**How do you compete with Esri, Google, DTN or Juvare?**
They are credible tools in mapping, long-term heat planning, weather intelligence and incident coordination. We propose a narrow budget-to-plan workflow that can complement them. We have not completed an exhaustive feature comparison, and we do not claim they are unable to build this.

**What is the moat?**
There is no defensible moat in a small optimizer or public data alone. The potential advantage is repeated venue use: verified site constraints, actual costs, approved deployments and observed outcomes. We have to earn that advantage through pilots.

**What happens after FIFA?**
The planning workflow repeats at games, concerts, fairs and festivals. Physical assets need named ownership and reuse destinations. The legacy view should show assumed reuse or measured reuse distinctly, rather than multiply the event-day benefit into an unsupported annual outcome.

**What about equity?**
Aggregate maximum exposure reduction can overlook residents or lower-volume accessible approaches. Use transparent minimum service constraints or a separate resident-reuse objective, inspect who receives less investment, and involve an accessibility reviewer. Do not label every transit user low-income or infer personal vulnerability from where someone travels.

**Why not use AI for the optimization?**
The candidate set is small enough for a transparent deterministic method. A language model is not needed to invent forecasts or intervention effects. Analytical traceability is more useful here than an AI label.

**What is the largest weakness?**
The visitor and intervention assumptions are not yet field-calibrated. The product is useful for transparent planning experiments today; a paid, field-verified pilot is needed before we can claim operational impact or commercial traction.

## Rubric review and iteration targets

This is an internal risk assessment, not a fabricated external judging score. Score only after independently reviewing the deployed build and actual artifacts.

| Criterion | Strongest current argument | Main weakness | Most valuable next improvement |
|---|---|---|---|
| Impact | A concrete, budget-limited operational problem | Modeled exposure is not observed health improvement | Show a defensible baseline and budget tradeoff; no medical claims |
| Data analytics | Observed/assumed/modeled separation; real Houston samples | Historic one-period sample; assumed flow and effects | Source drawer, sensitivity, unit tests, no fake precision |
| Innovation | Connect heat context to implementable resource allocation | Optimization and heat maps already exist | Demonstrate overlapping-benefit handling and operational handoff |
| Feasibility | Small bounded candidate set; realistic buyer | Field permissions and physical installation unvalidated | Explicit field-validation workflow, owners and cost inputs |
| Legacy | Recurring event workflow and community asset reuse | Reuse may only be an assumption | Named owner/destination/use schedule, separately labeled |
| Visualization | Linked map, baseline/proposed comparison | Map could imply surveyed routes or equal city evidence | Evidence badges, clear legend, contextual geography, mobile/keyboard QA |
| Presentation | One story, one metric, one buyer | Too much qualification can crowd out demo | Lead with decision, demonstrate it, then one concise limits slide |

### Final artifact quality gate

- Match every screenshot and spoken claim to the shipped version.
- Replace placeholder stack descriptions and avoid unimplemented feature claims.
- Exported results identify scenario name, time, units, assumptions, baseline, data version and model limitations.
- Do not call historical replay a forecast, shaded exposure zero risk, or person-minutes medical benefit.
- Cross-city overview must distinguish venue jurisdiction from metro branding, and detailed pilot from context-only entries.
- No official FIFA/Rice endorsement, no invented customers, and no unauthorized logo usage.
- No applicant identity in judging narrative/deck/video if double-blind rules are confirmed.
- Participation eligibility and the minimum two-human-member rule require actual eligible participants; an AI assistant is not a teammate for eligibility purposes. Do not invent registration or submit false attestations.
