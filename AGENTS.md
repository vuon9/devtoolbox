
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

### Layout Toggle (Horizontal/Vertical)
All tools with split-pane layouts **MUST** include a layout toggle button to allow users to switch between horizontal and vertical arrangements.

**Implementation Pattern:**
```jsx
import useLayoutToggle from '../hooks/useLayoutToggle';
import { ToolLayoutToggle } from '../components/ToolUI';

// In component:
const layout = useLayoutToggle({
    toolKey: 'unique-tool-key-layout',
    defaultDirection: 'horizontal',
    showToggle: true,
    persist: true
});

// In ToolControls:
<div style={{ marginLeft: 'auto', paddingBottom: '4px' }}>
    <ToolLayoutToggle
        direction={layout.direction}
        onToggle={layout.toggleDirection}
        position="controls"
    />
</div>

// On ToolSplitPane:
<ToolSplitPane columnCount={layout.direction === 'horizontal' ? 2 : 1}>
```

**Requirements:**
- Place the toggle button at the end of the `ToolControls` area using `marginLeft: 'auto'`
- Use a unique `toolKey` for each tool to ensure independent persistence
- Always set `persist: true` to remember user's preference
- Update `ToolSplitPane` to dynamically adjust `columnCount` based on layout direction

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

### Table-Driven Test Style (Mandatory)

All Go tests **MUST** follow Go's recommended table-driven (table test) style. This provides clear structure, easy addition of new test cases, and consistent test organization.

#### Required Structure:
```go
func TestConverter(t *testing.T) {
    tests := []struct {
        name      string  // Descriptive test case name
        input     string  // Input data
        method    string  // Method being tested
        subMode   string  // Mode (Encode/Decode, Encrypt/Decrypt, etc.)
        expected  string  // Expected output
        expectErr bool    // Whether an error is expected
    }{
        {"Base64 Encode hello", "hello", "base64", "Encode", "aGVsbG8=", false},
        {"Base64 Decode aGVsbG8=", "aGVsbG8=", "base64", "Decode", "hello", false},
        {"Hex Encode", "hello", "hex", "Encode", "68656c6c6f", false},
        // Add more cases...
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            req := ConversionRequest{
                Input:  tt.input,
                Method: tt.method,
                Config: map[string]interface{}{"subMode": tt.subMode},
            }
            result, err := conv.Convert(req)

            if tt.expectErr {
                if err == nil {
                    t.Errorf("Expected error but got none")
                }
                return
            }

            if err != nil {
                t.Errorf("Unexpected error: %v", err)
                return
            }

            if result != tt.expected {
                t.Errorf("Expected '%s', got '%s'", tt.expected, result)
            }
        })
    }
}
```

#### Key Requirements:
- **Name field**: Every test case must have a descriptive `name` field
- **Slice of structs**: Use `[]struct{...}` to define all test cases
- **Iterate with range**: Use `for _, tc := range tests`
- **Subtests with t.Run**: Always use `t.Run(tc.name, func(t *testing.T) {...})`
- **Parallel execution**: When needed, use `tc := tc` capture and `t.Parallel()`

### What NOT to Do:
❌ **Individual t.Run() calls** - Don't write separate `t.Run()` calls for each test case:
```go
// BAD - Don't do this
t.Run("Test 1", func(t *testing.T) { ... })
t.Run("Test 2", func(t *testing.T) { ... })
t.Run("Test 3", func(t *testing.T) { ... })
```

✅ **Do this instead**:
```go
// GOOD - Table-driven
for _, tc := range tests {
    t.Run(tc.name, func(t *testing.T) { ... })
}
```

### Best Practices:
- **Clear case names**: Use descriptive names like `"AES Encrypt - simple text"` not `"test1"`
- **Deterministic setup**: Avoid global state, setup everything in the test function
- **Test both directions**: For bidirectional operations (encode/decode), test both ways
- **Edge cases**: Include empty strings, special characters, unicode, long text
- **Error cases**: Test invalid inputs and expect errors

### Running Tests:
```bash
# Run all tests
go test ./internal/converter/...

# Run with verbose output
go test ./internal/converter/... -v

# Run specific test
go test ./internal/converter/... -run TestEncodingConverter
```

---

## 6. Backend Architecture & Patterns

This project follows clean architecture principles with domain‑driven design (DDD) inspiration. The backend is organized into layers with clear separation of concerns.

### Package Structure

- **`internal/`** – Domain‑specific packages (e.g., `internal/jwt/`). These are private to the application and not importable outside.
- **`pkg/`** – Shared, reusable utilities (e.g., `pkg/encoding`, `pkg/validation`, `pkg/errors`). These are public and can be imported by other packages. (Previously organized under `pkg/shared/`; now flattened for simplicity.)
- **`*.go` in root** – Wails binding structs (e.g., `jwt_service.go`). Each tool that needs backend logic should have its own service file.

