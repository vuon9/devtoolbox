# Number Converter Implementation Plan

**Design Document:** `docs/plans/2025-01-27-number-converter-redesign.md`  
**Goal:** Implement visual bit editor with parallel workstreams

---

## Workstream Overview

This implementation is divided into **7 parallel workstreams**. Each can be developed independently and tested in isolation before integration.

```
┌─────────────────────────────────────────────────────────────┐
│  WORKSTREAM 1          WORKSTREAM 2          WORKSTREAM 3  │
│  State Management      Utility Functions     BitGrid        │
│  (Reducer)             (Conversions)         Component      │
│                                                             │
│  WORKSTREAM 4          WORKSTREAM 5          WORKSTREAM 6  │
│  ConversionCard        BitwiseToolbar        Constants      │
│  Component             Component             & Types       │
│                                                             │
│                    WORKSTREAM 7                             │
│                    Main Integration                         │
│                    & Final Assembly                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Workstream 1: State Management (Reducer)
**File:** `frontend/src/pages/NumberConverter/numberConverterReducer.js`

**Deliverables:**
```javascript
// Initial state
const initialState = {
  value: 0,
  inputMode: 'decimal',
  customBase: 36,
  errors: {}
};

// Action types
const actions = {
  SET_VALUE,
  TOGGLE_BIT,
  SET_INPUT_MODE,
  SET_CUSTOM_BASE,
  SET_ERROR,
  CLEAR_ERROR,
  APPLY_BITWISE_OP
};

// Reducer function
function numberConverterReducer(state, action) { ... }

// Action creators
const actionCreators = {
  setValue,
  toggleBit,
  setInputMode,
  setCustomBase,
  setError,
  clearError,
  applyBitwiseOp
};
```

**Test in isolation:**
```javascript
// Test cases needed:
- Toggle bit 0 on 0 → should be 1
- Toggle bit 0 on 1 → should be 0
- Set value to 255 → all conversions should update
- Set error on hex input → error object populated
- Clear error → error object empty
```

**Dependencies:** None (pure logic)

---

## Workstream 2: Utility Functions
**File:** `frontend/src/pages/NumberConverter/utils.js`

**Deliverables:**
```javascript
// Parsing (string → number)
export function parseInput(input, base);
export function parseHex(input);
export function parseBinary(input);
export function parseOctal(input);
export function parseDecimal(input);
export function parseCustomBase(input, base);

// Formatting (number → string)
export function formatNumber(value, base);
export function formatHex(value);
export function formatBinary(value);
export function formatOctal(value);
export function formatDecimal(value);
export function formatCustomBase(value, base);

// Bit manipulation
export function toggleBit(value, position);
export function shiftLeft(value, n);
export function shiftRight(value, n);
export function bitwiseNot(value);
export function bitwiseAnd(value, mask);
export function bitwiseOr(value, mask);

// Validation
export function validateInput(input, base);
export function sanitizeInput(input);
```

**Edge Cases to Handle:**
- Empty string returns null
- Whitespace trimmed
- Case insensitivity for hex
- Overflow clamping to 32-bit
- Invalid characters throw with message

**Test in isolation:**
```javascript
// Test matrix:
Input          | Base | Expected Value
"FF"           | 16   | 255
"1010"         | 2    | 10
"377"          | 8    | 255
"255"          | 10   | 255
"   42  "      | 10   | 42 (trimmed)
"GG"           | 16   | throw Error
"99999999999"  | 10   | 4294967295 (clamped)
"-5"           | 10   | throw Error
```

**Dependencies:** None (pure logic)

---

## Workstream 3: BitGrid Component
**File:** `frontend/src/pages/NumberConverter/components/BitGrid.jsx`

**Deliverables:**
```jsx
// BitGrid.jsx
export function BitGrid({ value, onToggleBit, layout }) {
  // Display 4 rows × 8 bits
  // Row 0: bits 31-24 (MSB)
  // Row 1: bits 23-16
  // Row 2: bits 15-8
  // Row 3: bits 7-0 (LSB)
}

