
Here are principles and guidelines for developing tools and agents in this project:

- A short, practical reference for contributors and automation agents.
- Focus: consistent UI, maintainable backend patterns, and a simple development workflow.
  - Use **Tailwind CSS 4.0** and **Radix UI** for component development.
  - Follow the **high-density, native-feeling desktop UI** guidelines.
  - Default visual tone is dark; use the centralized CSS variables in `globals.css`.
  - Prefer small, reusable components in `src/components/ui/` (Radix primitives) and `src/components/inputs/` (shared tool components).

## Tool layout
- Tools must present three areas: 
  - Header (title + short purpose)
  - Controls (options + actions)
  - Workspace (content panes).
- Optional: Workspace commonly uses a split layout; provide a way for users to switch orientations and persist their preference.
- Controls should be clearly separated from utility options.
- Front-end code must be organized into components and helpers that reflect the UI structure, with clear naming and separation of concerns.

## Component rules (high level)
- Buttons: group logically, use consistent visual hierarchy (primary vs secondary).
- Input/output panes: visually identical, monospace for data/code, equal heights, visible borders, and accessible labels.
- Copy actions: make copy/export controls discoverable and consistently placed near pane headers.
- Use **Lucide Icons** for all iconography.

## Reuse & consistency
- Centralize shared UI patterns into common helpers/components in `src/components/inputs/` and `src/components/layout/`.
- Use the `cn()` utility (from `src/utils/cn.js`) for merging Tailwind classes.
- Prefer composition over duplication—reuse helpers rather than reimplementing layout/controls.
- Keep styles and tokens centralized so changes propagate cleanly.

## Backend architecture (conceptual)
- Follow layered design: domain logic isolated from transport/bindings.
- Define clear interfaces for major components and keep implementations testable and replaceable.
- Map external/library errors into domain-level errors; surface user-facing messages that are actionable.
- Ensure backend data shapes align with frontend expectations.

## Testing & quality
- Tests should be deterministic, well-named, and cover edge and error cases.
- Use table-driven style for data-driven behavior where appropriate.
- Run formatting and vetting tools as part of local checks before committing.

## Developer workflow (summary)
- Keep local setup lightweight: install frontend and backend deps, run the dev server (`npm run dev`), iterate.
- Use centralized scripts for linting and formatting.
- Run the app locally to verify UI consistency and interactions.

## Collaboration & commits
- Keep commits focused and descriptive.
- Do not commit secrets or credentials.
- If unsure about removing or changing conventions, discuss before large refactors.

## Final note
- This document is a concise set of rules and intent. For implementation details and examples, read the code and shared UI helpers; the code is the authoritative source.
- Keep the guide short and actionable; prefer making the code easy to understand over expanding this file.
