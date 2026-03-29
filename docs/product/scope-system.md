# Scope System & Neighborhood Model

## Neighborhood Model

- Every user gets a **Neighborhood** based on their GPS location (~2km radius)
- Neighborhood tab is the **default home screen** — shows both civic (Reports/Missions) and social (Posts) content from within the radius
- 50 active users in one neighborhood > 50,000 scattered globally
- Neighborhoods are derived dynamically from coordinates — not fixed admin regions
- `Post` records with a `location` set are surfaced in the local feed via the same `ST_DWithin` radius query as Reports; Posts without a location are excluded from the local feed

## Scope Escalation Table

| Scope | Radius | Verifiers required | Auto-escalation trigger |
|-------|--------|--------------------|------------------------|
| Street | 200m | 3 within 200m | — |
| Neighborhood | 2km | 5 from different streets | 3+ street missions same category |
| City | Municipal boundary | 50+ from 5+ neighborhoods | 5+ neighborhoods same issue |
| National | Country | 500+ from 10+ cities | 10+ cities same issue |
| Global | Worldwide | International data sources | 3+ countries same issue |

## Mission Lifecycle

```
Identify → Research → Propose → Act → Measure
```

- **Identify:** Issue reported with photo + GPS + category
- **Research:** Community adds context, links, history
- **Propose:** Solutions submitted and voted on
- **Act:** Assigned contributors execute the solution
- **Measure:** Resolution verified (5 verifiers + 48h dispute window)

Solved missions stay **permanently visible** as proof of community impact.

## Issue Escalation Rules

- Issue becomes **Active** when 3+ unique neighbors confirm with their own photos
- Street-scope issues with 3+ same-category reports auto-escalate to Neighborhood scope
- Auto-escalation triggers a notification to all neighborhood members

## Geospatial Implementation Notes

- Use **PostGIS** extension on PostgreSQL for radius queries (`ST_DWithin`)
- Neighborhood assignment: `ST_DWithin(user.location, report.location, 2000)` (metres)
- Street scope: 200m radius
- Index all location columns with `GIST` index
- Cache neighborhood membership per user in Redis (invalidate on location update)
