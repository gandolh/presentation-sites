---
title: Tavi's own line for the footer, and his favourite calibre
created: 2026-11-24
status: open
tags: [tavi, owner]
---

# Tavi's own line for the footer, and his favourite calibre

An owner step, not a brief. The tavi site's footer holds a dashed placeholder, "[Tavi's line, in his own words]",
under "Tavi repairs wristwatches". The owner asks Tavi for one or two sentences in his own words and sends them; the
critique called it the one piece of material that would most improve the page. Until then the placeholder stays
visible ([decisions-tavi.md](../wiki/decisions-tavi.md), "Defaults the owner can change").

Two more things to ask him while at it, both optional:

- **His favourite calibre.** The movement is a generic 21,600 vph NH35-class train. A calibre he loves would make it
  his; the part table in `sites/tavi/src/movement/` is where it changes, as a brief of its own.
- **A way to reach him**, once he wants one. The site has no contact line until then.

When the line arrives, it goes into the footer's slot in `sites/tavi` (a one-file change) and this todo closes.
