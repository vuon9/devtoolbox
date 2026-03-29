# Number Converter Redesign

**Date:** 2026-03-29  
**Status:** Approved for Implementation

## Summary

Redesign the Number Converter tool to be more practical and useful by showing what numbers represent in different real-world contexts (bytes, ASCII, colors, IP addresses, file sizes, timestamps). Use a compact 3-column layout to maximize space efficiency.

## Current Issues

1. **Too abstract:** Just shows number bases without practical context
2. **Wasted space:** Large cards with excessive padding
3. **Bit grid is confusing:** Shows 32 bits without labels or context
4. **No practical value:** Doesn't help developers understand what the number means

## Requirements

### Layout

**3-Column Compact Layout:**
- Column 1: Number Bases + Bit Breakdown
- Column 2: Data Representation (bytes, ASCII, color)
- Column 3: Network/Time Context (IP, file size, timestamp, percentage)

### Column 1: Number Bases

**Base Display:**
- Binary, Decimal, Hex, Octal in compact horizontal cards
- Current base highlighted with blue border
- One-click copy for each base value
- Small font size (12px) to save space

**Bit Breakdown:**
- 8-bit view (byte-level) instead of 32-bit
- Each bit shows: bit value (0/1) + decimal value (128, 64, 32, 16, 8, 4, 2, 1)
- Color coding: blue for 1s, muted for 0s
- Sum equation at bottom (e.g., "128+64+32+16+8+4+2+1=255")

### Column 2: Data Representation

**Byte Representation:**
- Show as 4-byte integer (32-bit)
- Big-endian format: `00 00 00 FF`
- Highlight the active byte (LSB)
- Label MSB and LSB

**ASCII Character:**
- Show character representation (e.g., 'ÿ' for 255)
- Note if it's printable ASCII (32-126) or extended
- Show character code

**Color Preview:**
- If number fits in RGB range (0-255), show as color
- Display hex color code (e.g., `#0000FF`)
- Small color swatch (28x28px)
- Only show for values 0-255

### Column 3: Network & Time

**IPv4 Address:**
- Show as last byte of IP: `0.0.0.255`
- Note if it's a special address (broadcast, multicast, etc.)

**File Size:**
- Show human-readable size
- Bytes: `255 bytes`
- KB: `0.25 KB`
- MB: `0.00024 MB`

**Unix Timestamp:**
- Convert to datetime: `1970-01-01 00:04:15 UTC`
- Show duration since epoch (e.g., "4m 15s")

**Percentage:**
- Show as percentage of 8-bit max: `100%`
- Useful for opacity/alpha values

### Input Section

**Input Field:**
- Large, prominent input at top
- Show current number
- "Random" button to generate test values
- Clear button to reset

**Base Selector:**
- Dropdown or segmented control to choose input base
- Options: Binary, Octal, Decimal, Hex
- Auto-detect pasted values

### Styling

**Compact Design:**
- Small padding (8-10px) on cards
- Smaller font sizes (9-12px)
- Tight spacing (6-8px gaps)
- No wasted vertical space

