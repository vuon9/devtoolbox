# Number Converter Redesign - Visual Bit Editor

**Date:** 2025-01-27  
**Status:** Design Complete  
**Approach:** Visual Bit Editor with Interactive Bitwise Operations

---

## 1. Overview & Architecture

### Concept
Transform the Number Converter from a form-filling task into an interactive exploration tool. Users interact with a visual 32-bit representation where they can toggle individual bits, perform bitwise operations, and instantly see conversions across all bases.

### Core Architecture
- **32-bit representation as source of truth** - All conversions derive from a single 32-bit unsigned integer
- **Bidirectional input** - Click bits in the grid OR type into conversion fields; changes sync both ways
- **Visual hierarchy** - Bit grid dominates (4 rows × 8 bits), color-coded by byte significance
- **Simple bitwise operations** - One-click toolbar for common operations

### Technology Stack
- React with Carbon Design System (existing)
- No new dependencies
- Layout toggle with localStorage persistence

---

## 2. Components & UI Structure

### Layout
Split-pane with layout toggle (horizontal/vertical), following existing `useLayoutToggle` pattern.

### Left Pane - Visual Bit Grid (60% width)
**Header:**
- "Bit Pattern" label
- Bit position indicators (31-0)
- Byte hex summaries

**Grid:**
```
Row 0 (31-24): ■ □ □ ■ □ □ ■ □  [0x4A]
Row 1 (23-16): □ ■ □ □ ■ □ □ ■  [0x25]
Row 2 (15-8):  ■ ■ □ □ □ ■ □ □  [0xC3]
Row 3 (7-0):   □ □ ■ ■ □ □ ■ □  [0x32]
```

**Bit Cells (32×32px):**
- `1` = filled with `--cds-interactive-01` (primary accent)
- `0` = outlined with `--cds-border-strong`
- Hover: scale(1.1) with shadow
- Click: toggle bit

**Toolbar (above grid):**
- `<< 1` - Shift left
- `>> 1` - Shift right  
- `NOT` - Flip all bits
- `& 0xFF` - Mask to byte
- `| 1` - Set LSB

### Right Pane - Conversion Cards (40% width)
Stacked cards showing derived values:
1. **Decimal** (largest, most prominent)
2. **Hexadecimal**
3. **Binary** (monospace, wrapped)
4. **Octal**
5. **Custom Base** (dropdown 2-36)

Each card: label, input field, copy button, "sync" button to reverse-sync

---

## 3. Data Flow & State Management

### State Shape
```typescript
interface NumberConverterState {
  value: number;              // 32-bit unsigned integer (0 to 2^32-1)
  inputMode: 'decimal' | 'hex' | 'binary' | 'octal' | 'custom';
  customBase: number;         // 2-36
  errors: {
    decimal?: string;
    hex?: string;
    binary?: string;
    octal?: string;
    custom?: string;
  };
  layout: 'horizontal' | 'vertical';
}
```

### Data Flow Patterns

**1. Bit Grid Click:**
```
User clicks bit at position N
↓
Calculate: newValue = currentValue ^ (1 << N)
↓
Update state.value
↓
Re-render all conversion displays
```

**2. Conversion Input:**
```
User types in Hex input field
↓
Parse with base 16
↓
Valid: Update state.value, clear error
Invalid: Show error inline, keep last valid value
↓
Bit grid re-renders from new value
```

**3. Bitwise Operation:**
```
User clicks "<< 1" button
↓
Calculate: newValue = (currentValue << 1) & 0xFFFFFFFF
↓
Update state.value
↓
All displays update
```

### Performance Optimizations
- `useMemo` for expensive base conversions
- Bit grid uses CSS transforms (GPU-accelerated)
- No unnecessary re-renders

---

## 4. Bitwise Operations

### Operation Toolbar
Simple buttons above the bit grid:

| Button | Operation | Example |
|--------|-----------|---------|
| `<< 1` | Shift left by 1 | `0x0F` → `0x1E` |
| `>> 1` | Logical shift right by 1 | `0xF0` → `0x78` |
| `NOT` | Bitwise NOT | `0x0F` → `0xFFFFFFF0` |
| `& 0xFF` | AND with 0xFF | `0xABCD` → `0xCD` |
| `\| 1` | OR with 1 | `0xFE` → `0xFF` |

### Interaction
- Click button → operation applies immediately
- No preview mode, no operand input
- Simple undo: click opposite operation
- Visual feedback: button press animation

