# Unix Time Converter - Enhanced Requirements & Mockup

## Overview
Complete redesign of the Unix Time Converter to be a comprehensive time utility tool with 14+ advanced features.

---

## 🎨 Visual Mockup

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🕐 Unix Time Converter                                              [≡≡] │
│  Convert, calculate, and manipulate timestamps with advanced utilities      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ MODE: [Timestamp Converter ▼]  [Time Calculator ▼]  [Batch Mode ▼] │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════   │
│  PRIMARY INPUT                                                             │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Unix Timestamp / Date String                          [🕐 Now]      │   │
│  │ 1738412345                                                    [📋] │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ [▶ Timestamp: Seconds ▼]    [▶ Source: Local Time ▼]                │   │
│  │                                     UTC-05:00 (EST)                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════   │
│  QUICK PRESETS (Click to Insert)                                          │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│  ┌─────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐   │
│  │   Now   │ +1 Hour │Tomorrow │Next Week│Start of │End of   │ Unix    │   │
│  │         │         │ 9am     │ Mon 9am │  Day    │  Day    │ Epoch   │   │
│  └─────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘   │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════   │
│  OUTPUT FORMATS                                                            │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐      │
│  │ ISO 8601     │ │ RFC 2822     │ │ SQL          │ │ Custom       │      │
│  │ YYYY-MM-DD.. │ │ ddd, DD MMM..│ │ YYYY-MM-DD.. │ │ [Format...]  │      │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘      │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════   │
│  CONVERSION OUTPUTS                                                        │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│  ┌────────────────────────────────────┐ ┌────────────────────────────────┐ │
│  │ 🌍 UTC Time (ISO 8601)             │ │ 📅 Local Time (EST)           │ │
│  │ 2026-02-01T12:24:05.000Z    [📋]  │ │ 2026-02-01 07:24:05           │ │
│  │                                    │ │ AM/PM: 07:24:05 AM            │ │
│  │                                    │ │                               │ │
│  │                                    │ │ Unix: 1738412345              │ │
│  │                                    │ │ Millis: 1738412345000         │ │
│  │                                    │ │ Nanos: 1738412345000000000    │ │
│  │                                    │ │                               │ │
│  └────────────────────────────────────┘ └────────────────────────────────┘ │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ⏱️ RELATIVE TIME                                                    │   │
│  │                                                                     │   │
│  │ 2 days, 5 hours, 30 minutes ago                                     │   │
│  │                                                                     │   │
│  │ Breakdown:  56 hours  │  3,390 minutes  │  203,400 seconds          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════   │
│  TIME CALCULATOR (Optional Section - Collapsible)                         │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│  ┌─────────────────────────────────────┐  ┌─────────────────────────────┐  │
│  │ Date A: 2026-02-01 12:00:00  [📋]  │  │ [+] 3 days                  │  │
│  │                                     │  │ [-] 2 hours                 │  │
│  │ Date B: 2026-02-05 09:30:00  [📋]  │  │ [+] 30 minutes              │  │
│  └─────────────────────────────────────┘  └─────────────────────────────┘  │
│                                                                             │
│  Difference: 3 days, 21 hours, 30 minutes (93.5 hours total)               │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════   │
│  TIMEZONE COMPARISON                                                       │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐   │
│  │   Tokyo     │   London    │   New York  │   India     │  Sydney     │   │
│  │   JST+9     │   GMT+0     │   EST-5     │   IST+5:30  │  AEST+10    │   │
│  ├─────────────┼─────────────┼─────────────┼─────────────┼─────────────┤   │
│  │ Feb 2 02:24 │ Feb 1 12:24 │ Feb 1 07:24 │ Feb 1 17:54 │ Feb 1 23:24 │   │
│  └─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘   │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════   │
│  VISUAL WIDGETS (Optional - Toggleable)                                   │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│  ┌─────────────┐     ┌───────────────────────────────────────────────┐     │
│  │    [📅]     │     │                12:24:05                       │     │
│  │  February   │     │            ┌───────────────┐                  │     │
│  │   2026      │     │           /    12         \                 │     │
│  │  ┌───────┐  │     │          /  ┌───┐   ┌───┐  \                │     │
│  │  │       │  │     │         │   │   │   │   │   │               │     │
│  │  │   1   │  │     │         │   │   │   │   │   │               │     │
│  │  │       │  │     │          \  └───┘   └───┘  /                │     │
│  │  └───────┘  │     │           \    24    05   /                 │     │
│  └─────────────┘     │            └───────────────┘                  │     │
│                      │                                               │     │
│                      └───────────────────────────────────────────────┘     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Feature Requirements

