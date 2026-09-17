# Data provenance and reuse

Retrieved 2026-09-18. No private organizer data or individual mobility data are published.

| Dataset | Publisher/source | Processing | License / limits |
|---|---|---|---|
| H3AT 2020 measured afternoon temperatures | [HARC/CAPA ArcGIS item](https://www.arcgis.com/home/item.html?id=d8dd6004e1ab4dccbfb36a5992f480bc) | Query WGS84 bounds −95.431,29.667,−95.390,29.704; retain 654 points, exact coordinates, temperatures and local timestamps | [H3AT](https://www.h3at.org/) describes mapping data as free to use. Preserve attribution and informational-use disclaimer. Source licenseInfo states None. |
| METRO GTFS stops | [Official developer portal](https://api-portal.ridemetro.org/), [static feed](https://metro.resourcespace.com/pages/download.php?ref=4835&ext=zip) | Extract nearby stops; feed August2026IVOMS_20260828, 2026-08-30 through 2027-01-23 | [METRO transit data terms](https://www.ridemetro.org/about/news-media). No logos or endorsement. Stop wheelchair_boarding=0 means unknown. |
| ERA5 historical weather | [Open-Meteo archive documentation](https://open-meteo.com/en/docs/historical-weather-api) | models=era5; 11 approximate venue coordinates; 2025-06-01 through 2025-07-19; paired local 15:00 temperature and RH; NWS heat index | Data CC BY 4.0. Attribute Open-Meteo, ECMWF ERA5 and Copernicus. Free API service noncommercial; [commercial terms](https://open-meteo.com/en/terms). |
| Venue centroids | Wikimedia coordinate API; source article URL per row | Approximate stadium centroid in WGS84, not a surveyed entry point | Wikimedia content licensing applies. Coordinates and individual source links retained. |
| Host/venue identities | [Organizer source catalog](https://github.com/HoustonSI/WorldCupUSSpatialData101) and [FIFA venue addresses](https://gpcustomersupportfwc2026.tickets.fifa.com/hc/en-gb/articles/28784010437021-2-What-are-the-official-addresses-stadium-capacities-and-maps-of-the-FIFA-World-Cup-2026-stadiums) | Match host market to actual venue municipality | Catalog CC0; linked data retain separate terms. |
| Basemap | [OpenStreetMap contributors](https://www.openstreetmap.org/copyright) | Standard raster tiles, visible attribution | ODbL data; comply with [tile usage policy](https://operations.osmfoundation.org/policies/tiles/). No bulk download/offline prefetch. Production scale needs a suitable tile provider. |

## Snapshot inventory

- `houston-heat-2020.geojson`: cleaned observed sample with source and filter metadata.
- `houston-heat-source.json`: original ArcGIS item metadata.
- `houston-transit-source.json`: cleaned GTFS anchors and provenance.
- `houston-metro-stops.json`: nearby raw GTFS stop records.
- `host-venues.json`: pinned centroid/identity seeds.
- `host-climate-raw-2025.json`: original hourly API responses.
- `host-climate-2025.json`: 539 afternoon rows and derived summaries.
- `example-scenario.json` / `optimized-scenario.json`: illustrative model demonstrations, not observations.

## Rebuild and validation

Run `npm run data:rebuild` without network access to reproduce climate summaries from the raw snapshots. Run `npm run data:verify` to independently recompute all heat indices and percentiles using the application model. `npm run data:refresh` requests the same historical window explicitly; new provider revisions can change data and must be reviewed before commit.

Observed sample temperatures range 93.2–96.62°F, with spatially autocorrelated samples. Their sample mean is not a citywide mean. The map intentionally does not interpolate into the unobserved stadium interior. The 2024 H3AT dataset did not cover this immediate pilot area, so the older observed sample is clearly labeled.