---

## 5. Error Handling & Edge Cases

### Input Validation Errors

**Invalid Characters:**
- Hex input with non-hex chars (G-Z)
- Binary input with digits other than 0-1
- Octal input with digits 8-9
- Show: "Invalid character 'X' for base Y"

**Format Errors:**
- Empty string → valid (no change)
- Whitespace-only → trim or error
- Leading/trailing whitespace → auto-trim

**Range Errors:**
- Value > 2^32-1 (4,294,967,295) → clamp to max
- Value < 0 → error: "Negative numbers not supported"
- Scientific notation → parse or error

### Bit Manipulation Edge Cases

**Shift Operations:**
- Shift by 0 → no change
- Shift by 32+ → wraps (JS behavior: `x << 32 === x`)
- Shift negative → error

**Identity Operations:**
- `x & x` = x
- `x | x` = x
- `x ^ 0` = x
- Handle gracefully

**Boundary Values:**
- Bit 31 toggle (0x80000000)
- All zeros (0x00000000)
- All ones (0xFFFFFFFF)
- Single bit set (powers of 2)

### Display Edge Cases

**Binary Display:**
- Always show 32 bits for consistency
- Group by 4 bits: `0001 0010 0011 0100`
- Wrap in monospace textarea

**Decimal Display:**
- Large values: show full precision
- Add thousand separators: `4,294,967,295`

**Custom Base:**
- Base 36: 0-9, A-Z
- Handle uppercase/lowercase consistently

### Accessibility

**Keyboard Navigation:**
- Tab through bit cells
- Space/Enter to toggle bit
- Shift+Tab for reverse navigation

**Screen Readers:**
- Bit cells: `aria-pressed` for state
- Error messages: `aria-live="polite"`
- Labels on all interactive elements

### Race Conditions & Performance

**Rapid Interactions:**
- Debounce rapid bit clicks (50ms)
- Prevent double-submission of operations

**Copy Operations:**
- Handle copy failure gracefully
- Show toast on success/error

**Layout Changes:**
- Maintain scroll position on layout toggle
- Responsive bit grid sizing

---

## 6. Testing Checklist

### Functional Tests
- [ ] All base conversions work bidirectionally
- [ ] Bit toggles update all displays instantly
- [ ] Each bitwise operation produces correct result
- [ ] Invalid input shows appropriate error
- [ ] Copy button copies correct value

### Edge Case Tests
- [ ] Maximum value (0xFFFFFFFF)
- [ ] Zero value
- [ ] Negative input rejected
- [ ] Overflow clamped
- [ ] Whitespace trimmed
- [ ] Case insensitivity (hex)

### UX Tests
- [ ] Layout toggle persists
- [ ] Keyboard navigation works
- [ ] Touch targets adequate size
- [ ] Hover states visible
- [ ] Error messages clear

### Accessibility Tests
- [ ] Screen reader announces bit state
- [ ] Focus visible on all interactive elements
- [ ] Color not sole error indicator

---

## 7. Implementation Notes

### File Structure
```
frontend/src/pages/NumberConverter/
├── index.jsx              # Main component
├── numberConverterReducer.js  # State management
├── utils.js               # Conversion utilities
├── constants.js           # Base configs
└── components/
    ├── BitGrid.jsx        # Visual bit grid
    ├── BitCell.jsx        # Individual bit toggle
    ├── ConversionCard.jsx # Input with copy/sync
    ├── BitwiseToolbar.jsx # Operation buttons
    └── ByteLabel.jsx      # Byte hex display
```

### Key Utilities Needed
```javascript
// utils.js
export const parseInput = (input, base) => { ... }
export const formatNumber = (value, base) => { ... }
export const toggleBit = (value, position) => { ... }
export const shiftLeft = (value, n) => { ... }
export const shiftRight = (value, n) => { ... }
export const bitwiseNot = (value) => { ... }
```

### Carbon Components Used
- `TextInput` - Conversion inputs
- `Button` - Operations, copy
- `Dropdown` - Custom base selector
- `Grid/Column` - Layout
- `InlineNotification` - Errors

---

## Summary

This redesign transforms the Number Converter from a passive form into an active exploration tool. The visual bit grid makes binary tangible, bitwise operations are one-click away, and all conversions update in real-time. The design maintains consistency with existing Carbon Design System usage while adding engaging interactivity.