// BitCell.jsx (sub-component)
export function BitCell({ 
  bitValue,      // 0 or 1
  position,      // 0-31
  onToggle,      // callback(position)
  isHovered      // hover state from parent
}) {
  // Clickable 32×32px cell
  // Hover: scale(1.1)
  // Active: filled with primary color
  // Inactive: outlined
}
```

**Props Interface:**
```typescript
interface BitGridProps {
  value: number;              // 32-bit value
  onToggleBit: (position: number) => void;
  layout: 'horizontal' | 'vertical';
}
```

**Visual Specs:**
- Cell size: 32×32px
- Gap: 4px
- Active color: `var(--cds-interactive-01)`
- Inactive border: `var(--cds-border-strong)`
- Row label font: monospace, `var(--cds-text-secondary)`

**Test in isolation:**
```javascript
- Renders 32 cells
- Clicking cell calls onToggleBit with correct position
- Value 0xFF shows bits 0-7 as active
- Value 0xFF000000 shows bits 24-31 as active
- Keyboard navigation works (Tab, Space, Enter)
```

**Dependencies:** None (uses only Carbon CSS variables)

---

## Workstream 4: ConversionCard Component
**File:** `frontend/src/pages/NumberConverter/components/ConversionCard.jsx`

**Deliverables:**
```jsx
// ConversionCard.jsx
export function ConversionCard({
  label,           // "Decimal", "Hexadecimal", etc.
  base,            // 10, 16, 2, 8, or custom
  value,           // Current numeric value
  error,           // Error message or null
  onChange,        // callback(newValue) - parse and update
  onCopy,          // callback() - copy to clipboard
  onSync           // callback() - sync from this field
}) {
  // TextInput with label
  // Copy button
  // Sync button (sets this as source)
  // Error display
}
```

**Props Interface:**
```typescript
interface ConversionCardProps {
  label: string;
  base: number;
  value: number;
  error?: string;
  onChange: (input: string) => void;
  onCopy: () => void;
  onSync: () => void;
}
```

**Features:**
- Monospace font for binary display
- Copy button uses Carbon `Button` with Copy icon
- Sync button to reverse-sync (input becomes source)
- Inline error display below input
- Placeholder shows example: "Enter decimal number..."

**Test in isolation:**
```javascript
- Typing valid input calls onChange
- Typing invalid input shows error
- Copy button copies formatted value
- Sync button calls onSync
- Error state shows red border
```

**Dependencies:** Carbon `TextInput`, `Button`, `InlineNotification`

---

## Workstream 5: BitwiseToolbar Component
**File:** `frontend/src/pages/NumberConverter/components/BitwiseToolbar.jsx`

**Deliverables:**
```jsx
// BitwiseToolbar.jsx
export function BitwiseToolbar({ onOperation }) {
  // Button group:
  // [<< 1] [>> 1] [NOT] [& 0xFF] [| 1]
}

// Operations supported:
// 'shiftLeft': value << 1
// 'shiftRight': value >>> 1 (logical)
// 'not': ~value
// 'maskByte': value & 0xFF
// 'setLSB': value | 1
```

**Props Interface:**
```typescript
interface BitwiseToolbarProps {
  onOperation: (operation: string) => void;
}
```

**Visual Specs:**
- Button group with `kind="secondary"`
- Size: `sm` (small)
- Gap: 8px between buttons
- Tooltip on hover showing operation description

**Test in isolation:**
```javascript
- Clicking [<< 1] calls onOperation('shiftLeft')
- Clicking [NOT] calls onOperation('not')
- All 5 buttons rendered
- Keyboard accessible (Tab, Enter)
```

**Dependencies:** Carbon `Button`, `ButtonSet`

---

## Workstream 6: Constants & Types
**File:** `frontend/src/pages/NumberConverter/constants.js`

**Deliverables:**
```javascript
// Base configurations
export const BASES = {
  BINARY: { id: 'bin', label: 'Binary', base: 2 },
  OCTAL: { id: 'oct', label: 'Octal', base: 8 },
  DECIMAL: { id: 'dec', label: 'Decimal', base: 10 },
  HEXADECIMAL: { id: 'hex', label: 'Hexadecimal', base: 16 },
};

// Custom base options (2-36)
export const CUSTOM_BASE_OPTIONS = Array.from({ length: 35 }, (_, i) => ({
  id: `${i + 2}`,
  label: `Base ${i + 2}`,
  value: i + 2,
}));

// Bitwise operations
export const BITWISE_OPERATIONS = {
  SHIFT_LEFT: { id: 'shiftLeft', label: '<< 1', description: 'Shift left by 1' },
  SHIFT_RIGHT: { id: 'shiftRight', label: '>> 1', description: 'Shift right by 1' },
  NOT: { id: 'not', label: 'NOT', description: 'Flip all bits' },
  MASK_BYTE: { id: 'maskByte', label: '& 0xFF', description: 'Keep lowest byte' },
  SET_LSB: { id: 'setLSB', label: '| 1', description: 'Set least significant bit' },
};

// Validation messages
export const ERROR_MESSAGES = {
  INVALID_CHAR: (char, base) => `Invalid character '${char}' for base ${base}`,
  NEGATIVE: 'Negative numbers are not supported',
  OVERFLOW: 'Value clamped to 32-bit maximum',
  EMPTY: 'Input cannot be empty',
};

