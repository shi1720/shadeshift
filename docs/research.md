# ShadeShift research memo — verified 18 September 2026

## Contest facts and unresolved eligibility

Official pages: https://rice-urban-sustainability.devpost.com/ and https://rice-urban-sustainability.devpost.com/rules and https://rice-urban-sustainability.devpost.com/resources

Header deadline is September 17, 2026 11:45pm CDT = September 18 10:15am IST. Rules body inconsistently states September 17 12:00am CDT. Rules also require registration by June 17, selection notification, English written narrative of methods and results, and USA location for prizes. Overview restricts participation to age18+, college students, team2–6, US only, excludes companies/professional organizations. No AI clause found on public rules; absence is not proof of blanket permission. Double-blind judging stated: keep anonymous judge packet separate from attributed project README. No verified mandatory video duration or submission form field requirements; prepare useful demo script rather than inventing constraints. Do not claim registration/team eligibility without user evidence.

Rubric weights: Impact25, DataAnalytics20, Innovation15, Feasibility15, Legacy10, Visualization10, Pitch5.

## Organizer-provided sources

https://github.com/HoustonSI/WorldCupUSSpatialData101 is a curated source catalog, not direct downloaded datasets. Local clone /tmp/worldcup-sources. Catalog is CC0; downstream data retain their own license. Houston guide suggests transit stops, pedestrian routes, heat, canopy, cooling centers, vulnerability. Rice Box resource: https://rice.box.com/s/zfwy31xq4tbu6uaiglcsjeahvqo0vsav (not retrieved). Avoid private organizer data publication because rules require supplied data and PII confidentiality.

## Real Houston data delivered

1. /tmp/houston-historical-heat.geojson — cleaned 654 measured mobile-sensor air temperature observations around NRG, August7 2020 afternoon15:00–16:00 America/Chicago. Raw source /tmp/d8dd6004e1ab4dccbfb36a5992f480bc-data.geojson. Metadata /tmp/houston-heat-provenance.json. Bounding query WGS84 [-95.431,29.667,-95.390,29.704]. Sample min93.20°F,max96.62°F, mean94.70°F. Samples are not uniformly distributed; mean NOT an area-wide statistic. Actual samples only cover longitude[-95.412453,-95.390047],latitude[29.685210,29.703983]; no southern/interior stadium extrapolation. Geometry from source reprojected by ArcGIS to EPSG4326. Cleaned file preserves exact coordinates, temps and local timestamps.
   Source item https://www.arcgis.com/home/item.html?id=d8dd6004e1ab4dccbfb36a5992f480bc
   Data https://services2.arcgis.com/LYMgRMwHfrWWEg3s/arcgis/rest/services/Heat_Watch_CAPA_Houston_Harris_Temp_Traverse_Points_AF_2020/FeatureServer/0
   Attribution CAPA Strategies, Houston Advanced Research Center, Houston Harris Heat Action Team. ArcGIS licenseInfo is 'None'; H3AT project explicitly says its mapping data are free for everyone to use. Preserve attribution and source's informational-use disclaimer. Not live heat, not land surface temperature, not pedestrian sensor validation, not shade fractions. Best UI optional dated point observation layer, distinct from scenario connectors.

2. /tmp/houston-data.json — cleaned official GTFS stop subset with provenance; raw /tmp/metro-gtfs.zip. Publisher HarrisCounty METRO. Feed versionAugust2026IVOMS_20260828, feed dates20260830–20270123. URL https://metro.resourcespace.com/pages/download.php?ref=4835&ext=zip. Official developer site https://api-portal.ridemetro.org/ links to static downloads. License https://www.ridemetro.org/about/news-media allows reproduction/redistribution and commercial display of transit data subject to terms; do not use logos or imply endorsement. GTFS does not include live arrivals here. Coordinates [lon,lat]:
   - Houston Stadium NB25003 [-95.403341,29.685929], description STADIUM PARK / ASTRODOME NB.
   - Houston Stadium SB25004 [-95.403411,29.685928].
   - Smith Lands NB25005 [-95.404798,29.696470], SB25006[-95.404859,29.696464].
   - Fannin South NB25001[-95.402806,29.673589], SB25002[-95.402862,29.673584].
   - Bus stops adjacent included. GTFS wheelchair_boarding0 means no information, NOT inaccessible. Data are current Sept2026 stop coordinates, not WorldCup special-event operations.