### Domain Package Structure (Example: `internal/jwt/`)

```
internal/jwt/
├── errors.go      # Domain‑specific error types
├── token.go       # Core domain models (Token, ValidationResult) with builder pattern
├── parser.go      # Interface and implementation for parsing/verification
├── service.go     # Service interface and implementation
└── dto.go         # Data transfer objects matching frontend state
```

### Key Patterns

1. **Interfaces First**: Define interfaces for major components (e.g., `Parser`, `JWTService`).
2. **Builder Pattern**: Use fluent builders for complex objects (see `Token.WithHeader()`, `ValidationResult.WithMessage()`).
3. **Error Mapping**: Convert library errors to domain errors using shared error types from `pkg/errors`.
4. **State Compatibility**: Backend response structures must exactly match frontend state (see `DecodeResponse`, `VerifyResponse` in `dto.go`).
5. **Wails Binding**: Create a separate service struct for each tool (e.g., `JWTService`) that implements `startup()` and exposes methods to the frontend.

### Implementation Example (JWT Debugger)

**Service Definition** (`jwt_service.go`):
```go
type JWTService struct {
    ctx context.Context
    svc jwt.JWTService
}

func (j *JWTService) Decode(token string) (jwt.DecodeResponse, error) {
    result, err := j.svc.Decode(token)
    if err != nil {
        return jwt.DecodeResponse{Error: err.Error()}, nil
    }
    return jwt.FromToken(result), nil
}
```

**Frontend Integration** (`JwtDebugger.jsx`):
```js
const response = await window.go.main.JWTService.Decode(state.token);
```

### Testing Backend Code

All Go tests MUST follow the table‑driven style described in section 5. Example:

```go
func TestDecode(t *testing.T) {
    tests := []struct {
        name    string
        token   string
        wantErr bool
    }{
        {name: "valid token", token: "eyJ...", wantErr: false},
        {name: "empty token", token: "", wantErr: true},
    }
    for _, tc := range tests {
        t.Run(tc.name, func(t *testing.T) {
            // test logic
        })
    }
}
```

---

## 7. Development Setup

### Prerequisites
- **Bun** (>= 1.0) - Required for frontend dependencies
- **Go** (>= 1.22)
- **Wails CLI** (`go install github.com/wailsapp/wails/v2/cmd/wails@latest`)

### Installation
```bash
# Clone the repository
git clone https://github.com/vuon9/devtoolbox.git
cd devtoolbox

# Install dependencies (using Bun)
bun install
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

## 8. Linting & Formatting

### Frontend
- **ESLint**: Not currently configured. Consider adding `.eslintrc` and scripts.
- **Prettier**: Not currently configured. Consider adding `.prettierrc`.

**Recommended**: Add linting and formatting scripts to `package.json`:
```json
"scripts": {
  "lint": "eslint src --ext .js,.jsx",
  "format": "prettier --write src/**/*.{js,jsx}"
}
```

Run these commands before committing:
```bash
bun run lint
bun run format
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

## 9. Adding a New Tool

Follow this step‑by‑step guide to add a new tool component:

1. **Create Component File**
   - Create a new `.jsx` file in `src/pages/` (e.g., `MyNewTool.jsx`).
   - Use the existing tool components as reference (e.g., `JwtDebugger.jsx`).

2. **Implement the Tool**
   - Import Carbon components and `ToolUI` helpers.
   - Use `useReducer` for state management (not multiple `useState` hooks).
   - Use `useCallback` for memoized functions.
   - Follow the **Tool Layout Structure** (Header → Controls → Workspace).
   - Use `ToolHeader`, `ToolControls`, `ToolPane`, `ToolSplitPane` from `ToolUI.jsx`.
   - Ensure input/output panes are symmetrical, have monospace fonts, and include copy buttons.

3. **Add Route**
   - Open `src/App.jsx`.
   - Import your new component.
   - Add the component to the `renderTool()` switch statement:
     ```jsx
     case 'my-new-tool': return <MyNewTool />;
     ```

4. **Update Sidebar**
   - Open `src/components/Sidebar.jsx`.
   - Add an entry to the `tools` array:
     ```jsx
     { id: 'my-new-tool', name: 'My New Tool', icon: '🛠️' }
     ```

5. **Test the Tool**
   - Run `wails dev` to verify the tool works correctly.
   - Ensure UI matches Carbon Design System and all interaction rules are followed.