### Core Features

#### 1. **Timestamp Precision Support**
- **Seconds** (10 digits): `1738412345`
- **Milliseconds** (13 digits): `1738412345000`
- **Microseconds** (16 digits): `1738412345000000`
- **Nanoseconds** (19 digits): `1738412345000000000`
- Auto-detect precision from input length
- Toggle button to switch display precision

#### 2. **Quick Presets Panel**
Clickable buttons for instant insertion:
- **Now** - Current timestamp
- **Start of Today** - 00:00:00 today
- **End of Today** - 23:59:59 today
- **Yesterday** - Same time yesterday
- **Tomorrow** - Same time tomorrow
- **Next Monday 9am** - Coming Monday at 9:00 AM
- **Start of Week** - Monday 00:00:00
- **End of Week** - Sunday 23:59:59
- **Unix Epoch** - January 1, 1970 00:00:00 UTC
- **+1 Hour** - Add 1 hour to current
- **+1 Day** - Add 1 day to current
- **+1 Week** - Add 1 week to current

#### 3. **Date Arithmetic Mode**
Allow users to add/subtract time units:
- Input: Base date/timestamp
- Controls: 
  - Add/Subtract dropdown
  - Value input (number)
  - Unit selector (seconds, minutes, hours, days, weeks, months, years)
- Output: Calculated result timestamp and all formats

#### 4. **Time Delta Calculator**
Compare two dates and show difference:
- Inputs: Date A and Date B (both support any format)
- Output breakdown:
  - Days, Hours, Minutes, Seconds
  - Total in each unit (e.g., "93.5 hours total")
  - Business days (optional)
- Visual timeline/gantt representation

#### 5. **Enhanced Relative Time Display**
Current: "2 hours ago"
Enhanced:
```
2 days, 5 hours, 30 minutes ago

Breakdown:
• 56 hours total
• 3,390 minutes total  
• 203,400 seconds total
• 2,354 days since epoch
```

#### 6. **Batch Conversion Mode**
- Text area input (one timestamp per line)
- Supports mixed formats (some timestamps, some date strings)
- Output: Table with columns:
  - Original Input
  - Unix Timestamp
  - ISO 8601
  - Local Time
  - Relative Time
- Export to CSV/JSON option

#### 7. **Timezone Comparison Grid**
- Show current time in multiple timezones simultaneously
- Default: Tokyo, London, New York, India, Sydney
- Customizable: Add/remove cities
- Shows offset from local (e.g., "+9 hours")
- Visual indicator for same-day vs different-day

#### 8. **Multiple Output Formats (Tabbed)**
Instead of dropdown, show tabs for quick switching:
- ISO 8601
- RFC 2822 (Email format)
- RFC 3339
- SQL DateTime
- US Format (MM/DD/YYYY)
- EU Format (DD/MM/YYYY)
- Compact (YYYYMMDD-HHmmss)
- Custom (with format builder)

**Custom Format Tokens:**
- `YYYY` - 4-digit year
- `MM` - 2-digit month
- `DD` - 2-digit day
- `HH` - 2-digit hour (24h)
- `hh` - 2-digit hour (12h)
- `mm` - 2-digit minute
- `ss` - 2-digit second
- `sss` - 3-digit millisecond
- `A` - AM/PM
- `ddd` - Short day name (Mon)
- `dddd` - Long day name (Monday)
- `ZZ` - Timezone offset (-0500)

#### 9. **Copy Actions**
- Copy button on every output field
- "Copy All" button - copies all formats as JSON or CSV
- "Copy Share Link" - generates URL with timestamp parameter

#### 10. **History & Recent**
- Store last 20 conversions
- Persist in localStorage
- Quick re-call from dropdown
- Clear history option

#### 11. **Visual Calendar Widget**
- Mini calendar showing selected date
- Highlight selected day
- Click to pick different date
- Month/year navigation

#### 12. **Analog Clock Widget**
- Visual clock face showing selected time
- Hour, minute, second hands
- AM/PM indicator
- Optional: Digital display below

#### 13. **Smart Input Detection**
Auto-detect input type:
- Pure number → Unix timestamp
- Contains `/` or `-` → Date string
- Contains `:` → Time string
- Contains `T` or `Z` → ISO format
- Shows detected type as tag

#### 14. **URL Share Support**
- Read timestamp from URL parameter: `?ts=1738412345`
- Generate shareable links
- Copy link button

---

## 🎯 UI/UX Specifications

### Layout Structure

