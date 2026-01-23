
# Agents Design Principles & Implementation Guide

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

---

## 6. Development Setup

### Prerequisites
- **Node.js** (>= 18)
- **Go** (>= 1.22)
- **Wails CLI** (`go install github.com/wailsapp/wails/v2/cmd/wails@latest`)

### Installation
```bash
# Clone the repository
git clone https://github.com/your-org/dev-toolbox.git
cd dev-toolbox

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Running the Application
- **Development mode** (hot reload):
  ```bash
  wails dev
  ```
- **Production build**:
  ```bash
  wails build
  ```

The application will open in a native window. All tools work offline; no external API calls are required.

---

## 7. Linting & Formatting

### Frontend
- **ESLint**: Not currently configured. Consider adding `.eslintrc` and scripts.
- **Prettier**: Not currently configured. Consider adding `.prettierrc`.

**Recommended**: Add linting and formatting scripts to `frontend/package.json`:
```json
"scripts": {
  "lint": "eslint src --ext .js,.jsx",
  "format": "prettier --write src/**/*.{js,jsx}"
}
```

Run these commands before committing:
```bash
cd frontend
npm run lint
npm run format
```

### Go
- **gofmt**: Format Go code with:
  ```bash
  gofmt -w .
  ```
- **govet**: Check for suspicious constructs:
  ```bash
  go vet ./...
  ```

---

## 8. Adding a New Tool

Follow this step‑by‑step guide to add a new tool component:

1. **Create Component File**
   - Create a new `.jsx` file in `frontend/src/tools/` (e.g., `MyNewTool.jsx`).
   - Use the existing tool components as reference (e.g., `JwtDebugger.jsx`).

2. **Implement the Tool**
   - Import Carbon components and `ToolUI` helpers.
   - Use `useReducer` for state management (not multiple `useState` hooks).
   - Use `useCallback` for memoized functions.
   - Follow the **Tool Layout Structure** (Header → Controls → Workspace).
   - Use `ToolHeader`, `ToolControls`, `ToolPane`, `ToolSplitPane` from `ToolUI.jsx`.
   - Ensure input/output panes are symmetrical, have monospace fonts, and include copy buttons.

3. **Add Route**
   - Open `frontend/src/App.jsx`.
   - Import your new component.
   - Add a route entry in the `routes` array:
     ```jsx
     { path: '/my-new-tool', element: <MyNewTool /> }
     ```

4. **Update Sidebar** (Optional)
   - If the tool should appear in the sidebar, add an entry in `frontend/src/App.jsx` within the `sidebarItems` array.

5. **Test the Tool**
   - Run `wails dev` to verify the tool works correctly.
   - Ensure UI matches Carbon Design System and all interaction rules are followed.

6. **Update Documentation**
   - Add the tool to the feature table in `README.md`.
   - Update `TOOL_STATUS.md` with the new tool (status: 🟢 Done).

---

## 9. Refactoring a Tool

Refer to **[TOOL_STATUS.md](./TOOL_STATUS.md)** for the current status of each tool. **Always check this file before modifying any tool component.**

### Refactoring Process
1. **Check Status**: If the tool is 🟢 Done, no changes are needed unless fixing bugs. If 🔴 Not Started, you may refactor.
2. **Update Status**: Change the tool's status to 🟡 In Progress with a note and timestamp.
3. **Follow Checklist**: Use the **Refactoring Checklist** in `TOOL_STATUS.md` to ensure all requirements are met:
   - [ ] Uses **Carbon Design System** components (`@carbon/react`)
   - [ ] All colors use `var(--cds-*)` tokens, no hardcoded hex values
   - [ ] Implements **useReducer** for state management (not multiple useState hooks)
   - [ ] Uses **useCallback** for memoized functions
   - [ ] Follows **DRY principle** – no duplicated components/logic
   - [ ] Has proper **ToolHeader** with title and description
   - [ ] Input/Output panes are symmetrical and use **Carbon TextArea**
   - [ ] All buttons properly spaced (gap: 1rem)
   - [ ] Copy buttons present on all output/data panes
   - [ ] Monospace font for data (`'IBM Plex Mono', monospace`)
   - [ ] Proper flex layout for responsive sizing
   - [ ] No unused imports or variables
   - [ ] Code compiles without errors or warnings
4. **Complete Refactoring**: After all checklist items are satisfied, change the status to 🟢 Done and add completion date.

---

## 10. Agent‑Specific Guidelines

These guidelines are intended for AI assistants (like opencode) working on this repository.

### Before Starting Work
1. **Read `AGENTS.md`** – Understand the design principles and implementation rules.
2. **Check `TOOL_STATUS.md`** – Never modify a tool that is already 🟢 Done or 🟡 In Progress unless explicitly instructed.
3. **Examine existing code** – Look at recently refactored tools (e.g., `JwtDebugger.jsx`) to see the expected patterns.

### While Implementing
1. **Follow Carbon Design System** – Use `@carbon/react` components, Carbon tokens, and the provided `ToolUI` helpers.
2. **State Management** – Prefer `useReducer` over multiple `useState` hooks for complex state.
3. **Performance** – Use `useCallback` for event handlers and `React.memo` for expensive components when appropriate.
4. **DRY** – Reuse existing components and utilities; avoid duplicating logic.
5. **UI Consistency** – Ensure input/output panes are identical in height, font, borders, and always show copy buttons.
6. **Code Quality** – Remove unused imports, variables, and debug logs before finishing.

### Before Finishing
1. **Run linting & formatting** – Execute any available lint/format commands (see section 7).
2. **Test the tool** – Verify functionality with `wails dev`.
3. **Update `TOOL_STATUS.md`** – If you refactored a tool, update its status and add a completion note.
4. **Commit changes** – Use descriptive commit messages that reference the tool name and changes made.

### Important Notes
- **Never commit secrets** – Avoid committing `.env`, credentials, or any sensitive data.
- **Respect existing conventions** – Follow the project’s code style, naming, and file structure.
- **Ask for clarification** – If unsure about any requirement, ask the user before proceeding.

---

*Last updated: 2026‑01‑24*