3. /tmp/houston-heat-catalog.json — public ArcGIS metadata listing H3AT2020/2024 datasets, canopy data. 2024 NRG bounding box yields ZERO samples and no neighborhood polygons. Do not silently label2024 city results as NRG measurements.

## Strong contextual evidence

H3AT2024 campaign collected431,348 datapoints August10,2024; max observed103°F; 14°F hot/cool neighborhood difference. https://www.h3at.org/2024-campaign/2024-campaign-results . Use regional context, not claimed stadium temperature. Page links free data and detailed CAPA report.

City's official WorldCup transit PDF maps HoustonStadium(NRG) at RedLine R2 StadiumPark/Astrodome; SmithLandsR3 and FanninSouthR1. https://www.houstontx.gov/houston2026/pdfs/metro-map-overview.pdf . This confirms real transit anchors, not exact walkable connectors.

FIFA ticket support describes Houston ticket office GateE, access via FanninStreet Gate4, RedLine station StadiumPark/Astrodome. Its wording also mentions Green/Purple lines without clarifying transfer; do not claim those run to venue directly. https://gpcustomersupportfwc2026.tickets.fifa.com/hc/en-gb/articles/36117209978781-7-Where-are-the-Stadium-Ticket-Offices-in-the-United-States-located-and-how-can-I-get-to-them-the-day-of-the-match . NRG site currently redirects/rebrands ReliantPark and says Gate2. Gate operations change by event. Thus use station-centered candidate planning zones or approximate labeled anchors; never authoritative event gate routing.

EPA: a308-study review found urban forests averaged1.6°C cooler than nongreen urban areas. Trees cool through shade and evapotranspiration. https://www.epa.gov/heatislands/benefits-trees-and-vegetation . Do not apply this global average as guaranteed intervention effect at a street point.

NWS: HeatIndex combines air temp/RH and is for shade/light winds; full sunshine can raise apparent heat by up to15°F. WBGT accounts for temp, humidity, wind, solar and is better for active outdoor exposure. https://www.weather.gov/safety/heat-index . Do not subtract15°F from air temp for shade or label an assumed radiation penalty as officialHI/WBGT. NWS API free/open, user-agent required, approx2.5km forecast grids, 7day forecasts: https://www.weather.gov/documentation/services-web-api . Grid values are city context, not block-scale observations. Caching and explicitly dated last-updated/fallback needed.

## Recommended defensible model

Use a transparent exposure accounting model, NOT clinical risk forecasting:
- Each zone i input visitors N_i, walking+queue minutes t_i, unshaded fraction u_i, event count d, priority weight w_i optional.
- Baseline unshaded person-hours = sum(N_i*t_i*u_i/60); intervention shade addition reduces u_i; shuttle/staggering reduces t_i where assumed. This is a proxy for exposure opportunities, not heat illness avoided.
- Visitors across zones may repeat; report traversals/person-hours, not unique people protected, unless allocation guarantees one exclusive arrival zone per visitor. Path segments can be summed for exposure but not people.
- Separate background heat indicator HI(T,RH) from exposure. Sensitivity weather slider changes scenario severity context; if applying heat weighting call it a planning score with explicit equation and chosen threshold, not health risk.
- Cooling hubs have hourly throughput capacity, opening hours, detour penalty; do not assign universal per-person temperature reductions. Hydration availability is service capacity, not thermal effect.
- Exact bounded portfolio search (small candidate count) can maximize exposure reduction under budget and crew limits, one choice per site. Report infeasible constraints explicitly. Equity optional min spend/share by priority zone, not fabricated census vulnerability. Adding interventions at the same site must cap at100% shade and avoid additive overlapping benefits.
- Cost sliders have illustrative estimates, not vendor quotations. Daily rental/operation vs one-time capital separate. Annual legacy benefit = independently editable resident traversals*days*minutes*shade; not WorldCup attendance multiplied through year.
- Low/base/high demand,dwell and effectiveness assumptions yield scenario envelope, not95% confidence interval. Results deterministic and reproducible; export inputs, model version, sourced vs assumed fields.
- Calibration path: venue walk audit + actual gate layout + counts + shade survey at time-of-day + WBGT measurements; pilot compare projected vs measured unshaded duration and queues. Do not claim pilot completed.

