# Judge questions and concise answers

## Judge Q&A

**Isn't this just a heat map?**
The map supplies context. The decision product is a constrained comparison of interventions, with costs, assumptions and estimated exposure effects. The operator can challenge an input and see the allocation change. We would judge success by accepted plans and verified planning value, not map views.

**What is actually measured?**
The Houston historical street-temperature sample and geographic anchors are sourced. Demand, dwell, shade coverage, costs and effectiveness are scenario assumptions unless separately labeled with operator measurements. We do not present the historical temperature layer as 2026 weather or the scenario as observed visitor behavior.

**Why direct-sun person-minutes?**
It is an understandable operational proxy: people times exposed duration. It helps compare where shade or shorter queues might remove exposure. It does not capture humidity, exertion, physiology, clothing or all radiant conditions, and it is not an illness prediction or full thermal comfort model.

**Does the temperature layer actually enter the optimizer?**
“Historical temperature is contextual evidence for site discussion; the optimization objective is direct-sun person-minutes from demand, dwell and shade assumptions.” 

**Why not just put shade at the busiest gate?**
Counts alone miss duration, existing coverage, costs and overlapping interventions. A less busy but slower queue could have more reducible exposed time. The optimizer should account for shared/overlapping effects instead of summing the same person's benefit twice. 

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