```
ToolContainer (flex column)
├── ToolHeader (title + description)
├── ModeSelector (tabs: Converter | Calculator | Batch)
├── PrimaryControls
│   ├── InputSection
│   │   ├── TimestampInput + NowButton
│   │   ├── PrecisionToggle (s/ms/μs/ns)
│   │   └── SourceTimezone
│   └── QuickPresets (horizontal scrollable row of chips)
├── OutputFormatTabs (format selection)
├── MainWorkspace (split pane)
│   ├── LeftPane: PrimaryOutputs
│   │   ├── UTCTime (ISO format)
│   │   ├── LocalTime (with timezone)
│   │   └── AllPrecisions (s, ms, μs, ns)
│   └── RightPane: SecondaryOutputs
│       ├── RelativeTime (detailed)
│       ├── TimezoneGrid
│       └── VisualWidgets (calendar + clock)
└── OptionalSections (collapsible)
    ├── TimeCalculator (Date A vs Date B)
    ├── BatchResultsTable
    └── HistoryList
```

### Responsive Behavior

**Horizontal Layout (default):**
- Split pane: 50/50 input/output
- Quick presets: Horizontal row
- Timezone grid: 5 columns

**Vertical Layout (toggled):**
- Stacked: Input → Presets → Output
- Quick presets: Wrap to 2 rows
- Timezone grid: 2-3 columns
- Visual widgets: Side by side or stacked

### Color Coding

- **Past dates**: Blue/gray tone
- **Future dates**: Green tone
- **Current/Now**: Orange highlight
- **Error/Invalid**: Red
- **Different day (timezone)**: Subtle background tint

### Typography

- All timestamps: `'IBM Plex Mono', monospace`
- Labels: Carbon label style (0.75rem)
- Relative time: Larger, prominent (1rem)
- Timezone offsets: Small, muted

---

## 🧪 Use Cases

### Developer Debugging
> "The log shows timestamp `1738412345000`. What time was that?"
→ Paste → See all formats instantly

### Meeting Scheduling
> "I'm in NY, they're in Tokyo. What time is 3pm their time?"
→ Use Timezone Grid to compare

### Duration Calculation
> "How long between these two server events?"
→ Use Time Calculator mode

### Data Processing
> "Convert this list of 100 timestamps to readable dates"
→ Use Batch Mode

### Quick Reference
> "What was the Unix epoch again?"
→ Click Unix Epoch preset

---

## 📱 State Management

```typescript
interface UnixTimeState {
  // Primary input
  input: string;
  detectedPrecision: 'seconds' | 'milliseconds' | 'microseconds' | 'nanoseconds';
  
  // Timezones
  sourceTimezone: string;
  targetTimezone: string;
  
  // Display settings
  outputFormat: string;
  customFormat: string;
  showVisualWidgets: boolean;
  showTimezoneGrid: boolean;
  
  // Mode
  activeMode: 'converter' | 'calculator' | 'batch';
  
  // Calculator mode
  calculator: {
    dateA: string;
    dateB: string;
    operation: 'difference' | 'add' | 'subtract';
    value: number;
    unit: TimeUnit;
  };
  
  // Batch mode
  batchInput: string;
  batchResults: BatchResult[];
  
  // History
  history: HistoryEntry[];
  
  // Layout
  direction: 'horizontal' | 'vertical';
}
```

---

## 🔧 Implementation Phases

### Phase 1: Core Enhancements
- [ ] Timestamp precision support (s/ms/μs/ns)
- [ ] Quick presets panel
- [ ] Enhanced relative time with breakdown
- [ ] Multiple output formats with tabs
- [ ] Copy buttons on all outputs

### Phase 2: Advanced Features
- [ ] Time Delta Calculator mode
- [ ] Date Arithmetic controls
- [ ] Timezone comparison grid
- [ ] Batch conversion mode
- [ ] Visual calendar widget

### Phase 3: Polish & UX
- [ ] Analog clock widget
- [ ] History persistence
- [ ] URL share support
- [ ] Smart input detection
- [ ] Comprehensive error handling

---

## 🎨 Carbon Design System Compliance

- ✅ Use `@carbon/react` components
- ✅ Theme tokens: `var(--cds-layer)`, `var(--cds-text-primary)`
- ✅ No hardcoded hex colors
- ✅ `useReducer` for state management
- ✅ `useCallback` for handlers
- ✅ Consistent spacing (0.5rem, 0.75rem, 1rem)
- ✅ Layout toggle (horizontal/vertical)
- ✅ Monospace fonts for all timestamps
- ✅ Copy buttons always visible
- ✅ ToolHeader + ToolControls + ToolPane pattern

---

*Document Version: 1.0*
*Created: 2026-02-01*
*Tool Status: Planning Phase*
