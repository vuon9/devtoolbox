# Sidebar Tailwind/Radix Styling Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all sidebar styling issues to match the target design: darker background, gradient logo, search icon, re-enabled Quick Access, category icons, active state accents.

**Architecture:** Modify Sidebar.jsx component with Tailwind classes, no new components needed. Use existing Lucide icons and Tailwind zinc/blue palette.

**Tech Stack:** React, Tailwind CSS 4.0, Lucide React icons

---

## File Structure

| File | Action | Description |
|------|--------|-------------|
| `frontend/src/components/Sidebar.jsx` | Modify | All styling changes in one file |
| `frontend/src/components/ui/input.jsx` | Modify | Add icon prefix support (optional refactor) |

---

## Task 1: Fix Sidebar Container Background

**Files:**
- Modify: `frontend/src/components/Sidebar.jsx`

- [ ] **Step 1: Update sidebar container classes**

Replace the `aside` element's className to use darker background:

```jsx
// Before:
<aside className="w-64 border-r border-border bg-card/50 backdrop-blur-sm flex flex-col h-full transition-all duration-300">

// After:
<aside className="w-64 border-r border-zinc-800 bg-zinc-900/95 flex flex-col h-full transition-all duration-300">
```

This changes:
- `bg-card/50` → `bg-zinc-900/95` (darker sidebar)
- `border-border` → `border-zinc-800` (slightly darker border)
- Removes `backdrop-blur-sm` (not needed)

- [ ] **Step 2: Verify in browser**

Run: `bun run dev` (if not running)
Open: http://localhost:3000
Expected: Sidebar has darker background, clearly separated from main content

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/Sidebar.jsx
git commit -m "style(sidebar): use darker background for sidebar container"
```

---

## Task 2: Fix Logo Header Styling

**Files:**
- Modify: `frontend/src/components/Sidebar.jsx`

- [ ] **Step 1: Update logo container classes**

Replace the logo header div (inside the "Header & Search" section):

```jsx
// Before:
<div className="flex items-center gap-2 px-1">
  <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
     <Box className="h-4 w-4 text-primary-foreground" />
  </div>
  <span className="font-bold text-lg tracking-tight">DevToolbox</span>
</div>

// After:
<div className="flex items-center gap-2.5 px-4 py-3">
  <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
    <Box className="h-4 w-4 text-white" />
  </div>
  <span className="font-bold text-lg text-zinc-100 tracking-tight">DevToolbox</span>
</div>
```

Changes:
- Outer: `gap-2 px-1` → `gap-2.5 px-4 py-3` (more padding)
- Logo: `h-6 w-6 rounded-md bg-primary` → `h-7 w-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm`
- Icon: `text-primary-foreground` → `text-white`
- Text: Added `text-zinc-100` for clarity

- [ ] **Step 2: Verify in browser**

Expected: Logo has blue gradient background, subtle shadow, larger size, rounded corners

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/Sidebar.jsx
git commit -m "style(sidebar): add gradient and shadow to logo"
```

---

## Task 3: Fix Search Input Styling

**Files:**
- Modify: `frontend/src/components/Sidebar.jsx`

- [ ] **Step 1: Update search container and input classes**

Replace the search section:

```jsx
// Before:
<div className="relative">
  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
  <Input 
    placeholder="Search tools..." 
    className="pl-9 bg-background/50"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />
</div>

// After:
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
  <Input
    placeholder="Search tools..."
    className="pl-9 bg-zinc-800/50 border-zinc-700 text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-zinc-600"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />
</div>
```

Changes:
- Icon: `left-2.5 top-2.5` → `left-3 top-1/2 -translate-y-1/2` (proper vertical centering)
- Icon color: `text-muted-foreground` → `text-zinc-500`
- Input bg: `bg-background/50` → `bg-zinc-800/50`
- Border: Added `border-zinc-700`
- Text: Added `text-zinc-200`
- Placeholder: Added `placeholder:text-zinc-500`
- Focus ring: Added `focus-visible:ring-zinc-600`

- [ ] **Step 2: Remove unused space-y-4 from header container**

Update the header container div:

```jsx
// Before:
<div className="p-4 space-y-4">

// After:
<div className="px-4 pb-3">
```

