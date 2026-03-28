# Sidebar Tailwind/Radix Styling Fix

**Date**: 2026-03-28
**Status**: Draft
**Scope**: Frontend - Sidebar component

## Problem

The sidebar component has broken/missing styling after migrating from Carbon Design to Tailwind CSS 4.0 and Radix UI. The visual hierarchy is flat, spacing is inconsistent, and key UI elements lack polish.

## Current State vs Target

### Visual Comparison

| Element | Current | Target |
|---------|---------|--------|
| Logo | Flat white box, minimal | Gradient background, shadow, 8px radius |
| Search | No icon, light borders | Icon prefix, darker background, visible border |
| Quick Access | Commented out | Recent + Favorites links |
| Category Headers | Plain text uppercase | Icons + uppercase, proper spacing |
| Tool Items | Flat text | Icon + label, hover states |
| Active State | Subtle bg change | Colored left border accent |
| Background | `bg-card/50` (#09090b) | Darker sidebar (#262626 equivalent) |

## Design Specification

### 1. Sidebar Container

```jsx
// Before
<aside className="w-64 border-r border-border bg-card/50 backdrop-blur-sm flex flex-col h-full">

// After
<aside className="w-64 border-r border-zinc-800 bg-zinc-900/95 flex flex-col h-full">
```

- Darker background: `bg-zinc-900/95` instead of `bg-card/50`
- Slightly darker border: `border-zinc-800`
- Remove `backdrop-blur-sm` (not needed for sidebar)

### 2. Logo Header

```jsx
// Logo with gradient and shadow
<div className="flex items-center gap-2.5 px-4 py-3">
  <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
    <Box className="h-4 w-4 text-white" />
  </div>
  <span className="font-bold text-lg text-zinc-100 tracking-tight">DevToolbox</span>
</div>
```

- Gradient: `from-blue-500 to-blue-600` or brand color
- Rounded: `rounded-lg` (8px)
- Shadow: `shadow-sm` for depth
- Text: `text-zinc-100` for clarity

### 3. Search Input

```jsx
<div className="relative px-4 pb-4">
  <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
  <Input
    placeholder="Search tools..."
    className="pl-9 bg-zinc-800/50 border-zinc-700 text-zinc-200 placeholder:text-zinc-500"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />
</div>
```

- Background: `bg-zinc-800/50` (slightly transparent)
- Border: `border-zinc-700`
- Text: `text-zinc-200`
- Placeholder: `text-zinc-500`
- Icon: `text-zinc-500`, positioned with absolute + left padding

### 4. Quick Access Section

Re-enable the commented-out section:

```jsx
{/* Quick Access */}
{!searchQuery && (
  <div className="px-3 mb-2">
    <NavLink
      to="/tool/text-converter"
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 rounded-md transition-colors',
          'hover:bg-zinc-800 hover:text-zinc-200'
        )
      }
    >
      <History className="h-4 w-4 shrink-0 opacity-70" />
      <span>Recent</span>
    </NavLink>
    
    {favoriteTools.length > 0 && (
      <>
        <SidebarHeader title="Favorites" icon={Star} />
        <div className="space-y-0.5">
          {favoriteTools.map(tool => (
            <SidebarItem
              key={tool.id}
              to={`/tool/${tool.id}`}
              label={tool.name}
              icon={TOOL_ICONS[tool.id] || Box}
            />
          ))}
        </div>
      </>
    )}
  </div>
)}
```

- Recent: links to last used tool (or history if implemented)
- Favorites: shows tools marked as favorite in localStorage
- Separator: 1px divider line between Quick Access and Categories

### 5. Category Icons

Define mapping for category icons:

```jsx
const CATEGORY_ICONS = {
  Text: Type,
  Data: Binary,
  Security: ShieldCheck,
  Generator: QrCode,
  Developer: Wrench,
};
```

```jsx
function SidebarHeader({ title, icon: Icon }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2 mt-3 mb-1 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
      {Icon && <Icon className="h-3.5 w-3.5" />}
      <span>{title}</span>
    </div>
  );
}
```

- Icon size: `h-3.5 w-3.5` (14px)
- Text size: `text-[11px]`
- Color: `text-zinc-500`
- Tracking: `tracking-wider`
- Margin: `mt-3 mb-1`

### 6. Active State

```jsx
function SidebarItem({ to, icon: Icon, label, onClick, disabled }) {
  if (disabled) {
    return (
      <div className="flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-600 cursor-not-allowed">
        {Icon && <Icon className="h-4 w-4 shrink-0 opacity-40" />}
        <span className="truncate">{label}</span>
        <span className="text-[10px] uppercase tracking-wider text-zinc-700 ml-auto">
          disabled
        </span>
      </div>
    );
  }

  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-md transition-all',
          'hover:bg-zinc-800/80 hover:text-zinc-100',
          isActive
            ? 'bg-zinc-800 text-zinc-100 border-l-2 border-blue-500'
            : 'text-zinc-400'
        )
      }
    >
      {Icon && <Icon className="h-4 w-4 shrink-0 opacity-70" />}
      <span className="truncate">{label}</span>
    </NavLink>
  );
}
```

- Active: `bg-zinc-800 text-zinc-100 border-l-2 border-blue-500`
- Inactive: `text-zinc-400`
- Hover: `hover:bg-zinc-800/80 hover:text-zinc-100`
- Left border accent: `border-l-2 border-blue-500`

### 7. Complete Color Palette

```
Background:     bg-zinc-900/95    ≈ #18181b / rgba(24,24,27,0.95)
Sidebar border: border-zinc-800   ≈ #27272a
Card/Item bg:   bg-zinc-800       ≈ #27272a
Hover bg:       bg-zinc-800/80    ≈ rgba(39,39,42,0.8)
Primary accent: border-blue-500   ≈ #3b82f6

Text primary:   text-zinc-100     ≈ #f4f4f5
Text secondary: text-zinc-400     ≈ #a1a1aa
Text muted:     text-zinc-500     ≈ #71717a
Text disabled:  text-zinc-600     ≈ #52525b
```

## Files to Modify

1. **`frontend/src/components/Sidebar.jsx`** - Main component with all styling changes
2. **`frontend/src/components/ui/input.jsx`** - Ensure Input component supports icon prefix pattern

## Implementation Notes

### Category Icon Mapping

```jsx
import {
  Type,      // Text
  Binary,    // Data
  ShieldCheck, // Security
  QrCode,    // Generator
  Wrench,    // Developer
  Box,       // Default
} from 'lucide-react';
```

### Disabled Items

Currently only "Text Converter" is enabled, all others are disabled. Keep this behavior for now, but ensure disabled styling is correct with `text-zinc-600` and reduced opacity.

### Quick Access Logic

- **Recent**: For now, link to the default tool (Text Converter). Future: track and display last 3-5 used tools.
- **Favorites**: Read from `localStorage.getItem('favoriteTools')` as JSON array.

## Success Criteria

- [ ] Sidebar has darker background, visually separated from main content
- [ ] Logo has gradient background and subtle shadow
- [ ] Search input has icon prefix and proper styling
- [ ] Quick Access section (Recent + Favorites) is visible and functional
- [ ] Category headers have icons
- [ ] Active navigation item has colored left border accent
- [ ] Hover states work on all interactive elements
- [ ] Disabled items have distinct muted styling
- [ ] All colors use Tailwind zinc/blue palette (no custom hex values)

## Out of Scope

- Implementing actual "Recent" tool history tracking
- Modifying main content area styling
- Settings modal redesign
- Tool page layouts