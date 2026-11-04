---
summary: Owner questions opened by build work since 2026-11-04 (the parish's heading face once its seeds win). The older product questions (Q4, Q6 to Q10) stay in decisions.md. Delete a question here once it is answered.
updated: 2026-11-04
---

# Open questions

New questions from build work land here. The older product questions, Q4 and
Q6 to Q10, are still in [decisions.md](decisions.md). Delete a question here
once the owner answers it, and record the answer in [decisions.md](decisions.md).

## The parish's heading face (2026-11-04)

Since the brand seeds win over the token defaults
([design-system](design-system.md), "How the seeds win"), the parish shows
every field in its `site.json` brand. Its `fontHeading` is Source Serif 4, so
its headings changed from the system's Cardo to Source Serif 4. The field
likely dates from when Source Serif 4 was the default heading face, before
Cardo.

- **Question:** keep Source Serif 4 for the parish, or drop `fontHeading` from
  its brand so it gets Cardo like the design?
- **For now:** left as it is. The brief kept `site.json` out of bounds, so the
  parish renders what its content asks for.
- **If Cardo:** remove `fontHeading` from
  `apps/parohia-harlesti-bacau/src/content/site.json`, rebuild, deploy. Its
  `fontBody` (Inter) and `radius` (0.5rem) already use the defaults' face and
  value, so they can stay.