This removes the vertical spacing between logo and search since they now have proper padding.

- [ ] **Step 3: Verify in browser**

Expected: Search input has icon on left, darker background, visible border, proper spacing

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/Sidebar.jsx
git commit -m "style(sidebar): improve search input styling with icon prefix"
```

---

## Task 4: Re-enable Quick Access Section

**Files:**
- Modify: `frontend/src/components/Sidebar.jsx`

- [ ] **Step 1: Uncomment and update Quick Access section**

Find the commented-out Quick Access section and replace it with:

```jsx
{/* Quick Access */}
{!searchQuery && (
  <div className="px-1 mb-3">
    <NavLink
      to="/tool/text-converter"
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-400 rounded-md',
          'hover:bg-zinc-800/80 hover:text-zinc-200'
        )
      }
    >
      <History className="h-4 w-4 shrink-0 opacity-70" />
      <span>Recent</span>
    </NavLink>

    {favoriteTools.length > 0 && (
      <>
        <div className="h-px bg-zinc-800 my-2 mx-3" />
        <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          <Star className="h-3.5 w-3.5" />
          <span>Favorites</span>
        </div>
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

{/* Divider between Quick Access and Categories */}
{!searchQuery && <div className="h-px bg-zinc-800 mx-4 my-2" />}
```

Note: `History` and `Star` are already imported at the top of the file.

- [ ] **Step 2: Verify in browser**

Expected: "Recent" link appears below search. If favorites exist in localStorage, they appear with a "Favorites" header.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/Sidebar.jsx
git commit -m "feat(sidebar): re-enable Quick Access section with Recent and Favorites"
```

---

## Task 5: Fix SidebarHeader Component

**Files:**
- Modify: `frontend/src/components/Sidebar.jsx`

- [ ] **Step 1: Update SidebarHeader styling**

Replace the SidebarHeader function:

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

Changes:
- Gap: `gap-2` → `gap-1.5`
- Padding: `px-3 py-2` (same)
- Margin: `mt-4 mb-1` → `mt-3 mb-1`
- Text size: `text-xs` → `text-[11px]` (smaller)
- Color: `text-muted-foreground/80` → `text-zinc-500`

- [ ] **Step 2: Verify in browser**

Expected: Category headers have proper spacing and color

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/Sidebar.jsx
git commit -m "style(sidebar): improve category header styling"
```

---

## Task 6: Fix SidebarItem Active State

**Files:**
- Modify: `frontend/src/components/Sidebar.jsx`

- [ ] **Step 1: Update SidebarItem for active and hover states**

Replace the SidebarItem function:

```jsx
function SidebarItem({ to, icon: Icon, label, onClick, disabled }) {
  if (disabled) {
    return (
      <div
        className={cn(
          'flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-600 cursor-not-allowed'
        )}
      >
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
            ? 'bg-zinc-800 text-zinc-100 border-l-2 border-blue-500 pl-[10px]'
            : 'text-zinc-400'
        )
      }
    >
      {Icon && <Icon className="h-4 w-4 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />}
      <span className="truncate">{label}</span>
    </NavLink>
  );
}
```

Changes for active state:
- Background: `bg-accent` → `bg-zinc-800`
- Text: `text-accent-foreground` → `text-zinc-100`
- Added: `border-l-2 border-blue-500` (left accent bar)
- Adjusted padding: `pl-[10px]` to account for border

Changes for inactive state:
- Text: `text-muted-foreground` → `text-zinc-400`

Changes for hover:
- `hover:bg-accent hover:text-accent-foreground` → `hover:bg-zinc-800/80 hover:text-zinc-100`

Changes for disabled:
- Container: `text-muted-foreground/40` → `text-zinc-600`
- Label: Removed `font-medium`
- Badge: `text-muted-foreground/30` → `text-zinc-700`

- [ ] **Step 2: Verify in browser**

Expected: Active item has blue left border, clear visual distinction

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/Sidebar.jsx
git commit -m "style(sidebar): add blue left border accent for active nav item"
```

---

## Task 7: Fix Footer/Settings Section

**Files:**
- Modify: `frontend/src/components/Sidebar.jsx`

- [ ] **Step 1: Update settings button styling**

Replace the footer section:

```jsx
// Before:
<div className="p-3 border-t border-border mt-auto">
  <button
    onClick={onOpenSettings}
    className={cn(
      'flex w-full items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground transition-colors',
      'hover:bg-accent hover:text-foreground'
    )}
  >
    <Settings className="h-4 w-4 shrink-0" />
    <span>Settings</span>
  </button>
</div>

// After:
<div className="p-3 border-t border-zinc-800">
  <button
    onClick={onOpenSettings}
    className={cn(
      'flex w-full items-center gap-2.5 px-3 py-2 text-sm text-zinc-400 rounded-md',
      'hover:bg-zinc-800 hover:text-zinc-200'
    )}
  >
    <Settings className="h-4 w-4 shrink-0 opacity-70" />
    <span>Settings</span>
  </button>
</div>
```

Changes:
- Container border: `border-border` → `border-zinc-800`
- Removed `mt-auto` (not needed)
- Button gap: `gap-2` → `gap-2.5`
- Button text: Removed `font-medium`
- Button color: `text-muted-foreground` → `text-zinc-400`
- Hover: `hover:bg-accent hover:text-foreground` → `hover:bg-zinc-800 hover:text-zinc-200`
- Icon: Added `opacity-70`

- [ ] **Step 2: Verify in browser**

Expected: Settings button matches sidebar styling, consistent hover behavior

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/Sidebar.jsx
git commit -m "style(sidebar): fix settings button styling"
```

---

## Task 8: Update ScrollArea and Category Container

**Files:**
- Modify: `frontend/src/components/Sidebar.jsx`

- [ ] **Step 1: Update ScrollArea container classes**

Find the ScrollArea and update its parent container:

```jsx
// Before:
<ScrollArea className="flex-1 px-3">
  <div className="pb-6">

// After:
<ScrollArea className="flex-1">
  <div className="px-3 pb-6">
```

This moves the horizontal padding to the inner div for consistent spacing.

- [ ] **Step 2: Update category container classes**

Find the category mapping and update:

```jsx
// Before:
{categories.map(category => (
  <div key={category} className="mt-2">
    <SidebarHeader title={category} icon={CATEGORY_ICONS[category]} />
    <div className="space-y-0.5">

// After:
{categories.map(category => (
  <div key={category} className="mt-1">
    <SidebarHeader title={category} icon={CATEGORY_ICONS[category]} />
    <div className="space-y-0.5">
```

Reduced top margin from `mt-2` to `mt-1` for tighter spacing.

- [ ] **Step 3: Verify in browser**

Expected: Consistent spacing throughout sidebar

- [ ] **Step 4: Final commit**

```bash
git add frontend/src/components/Sidebar.jsx
git commit -m "style(sidebar): finalize spacing and container classes"
```

---

## Task 9: Final Verification

- [ ] **Step 1: Full visual verification in browser**

Open: http://localhost:3000
Check:
- [ ] Sidebar has darker background (`bg-zinc-900/95`)
- [ ] Logo has gradient background with shadow
- [ ] Search input has icon prefix and proper styling
- [ ] Quick Access section shows "Recent" and "Favorites" (if any favorites exist)
- [ ] Category headers have icons
- [ ] Active nav item has blue left border accent
- [ ] Hover states work on all interactive elements
- [ ] Settings button matches sidebar styling
- [ ] No Carbon Design classes visible (no `cds--` classes)

- [ ] **Step 2: Test responsive behavior**

- Resize browser window
- Verify sidebar doesn't break at various widths

- [ ] **Step 3: Run linting**

```bash
cd frontend && bun run format:check
```

Expected: No formatting errors

- [ ] **Step 4: Final commit (if any fixes needed)**

```bash
git add frontend/src/components/Sidebar.jsx
git commit -m "fix(sidebar): final styling adjustments"
```

---

## Summary

All changes are in `frontend/src/components/Sidebar.jsx`:
- Task 1: Darker container background
- Task 2: Gradient logo with shadow
- Task 3: Search input with icon prefix
- Task 4: Re-enable Quick Access section
- Task 5: Category header styling
- Task 6: Active state with blue left border
- Task 7: Settings button styling
- Task 8: Final spacing adjustments
- Task 9: Verification

**No new dependencies required.**
**No test file changes needed (styling only).**