**Colors:**
- Dark theme matching devtoolbox
- Blue (#3b82f6) for active/highlighted elements
- Gray (#71717a) for labels
- White (#f4f4f5) for values

**Typography:**
- Monospace for all numbers
- System font for labels
- Uppercase for section headers

## Sample Data Examples

**Example 1: 255**
- Bases: `11111111`, `255`, `0xFF`, `377`
- Bytes: `00 00 00 FF`
- ASCII: `ÿ` (extended ASCII)
- Color: `#0000FF` (blue)
- IP: `0.0.0.255` (broadcast)
- File: `255 bytes`
- Time: `1970-01-01 00:04:15` (4m 15s)
- Percentage: `100%`

**Example 2: 16711680 (0xFF0000)**
- Bases: `111111110000000000000000`, `16711680`, `0xFF0000`
- Bytes: `00 FF 00 00`
- ASCII: N/A (not in range)
- Color: `#FF0000` (red)
- IP: N/A (too large)
- File: `15.9 MB`
- Time: `1970-06-26 18:47:00`
- Percentage: N/A

## Architecture

### Backend Changes

**File:** `internal/numberconverter/service.go` (new file)

Create a new service to handle number conversions:
- Convert between number bases
- Calculate bit positions
- Interpret as different data types
- Format for display

**File:** `service/numberconverter.go` (new file)

Wails service binding for the number converter.

### Frontend Changes

**File:** `frontend/src/pages/NumberConverter/index.jsx` (complete rewrite)

New component structure:
- Main layout with 3 columns
- Input section at top
- Column 1: BaseCards + BitBreakdown
- Column 2: ByteView + AsciiView + ColorView
- Column 3: IpView + FileSizeView + TimestampView + PercentageView

**Components:**
- `BaseCard` - Compact base display with copy button
- `BitBreakdown` - 8-bit grid with decimal values
- `ByteView` - 4-byte representation
- `AsciiView` - Character display
- `ColorView` - Color swatch with hex
- `IpView` - IPv4 format
- `FileSizeView` - Human-readable size
- `TimestampView` - DateTime conversion
- `PercentageView` - % of 255

## Data Flow

1. User enters number or clicks "Random"
2. Frontend sends number + base to backend
3. Backend calculates:
   - All base conversions
   - Bit breakdown
   - Data interpretations
4. Returns structured response
5. Frontend renders 3-column layout

## API Design

**Request:**
```json
{
  "value": "255",
  "base": "decimal"
}
```

**Response:**
```json
{
  "binary": "11111111",
  "decimal": "255",
  "hex": "0xFF",
  "octal": "377",
  "bits": [1,1,1,1,1,1,1,1],
  "bitValues": [128,64,32,16,8,4,2,1],
  "bytes": {
    "bigEndian": ["00", "00", "00", "FF"],
    "highlighted": 3
  },
  "ascii": {
    "char": "ÿ",
    "code": 255,
    "printable": false
  },
  "color": {
    "hex": "#0000FF",
    "valid": true
  },
  "ipv4": {
    "address": "0.0.0.255",
    "type": "broadcast"
  },
  "fileSize": {
    "bytes": 255,
    "kb": 0.25,
    "mb": 0.00024,
    "human": "255 bytes"
  },
  "timestamp": {
    "datetime": "1970-01-01 00:04:15",
    "duration": "4m 15s"
  },
  "percentage": {
    "of255": 100
  }
}
```

## Error Handling

- Invalid input: Show error in input field border
- Out of range: Show "N/A" for interpretations that don't apply
- Negative numbers: Handle two's complement display

## Success Criteria

1. ✅ 3-column compact layout with no wasted space
2. ✅ All number bases shown (binary, decimal, hex, octal)
3. ✅ Bit breakdown with decimal values (128, 64, 32, etc.)
4. ✅ Byte representation (4-byte view)
5. ✅ ASCII character display
6. ✅ Color preview (for 0-255 values)
7. ✅ IPv4 address interpretation
8. ✅ File size human-readable format
9. ✅ Unix timestamp conversion
10. ✅ Percentage of 255
11. ✅ Random number generator button
12. ✅ Copy-to-clipboard for all values

## Implementation Notes

### Files to Create/Modify

**Backend:**
- `internal/numberconverter/service.go` - Core logic (new)
- `service/numberconverter.go` - Wails binding (new)
- `main.go` - Register service (modify)
- `server.go` - Register for HTTP API (modify)

**Frontend:**
- `frontend/src/pages/NumberConverter/index.jsx` - Complete rewrite

### Dependencies

No new dependencies required. Use existing:
- Go standard library for conversions
- React hooks for state management
- Lucide icons for UI

## Future Considerations

- Add signed/unsigned toggle
- Support for 64-bit numbers
- Binary operations (AND, OR, XOR, shift)
- Floating point interpretation
- Little-endian option
- History of converted numbers
