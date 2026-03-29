# DateTime Converter Design Specification

## Overview

A comprehensive datetime conversion tool that handles multiple input formats (timestamps, ISO dates, common formats), converts between timezones, and maintains a list of favorite timezones for quick reference.

## Layout (2 Columns)

### Left Column (Stacked)

1. **Input Section** (top)
   - Single text input accepting any format
   - Format recognition badge showing what was detected
   - Examples: "Unix Timestamp (seconds)", "ISO 8601 Date", "RFC 2822"

2. **Conversion Results** (middle)
   - Table showing all format outputs:
     - Timestamp (seconds)
     - Timestamp (milliseconds)
     - ISO 8601
     - Local Time (with timezone)
     - UTC
   - Each row has copy button

3. **Timezone Converter** (bottom)
   - "From" timezone selector (favorites at top, marked with ★)
   - "To" timezone selector (favorites at top, marked with ★)
   - "Add to favorites" button on target timezone
   - Converted result display with full timezone info

### Right Column

- **Your Favorite Timezones**
  - Live world clock showing current time in each favorite timezone
  - Cards display: City name, IANA identifier, current time, GMT offset
  - Remove button (×) on each card
  - Updates in real-time

## Features

### Smart Input Detection

Auto-detects input format:

- **Integers**: Detect seconds vs milliseconds based on magnitude (> 1 billion = seconds)
- **ISO 8601**: "2024-03-15T10:30:00Z", "2024-03-15T10:30:00+07:00"
- **RFC 2822**: "Fri, 15 Mar 2024 10:30:00 GMT"
- **Common formats**:
  - "Mar 15, 2024 10:30 AM"
  - "15/03/2024 10:30"
  - "2024-03-15"

### Timezone Management

- Favorites stored in localStorage (`datetime-favorite-timezones`)
- IANA timezone identifiers (America/New_York, Asia/Ho_Chi_Minh, etc.)
- Backend provides timezone data via API with autocomplete search
- Search by: city name, country, IANA identifier, GMT offset

### Visual Design

- Dark theme matching ColorConverter (#09090b background, #18181b containers)
- External labels (outside containers) in uppercase, 11px, #71717a
- Format badge in blue (#3b82f6) showing detected type
- Input boxes: 70px wide for numeric values
- Copy buttons on all format outputs

## Backend Requirements

### API Endpoints

1. `GET /api/timezones` - List all available timezones
   - Returns: Array of { id: string, city: string, region: string, offset: string }
   - Supports query parameter `?search=` for autocomplete

2. `POST /api/datetime/convert` - Convert input to various formats
   - Body: { input: string, timezone?: string }
   - Returns: { seconds: number, milliseconds: number, iso: string, local: string, utc: string, format: string }

3. `POST /api/datetime/timezone-convert` - Convert between timezones
   - Body: { timestamp: number, from: string, to: string }
   - Returns: { converted: string, timezone: string, offset: string }

## State Management

```javascript
const [input, setInput] = useState("");
const [detectedFormat, setDetectedFormat] = useState("");
const [conversionResults, setConversionResults] = useState(null);
const [favoriteTimezones, setFavoriteTimezones] = useLocalStorage(
  "datetime-favorite-timezones",
  [],
);
const [fromTimezone, setFromTimezone] = useState("local");
const [toTimezone, setToTimezone] = useState("UTC");
const [timezoneConversion, setTimezoneConversion] = useState(null);
```

## Implementation Notes

- Use native `Intl.DateTimeFormat` for timezone conversions where possible
- Backend provides authoritative timezone list from IANA database
- Real-time clock updates via `setInterval` (every minute)
- Copy-to-clipboard using `navigator.clipboard.writeText()`
- Responsive layout: stack columns on mobile (< 1200px)
