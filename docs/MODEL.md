# Model specification 1.0.0

The target variable is direct-sun exposure opportunity, measured in person-minutes. It is not WBGT, radiant temperature, heat dose, medical risk, mortality, or observed behavior.

For link i:

- Arrival count N_i = total arrivals × demand weight_i / sum of weights.
- Baseline B_i = N_i × (walk minutes_i + queue minutes_i) × (1 − existing shade_i) × event sunlight factor.
- Effective shade = min(1, existing shade + added shade × delivered effectiveness).
- Proposed P_i = N_i × [walk + queue × (1 − queue reduction × delivered effectiveness)] × (1 − effective shade) × event sunlight factor.
- Avoided exposure = B_i − P_i. Aggregate reduction = sum(avoided) / sum(baseline).

One modeled arrival uses one link. The approximate drawn connectors are not a connected pedestrian network simulation. In reality some approaches overlap; operator demand allocation must count complete mutually exclusive arrival cohorts.

## Allocation

Six links × five choices creates 15,625 possible portfolios. Exhaustive recursion evaluates non-overbudget portfolios, enforces community allocation, maximizes avoided person-minutes, and breaks ties by lower initial cost. This is an exact result **within the supplied finite catalog and assumptions**, not a proof of the globally best real-world intervention. Zero-benefit portfolios do not produce a purchase recommendation.

Community-weighted allocation = sum(cost × assumed everyday local-use share) / total selected cost. It is neither a demographic vulnerability measure nor the fraction of actual spending received by residents. Zero spending cannot satisfy a positive percentage constraint.

Water refills = min(link arrivals, 1,200 per hub per arrival window). Refills are a capacity allowance, not liters, confirmed throughput or unique people served. Water does not reduce direct-sun exposure. The optimizer has no minimum water-service constraint, so it may select no refill hubs.

## Annual costs and legacy

Initial selected cost includes reusable shade/hub allowances and one queue-operations window. Annual modeled cost adds upkeep, queue cost for every additional event window, and $500 refill operations per hub per window. Package cost overrides apply to every occurrence of that package. Recurring queue costs use the queue-package quote. Complete-package and component quotes should remain consistent when users override them. Tax, site works, permits, financing, asset replacement and contingency are excluded.

Community exposure avoided = daily resident passages × walk time × added effective shade × community sunlight factor × reuse days. Community sunlight is independent of event timing. Queue interventions do not produce permanent resident benefits. Multi-year charts repeat constant event and resident assumptions, without growth or asset attrition. These are recurring exposure episodes, not unique people, and the two series should not be added if the same passages appear in both inputs.

## Weather context

The app implements the NWS Rothfusz heat-index formula, with preliminary calculation and low/high humidity adjustments. The historical atlas computes heat index for every paired temperature/humidity row before taking summary statistics. The 95th percentile uses nearest rank: the 47th sorted value of 49. It is not a 95% confidence interval.

Heat index applies to shade/light winds. Weather is context and is not used to weight the optimizer's objective. The event sunlight factor is a simple time-of-day planning assumption, not an astronomy or shadow simulation. Sensitivity scales added shade and queue performance to 60%, 80% and 100% for the same portfolio; it is not probabilistic uncertainty.

## Reproducibility

Saved/exported JSON includes the model version, resolved corridor inputs, package catalog, sunlight table, source identifiers, timestamp and calculated results. Import accepts this version and refuses other explicit model versions. The versioned source and data are needed to rerun formulas exactly. CSV contains context and row-level inputs, with formula-safe text cells.

Historical map observations are dated 2020, static transit anchors 2026, and atlas weather 2025. Their different time periods are intentional and visible. None establishes actual 2026 event behavior.