6. **Update Documentation**
   - Add the tool to the feature table in `README.md`.
   - Update `TOOL_STATUS.md` with the new tool (status: 🟢 Done).

---

## 9b. Consolidating/Merging Tools (Unified Tools Pattern)

When creating a unified tool that replaces multiple existing tools (e.g., `CodeFormatter` replacing `JsonFormatter`, `SqlFormatter`, etc.), follow these additional steps:

### Implementation Steps

1. **Create Unified Tool First**
   - Build the new unified tool following the standard tool creation process
   - Ensure it covers ALL features of the tools it replaces
   - Test thoroughly before removing old tools

2. **Update All Registrations**
   - Add route in `App.jsx` for the new unified tool
   - Add entry in `Sidebar.jsx` for navigation
   - Register backend service in `main.go` and `server.go`

3. **Documentation Updates**
   - Update `README.md` to reflect the consolidated tool (remove entries for replaced tools, add unified tool entry)
   - Update `TOOL_STATUS.md`:
     - Mark new unified tool as 🟢 Done
     - Optionally add notes about which tools it replaces
   - Consider adding a note in AGENTS.md about this consolidation pattern

4. **Testing the Migration**
   - Verify all functionality from old tools works in the unified tool
   - Test sidebar navigation and routing
   - Ensure state persistence works correctly

### Tool Removal Process (After Migration is Complete)

Once the unified tool is fully functional and tested:

1. **Remove Old Tool Components**
   - Delete old component files from `src/pages/`
   - Remove imports from `App.jsx`
   - Remove entries from `Sidebar.jsx`
   - Clean up any unused backend services

2. **Update TOOL_STATUS.md**
   - Remove entries for deprecated tools, OR
   - Mark them as "Replaced by [UnifiedTool]" with strikethrough

3. **Clean Up Backend (if applicable)**
   - Remove unused service files from root directory
   - Remove unused internal packages if no longer needed
   - Update `main.go` to remove old service bindings

### Example: CodeFormatter Consolidation

**Replaced Tools:**
- `JsonFormatter` → Now part of CodeFormatter with jq filter support
- `SqlFormatter` → Now part of CodeFormatter with SQL formatting
- (Future: XML tools, CSS tools, etc.)

**Migration Notes:**
- CodeFormatter adds new capabilities (jq filters, XPath, CSS selectors) not in original tools
- State persistence moved to unified storage key
- Backend service supports 6+ format types with extensible architecture

---

## 10. Refactoring a Tool

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

## 11. Agent‑Specific Guidelines

These guidelines are intended for AI assistants (like opencode) working on this repository.

### Before Starting Work
1. **Read `AGENTS.md`** – Understand the design principles and implementation rules.
2. **Check `TOOL_STATUS.md`** – Never modify a tool that is already 🟢 Done or 🟡 In Progress unless explicitly instructed.
3. **Examine existing code** – Look at recently refactored tools (e.g., `JwtDebugger.jsx` and its Go backend in `internal/jwt/`) to see the expected patterns.

### While Implementing
1. **Follow Carbon Design System** – Use `@carbon/react` components, Carbon tokens, and the provided `ToolUI` helpers.
2. **State Management** – Prefer `useReducer` over multiple `useState` hooks for complex state.
3. **Performance** – Use `useCallback` for event handlers and `React.memo` for expensive components when appropriate.
4. **DRY** – Reuse existing components and utilities; avoid duplicating logic.
5. **UI Consistency** – Ensure input/output panes are identical in height, font, borders, and always show copy buttons.
6. **Code Quality** – Remove unused imports, variables, and debug logs before finishing.

### Before Finishing
1. **Run linting & formatting** – Execute any available lint/format commands (see section 8).
2. **Test the tool** – Verify functionality with `wails dev`.
3. **Update `TOOL_STATUS.md`** – Update the tool's status and add completion notes (mark as 🟢 Done when complete).
4. **Update `README.md`** – **REQUIRED: Whenever TOOL_STATUS.md is updated, README.md MUST also be updated to ensure consistency**:
   - Add new tools to the feature table
   - Remove deprecated tools
   - Update descriptions if features changed
   - Keep the tool count/feature list in sync
   - **This is mandatory** - never update TOOL_STATUS.md without checking/updating README.md
5. **Commit changes** – Use descriptive commit messages that reference the tool name and changes made.

### Important Notes
- **Never commit secrets** – Avoid committing `.env`, credentials, or any sensitive data.
- **Respect existing conventions** – Follow the project’s code style, naming, and file structure.
- **Ask for clarification** – If unsure about any requirement, ask the user before proceeding.

---

*Last updated: 2026‑01‑31*
