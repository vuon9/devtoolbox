# Agents — Design Principles & Development Guidelines

## Purpose
- A short, practical reference for contributors and automation agents.
- Focus: consistent UI, maintainable backend patterns, and a simple development workflow.
- Keep guidance conceptual — developers should consult the code for specifics.

## Core Principles
- Use the Carbon Design System and Carbon tokens for colors and theming. Avoid hardcoded color values.
- Default visual tone is dark; follow the project's theme provider.
- Prefer small, reusable components to maintain consistency.

## Tool layout (concept)
- Tools must present three areas: Header (title + short purpose), Controls (options + actions), and Workspace (content panes).
- Workspace commonly uses a split layout; provide a way for users to switch orientations and persist their preference.
- Controls should be clearly separated from utility options.

## Component rules (high level)
- Buttons: group logically, use consistent visual hierarchy (primary vs secondary).
- Input/output panes: visually identical, monospace for data/code, equal heights, visible borders, and accessible labels.
- Copy actions: make copy/export controls discoverable and consistently placed near pane headers.

## Reuse & consistency
- Centralize shared UI patterns into common helpers/components.
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
- Keep local setup lightweight: install frontend and backend deps, run the dev server, iterate.
- Use centralized scripts for linting and formatting.
- Run the app locally to verify UI consistency and interactions.

## Collaboration & commits
- Keep commits focused and descriptive.
- Do not commit secrets or credentials.
- If unsure about removing or changing conventions, discuss before large refactors.

## Final note
- This document is a concise set of rules and intent. For implementation details and examples, read the code and shared UI helpers; the code is the authoritative source.
- Keep the guide short and actionable; prefer making the code easy to understand over expanding this file.