// Limits
export const MAX_32BIT = 0xFFFFFFFF; // 4,294,967,295
export const MIN_32BIT = 0;
```

**Dependencies:** None

---

## Workstream 7: Main Integration
**File:** `frontend/src/pages/NumberConverter/index.jsx`

**Deliverables:**
Complete page component integrating all workstreams:

```jsx
export default function NumberConverter() {
  // State
  const [state, dispatch] = useReducer(numberConverterReducer, initialState);
  const layout = useLayoutToggle({ toolKey: 'number-converter', ... });
  
  // Handlers
  const handleToggleBit = (position) => dispatch(toggleBit(position));
  const handleConversionInput = (base, input) => { ... };
  const handleBitwiseOp = (operation) => { ... };
  const handleCopy = (value) => navigator.clipboard.writeText(value);
  
  // Render
  return (
    <div className="tool-container">
      <ToolHeader title="Number Converter" description="..." />
      
      <ToolSplitPane direction={layout.direction}>
        <!-- Left: Bit Grid + Toolbar -->
        <div>
          <BitwiseToolbar onOperation={handleBitwiseOp} />
          <BitGrid 
            value={state.value} 
            onToggleBit={handleToggleBit}
            layout={layout.direction}
          />
        </div>
        
        <!-- Right: Conversion Cards -->
        <div>
          {Object.values(BASES).map(baseConfig => (
            <ConversionCard
              key={baseConfig.id}
              label={baseConfig.label}
              base={baseConfig.base}
              value={state.value}
              error={state.errors[baseConfig.id]}
              onChange={(input) => handleConversionInput(baseConfig.base, input)}
              onCopy={() => handleCopy(formatNumber(state.value, baseConfig.base))}
              onSync={() => dispatch(setInputMode(baseConfig.id))}
            />
          ))}
          <ConversionCard
            label="Custom Base"
            base={state.customBase}
            // ... custom base card
          />
        </div>
      </ToolSplitPane>
    </div>
  );
}
```

**Integration Checklist:**
- [ ] Import all workstream components
- [ ] Wire up reducer and actions
- [ ] Connect layout toggle
- [ ] Handle all user interactions
- [ ] Display errors from state
- [ ] Format values for display
- [ ] Add copy functionality

**Dependencies:** ALL other workstreams

---

## Implementation Order

### Phase 1: Foundation (Parallel)
Workstreams 1, 2, and 6 can start immediately and run in parallel:
- **WS1** (Reducer) - No dependencies
- **WS2** (Utils) - No dependencies  
- **WS6** (Constants) - No dependencies

### Phase 2: Components (Parallel)
Once Phase 1 is done, workstreams 3, 4, and 5 can run in parallel:
- **WS3** (BitGrid) - Uses WS2 for bit manipulation
- **WS4** (ConversionCard) - Uses WS2 for formatting
- **WS5** (BitwiseToolbar) - No dependencies

### Phase 3: Integration (Sequential)
Workstream 7 depends on ALL others:
- **WS7** (Main) - Uses WS1, WS2, WS3, WS4, WS5, WS6

---

## Testing Strategy

### Unit Tests (Per Workstream)
Each workstream should include unit tests before integration:

**WS1 (Reducer):** Test all state transitions
**WS2 (Utils):** Test conversion functions with edge cases
**WS3 (BitGrid):** Test rendering and interactions
**WS4 (ConversionCard):** Test input handling and validation
**WS5 (BitwiseToolbar):** Test button callbacks
**WS6 (Constants):** N/A - just definitions

### Integration Tests
After WS7, test the complete flow:
- End-to-end conversion scenarios
- Bit manipulation workflows
- Error handling paths
- Accessibility compliance

### Visual Regression Tests
- Screenshot tests for different values
- Layout toggle states
- Error states
- Dark/light mode

---

## Success Criteria

✅ All 7 workstreams complete  
✅ Unit tests pass for each workstream  
✅ Integration tests pass  
✅ No console errors  
✅ Accessibility audit passes  
✅ Visual design matches spec  
✅ Performance: <100ms for bit toggle feedback  

---

## Notes for Agents

1. **Work independently** - Each workstream can be developed without blocking others
2. **Use mocks** - If a dependency isn't ready, mock it with the expected interface
3. **Write tests first** - Each workstream should be testable in isolation
4. **Document exports** - Make sure the interface is clear for integration
5. **Follow Carbon** - Use existing Carbon components and CSS variables
6. **Check AGENTS.md** - Follow project conventions for UI patterns

**Ready to start?** Pick any Phase 1 workstream and begin implementation.
