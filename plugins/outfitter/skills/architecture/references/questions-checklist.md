# Questions Checklist

## Understanding Requirements

### Functional

- Core user workflows?
- What data stored, how long?
- Required integrations?
- Critical features vs nice-to-haves?

### Non-functional

- How many users (now and in 1-2 years)?
- Acceptable latency? (p99 < 500ms? < 100ms?)
- Availability target? (99.9%? 99.99%?)
- Consistency requirement? (strong? eventual?)
- Data retention policy?
- Compliance requirements? (GDPR, HIPAA, SOC2?)

## Constraints

### Technical

- Existing systems to integrate with?
- Technologies already in use?
- Current team expertise?
- Deployment environment? (cloud, on-prem, hybrid?)

### Business

- Budget for infrastructure?
- Timeline for delivery?
- Acceptable technical debt?
- Long-term vision (1-2 years)?

### Organizational

- How many engineers will work on this?
- Team structure and communication patterns?
- Deployment frequency? (multiple/day, weekly, monthly?)
- On-call and support model?

## Technology Selection

For each choice ask:
- Why this over alternatives? (specific reasons, not "popular")
- What production experience exists? (internal or external)
- Operational complexity?
- Vendor lock-in risk?
- Community support and longevity?
- Total cost of ownership?
- Can we hire for this technology?

## Risk Assessment

For each decision:
- Blast radius if this fails?
- Rollback strategy?
- How will we detect problems?
- Contingency plan?
- What assumptions are we making?
- Cost of being wrong?