## Competition / commercial inference

ShadeMap explicitly already supports building/tree shadows and event planning, so uniqueness cannot be 'first shade map': https://shademap.app/help/ . UrbanFootprint offers climate/community spatial analysis and collaboration: https://urbanfootprint.com/platform/explorer/ . ClimateView city climate-action planning: https://www.climateview.global/en . Differentiation hypothesis: event operator buys an auditable budget-to-deployment plan (where, which asset, expected exposure reduction, crew, cost, evidence) with resident legacy scenarios. It complements upstream climate maps rather than claiming nobody has heat maps.

Proposed beachhead: stadium/campus/festival event operator + private event services firm (faster pilot procurement than whole city). Paid per-event pilot, annual venue license, optional deployment service referrals; these are pricing hypotheses, no customer traction. Moat future repeated measured performance/vendor cost calibration and workflow integrations, not proprietary public data or an AI wrapper. Value measurable operational planning time and exposure reduction, not unverified insurance savings or mortality dollars.

## Eleven-venue historical weather atlas delivered

/tmp/host-climate-2025.json contains49 daily15:00 local samples per city, June1–July19,2025. Each sample retains temp°C,RH%, derived shadeHI°F. Summary medianHI, nearest-rank p95HI, countHI>=90 and>=100. Raw all1176hours*11 in /tmp/host-climate-raw-2025.json. Reproducer /tmp/fetch-host-climate.py. Compact coords /tmp/host-venue-coordinates.json. Weather query explicitly uses models=era5 for consistent0.25°(~25km) historical modeled grids, not default mixed models. Open-Meteo documentation https://open-meteo.com/en/docs/historical-weather-api . License dataCC-BY4.0; freeAPI service noncommercial https://open-meteo.com/en/terms . Hackathon educational demo qualifies; future commercial API use requires paid subscription/selfhosting. Attribute Open-Meteo and ECMWF ERA5/Copernicus.

Organizer catalog has NO coordinates. Approximate stadium centroids fetched from Wikipedia Coordinates API; each stadium wiki URL included and raw API response saved /tmp/venue-coordinates-wikipedia.json. NRG redirects to ReliantStadium now (raw /tmp/houston-venue-coordinate.json). Official organizer catalog verifies host-to-venue identity. FIFA official address page independently verifies all11 venues and municipalities: https://gpcustomersupportfwc2026.tickets.fifa.com/hc/en-gb/articles/28784010437021-2-What-are-the-official-addresses-stadium-capacities-and-maps-of-the-FIFA-World-Cup-2026-stadiums . Do not call Wikimedia coordinates official surveyed locations.

MedianHI°F/p95HI°F: Houston97.8/105.0; Dallas96.8/101.5; Miami93.8/98.7; Atlanta91.5/96.9; Philadelphia90.7/107.8; KansasCity90.4/101.3; NY/NJ85.0/102.8; LA81.2/87.9; Boston80.9/98.4; SF Bay76.7/86.5; Seattle70.5/82.4. Houston44/49 afternoons>=90°F; Philadelphia26/49. Insight: persistent heat and episodic tail heat imply different preparation needs. This49day single-year seasonal screening is not a climate normal, not readiness ranking, not 2026 forecast, not observed on-site weather. Percentile is sample quantile, not95% confidence. Cooling/shade impact not inferred from these grids. Any default portfolio weather is user scenario, separate from historical benchmark.
