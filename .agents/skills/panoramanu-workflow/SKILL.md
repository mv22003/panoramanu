---
name: panoramanu-workflow
description: Work on the panoramanu film photography portfolio with consistent commit messages and a restrained editorial visual style. Use when implementing or reviewing features for this repo's Next.js gallery and map app, not for unrelated generic Next.js work.
---

# Panoramanu Workflow

This skill applies to `panoramanu`, a film photography portfolio built in Next.js 16 with a gallery, an interactive map, and eventually a lightweight data entry flow.

Keep the work aligned with the current phase:

- Favor small, isolated changes over broad refactors.
- Treat hardcoded photo data as acceptable until the gallery-map interaction is solid.
- Prefer shipping the map and gallery sync before adding database complexity.
- Use Leaflet first unless the user explicitly wants Mapbox or a different mapping stack.
- Read the relevant guide in `node_modules/next/dist/docs/` before making framework-level Next.js changes.

Respect the product direction:

- The site should feel like an editorial film portfolio, not a SaaS dashboard.
- Photography is the main content; interface chrome should stay secondary.
- Interactions should support browsing and place context, not overwhelm the images.

Use the references only when they are relevant:

- For commit conventions, read [references/commit-messages.md](references/commit-messages.md).
- For page styling and layout direction, read [references/page-style.md](references/page-style.md).

When making changes in this repo, preserve the user's slow incremental workflow:

- Keep one main concern per change when feasible.
- Avoid introducing Prisma, forms, or deployment work unless the task actually needs it.
- Do not "clean up" unrelated code just because it is nearby.
