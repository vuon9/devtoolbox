
# Agents Design Principals & Implementation Guide

This project follows the **Carbon Design System** guidelines to ensure a consistent, accessible, and professional user interface. All new features and tools **MUST** adhere to these principles.

---

## ⚠️ IMPORTANT: Check Tool Status Before Modifying

**Before editing any tool component, ALWAYS check [TOOL_STATUS.md](./TOOL_STATUS.md)** to see if it's currently being refactored or already completed.

This prevents:
- Accidentally modifying a tool already refactored with new patterns
- Conflicting with ongoing refactoring work
- Introducing outdated patterns into completed tools

See [TOOL_STATUS.md](./TOOL_STATUS.md) for the current status of each tool.

---

## 1. Design System & Theme
-   **System**: [Carbon Design System](https://carbondesignsystem.com/) (`@carbon/react`).
-   **Theme**: The application is wrapped in a Carbon `<Theme>` provider.
    -   **Dark Theme (`g100`)** by default.
    -   Colors must use Carbon Usage Tokens (e.g., `var(--cds-layer)`, `var(--cds-text-primary)`). Do not use hardcoded hex values.

## 2. Interaction & Layout Rules (Strict)

### Tool Layout Structure
Every tool must follow this hierarchy:
1.  **Header**: Tool Title (`<h2>`) and Description (`<p>`).
2.  **Controls**: A distinct row/area for options (selects, inputs) and primary actions (buttons).
3.  **Workspace**: The main area, usually split 50/50 between Input and Output panes.

### Component Specifics

#### Buttons
-   **Location**: Place in the **Controls** area, distinct from utility options if possible, or clustered logically.
-   **Spacing**: Multiple buttons on the same line MUST have spacing between them (gap: 1rem).
-   **Consistency**: All buttons must match the theme. Primary actions use `kind="primary"`, secondary `kind="secondary"`, etc.

#### Input/Output Panes (TextAreas)
-   **Consistency**: Input and Output areas must look identical in structure.
-   **Typography**: Use **Monospace** font for all data/code input/outputs. Same font size (`12px` or `14px`).
-   **Height**: Input and Output panes should be the **same height** and fill the available vertical space (`height: 100%`).
-   **Borders**: All text areas must have a visible border for better visibility.
-   **Labels**:
    -   Must be present and consistent in casing (Title Case).
-   **Copy Button**:
    -   MUST be placed **beside the label** (top-right of the pane header).
    -   MUST **always** be visible (do not hide on hover or empty state, though disabling on empty state is acceptable, showing it is preferred for consistency).

#### Labels
-   Use consistent typography for component labels (Carbon's label style).

## 3. Reusable Components
Use the standardized components in `src/components/ToolUI.jsx` to enforce these rules automatically:
-   `<ToolHeader title="..." desc="..." />`
-   `<ToolControls>`: Wrapper for inputs and buttons.
-   `<ToolPane label="..." value="..." ... />`: The standardized Input/Output area with built-in Copy button support.

## 4. Implementation Details
-   **SCSS**: `src/index.scss` maps global variables.
-   **Icons**: Use `@carbon/icons-react`.

## 5. Testing Guidelines
-   All Go tests MUST follow Go's recommended table-driven (table test) style: define a slice of named test cases with fields such as `name`, inputs, `want`, and `wantErr`, iterate over them with `for _, tc := range tests { ... }`, and run each case as a subtest using `t.Run(tc.name, func(t *testing.T) { ... })`.
-   When using subtests with parallel execution, use `tc := tc` before `t.Run` and call `t.Parallel()` inside the subtest.
-   Tests should use clear case names, deterministic setup/teardown, avoid global state, and prefer `reflect.DeepEqual` or the `cmp` package for comparisons to keep tests reliable and readable.
