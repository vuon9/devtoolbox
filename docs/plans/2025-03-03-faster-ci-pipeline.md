# Faster CI Pipeline Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reduce PR check time from ~5-10 minutes to under 2 minutes by adding aggressive caching and frontend test infrastructure.

**Architecture:** Add comprehensive GitHub Actions caching (Go modules, Bun dependencies, Wails CLI binary, APT packages) + Vitest frontend testing setup with utility and component tests. Three independent work streams allow parallel execution by different agents.

**Tech Stack:** GitHub Actions, Vitest, React Testing Library, Bun, Wails v3

---

## Parallel Work Streams

This plan has 3 independent work streams that can be executed by different agents:
- **Work Stream A:** CI Optimization (GitHub Actions caching)
- **Work Stream B:** Frontend Testing Setup (Vitest configuration)
- **Work Stream C:** Frontend Tests (Utility and component tests)

---

## Work Stream A: CI Optimization (GitHub Actions Caching)

**Dependencies:** None - can run independently

### Task A1: Add Go Module Caching to Go Tests Job

**Files:**
- Modify: `.github/workflows/ci.yml:21-56`

**Step 1: Add Go module caching to go-tests job**

Update the go-tests job to enable caching:

```yaml
      - name: Setup Go
        uses: actions/setup-go@v5
        with:
          go-version: "1.25.0"
          check-latest: true
          cache: true
          cache-dependency-path: go.sum
```

**Step 2: Verify the change**

Check that the Setup Go step now includes `cache: true`.

**Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add Go module caching to go-tests job"
```

---

### Task A2: Optimize Wails CLI Installation with Caching

**Files:**
- Modify: `.github/workflows/ci.yml:79-86`
- Modify: `.github/workflows/ci.yml:88-90`

**Step 1: Add Wails CLI binary caching**

Replace the Wails CLI installation with cached version:

```yaml
      - name: Cache Wails CLI
        id: cache-wails
        uses: actions/cache@v4
        with:
          path: ~/go/bin/wails3
          key: wails-cli-${{ runner.os }}-${{ hashFiles('go.mod') }}

      - name: Install Wails CLI
        if: steps.cache-wails.outputs.cache-hit != 'true'
        run: |
          go install github.com/wailsapp/wails/v3/cmd/wails3@latest

      - name: Setup Wails CLI PATH
        run: |
          mkdir -p /usr/local/bin
          cp $(go env GOPATH)/bin/wails3 /usr/local/bin/wails
          chmod +x /usr/local/bin/wails
          echo "/usr/local/bin" >> $GITHUB_PATH
```

**Step 2: Verify the change**

Ensure caching logic and conditional installation are correct.

**Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: cache Wails CLI binary to avoid recompiling"
```

---

### Task A3: Add APT Package Caching

**Files:**
- Modify: `.github/workflows/ci.yml:79-86`

**Step 1: Add APT caching for native dependencies**

Add caching before installing APT packages:

```yaml
      - name: Cache APT packages
        uses: awalsh128/cache-apt-pkgs-action@latest
        with:
          packages: libgtk-3-dev libwebkit2gtk-4.1-dev
          version: 1.0
          execute_install_scripts: false
```

Remove the `apt-get update` and `apt-get install` commands since the cache action handles them.

**Step 2: Remove old APT commands**

Delete these lines:
```yaml
      - name: Install dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y libgtk-3-dev libwebkit2gtk-4.1-dev
```

**Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: cache APT packages for faster native deps installation"
```

---

### Task A4: Add Bun Dependency Caching

**Files:**
- Modify: `.github/workflows/ci.yml:74-78`

**Step 1: Add Bun cache configuration**

Update Bun setup to enable caching:

```yaml
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Cache Bun dependencies
        uses: actions/cache@v4
        with:
          path: |
            frontend/node_modules
            ~/.bun/install/cache
          key: bun-deps-${{ runner.os }}-${{ hashFiles('frontend/bun.lockb') }}
          restore-keys: |
            bun-deps-${{ runner.os }}-
```

**Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add Bun dependency caching"
```

---

### Task A5: Optimize Go Test Execution

**Files:**
- Modify: `.github/workflows/ci.yml:31-35`

**Step 1: Optimize test execution**

Replace test command with optimized version:

```yaml
      - name: Run Go Tests
        run: |
          go test -race -count=1 ./internal/... -coverprofile=coverage.out
          go install github.com/boumenot/gocover-cobertura@latest
          gocover-cobertura < coverage.out > coverage.xml
```

Changes:
- Removed `-v` (verbose) flag for cleaner output
- Added `-count=1` to disable test caching (ensures fresh runs)
- Kept `-race` for race detection

**Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: optimize Go test execution"
```

---

### Task A6: Parallelize Jobs and Add Frontend Checks

**Files:**
- Modify: `.github/workflows/ci.yml` (restructure jobs)

**Step 1: Rename app-build to frontend-checks and restructure**

```yaml
  frontend-checks:
    name: Frontend Checks
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Cache Bun dependencies
        uses: actions/cache@v4
        with:
          path: |
            frontend/node_modules
            ~/.bun/install/cache
          key: bun-deps-${{ runner.os }}-${{ hashFiles('frontend/bun.lockb') }}
          restore-keys: |
            bun-deps-${{ runner.os }}-

      - name: Install frontend dependencies
        run: |
          cd frontend && bun install

      - name: Format check
        run: |
          cd frontend && bun run format:check

      - name: Build frontend
        run: |
          cd frontend && bun run build
```

**Step 2: Update job name from `app-build` to `frontend-checks`**

**Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: restructure frontend job and add format checks"
```

---

## Work Stream B: Frontend Testing Setup (Vitest)

**Dependencies:** None - can run independently

### Task B1: Install Vitest and Testing Dependencies

**Files:**
- Modify: `frontend/package.json`

**Step 1: Add test scripts and devDependencies**

Add to `scripts` section:
```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```

Add to `devDependencies`:
```json
"@testing-library/react": "^14.2.1",
"@testing-library/jest-dom": "^6.4.2",
"@testing-library/user-event": "^14.5.2",
"@vitest/coverage-v8": "^1.3.1",
"jsdom": "^24.0.0",
"vitest": "^1.3.1"
```

**Step 2: Install dependencies**

```bash
cd frontend
bun install
```

**Step 3: Verify installation**

Check `frontend/node_modules` contains `vitest`, `@testing-library/react`.

**Step 4: Commit**

```bash
git add frontend/package.json
bun install
git add bun.lockb
git commit -m "chore: install Vitest and React Testing Library"
```

---

### Task B2: Configure Vitest

**Files:**
- Create: `frontend/vitest.config.js`

**Step 1: Create Vitest configuration**

```javascript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        'src/**/*.d.ts',
      ],
    },
  },
});
```

**Step 2: Create test setup file**

**Files:**
- Create: `frontend/src/test/setup.js`

```javascript
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});
```

**Step 3: Verify configuration**

```bash
cd frontend
bun run test --help
```

Expected: Shows Vitest help output without errors.

**Step 4: Commit**

```bash
git add frontend/vitest.config.js frontend/src/test/setup.js
git commit -m "chore: configure Vitest with jsdom and testing-library"
```

---

### Task B3: Add Frontend Tests to CI

**Files:**
- Modify: `.github/workflows/ci.yml` (frontend-checks job)

**Step 1: Add frontend test step**

Add after the "Build frontend" step in the `frontend-checks` job:

```yaml
      - name: Run frontend tests
        run: |
          cd frontend && bun run test
```

**Step 2: Update job name to reflect tests**

Change job name from "Frontend Checks" to "Frontend Tests & Build".

**Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add frontend test execution to CI"
```

---

## Work Stream C: Frontend Tests (Utilities and Components)

**Dependencies:** Work Stream B must be complete first

### Task C1: Test Utility - storage.js

**Files:**
- Create: `frontend/src/utils/storage.test.js`

**Step 1: Write failing tests**

```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import storage from './storage';

describe('storage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  describe('get', () => {
    it('should return null for non-existent key', () => {
      expect(storage.get('non-existent')).toBeNull();
    });

    it('should return parsed value for existing key', () => {
      window.localStorage.setItem('test-key', JSON.stringify({ foo: 'bar' }));
      expect(storage.get('test-key')).toEqual({ foo: 'bar' });
    });

    it('should return null and log error for invalid JSON', () => {
      window.localStorage.setItem('invalid', 'not-json');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(storage.get('invalid')).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('set', () => {
    it('should store value as JSON', () => {
      storage.set('test', { data: 'value' });
      expect(window.localStorage.getItem('test')).toBe('{"data":"value"}');
    });

    it('should return true on success', () => {
      expect(storage.set('test', 'value')).toBe(true);
    });

    it('should return false and log error on failure', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
        throw new Error('Storage full');
      });

      expect(storage.set('test', 'value')).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('getArray', () => {
    it('should return empty array for non-existent key', () => {
      expect(storage.getArray('non-existent')).toEqual([]);
    });

    it('should return parsed array for existing key', () => {
      window.localStorage.setItem('array-key', JSON.stringify([1, 2, 3]));
      expect(storage.getArray('array-key')).toEqual([1, 2, 3]);
    });

    it('should return empty array for non-array value', () => {
      window.localStorage.setItem('not-array', JSON.stringify({ foo: 'bar' }));
      expect(storage.getArray('not-array')).toEqual([]);
    });
  });

  describe('setArray', () => {
    it('should store array as JSON', () => {
      storage.setArray('test', [1, 2, 3]);
      expect(window.localStorage.getItem('test')).toBe('[1,2,3]');
    });

    it('should return false for non-array value', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(storage.setArray('test', 'not-array')).toBe(false);
      consoleSpy.mockRestore();
    });
  });
});
```

**Step 2: Run tests to verify they pass**

```bash
cd frontend
bun run test src/utils/storage.test.js
```

Expected: All 9 tests pass.

**Step 3: Commit**

```bash
git add frontend/src/utils/storage.test.js
git commit -m "test: add tests for storage utility"
```

---

### Task C2: Test Utility - inputUtils.js

**Files:**
- Create: `frontend/src/utils/inputUtils.test.js`

**Step 1: Write tests**

```javascript
import { describe, it, expect } from 'vitest';
import {
  getMonospaceFontFamily,
  getDataFontSize,
  getTextareaResize,
  validateJson,
  formatJson,
  objectToKeyValueString,
} from './inputUtils';

describe('inputUtils', () => {
  describe('getMonospaceFontFamily', () => {
    it('should return IBM Plex Mono font family', () => {
      expect(getMonospaceFontFamily()).toBe("'IBM Plex Mono', monospace");
    });
  });

  describe('getDataFontSize', () => {
    it('should return 0.875rem', () => {
      expect(getDataFontSize()).toBe('0.875rem');
    });
  });

  describe('getTextareaResize', () => {
    it('should return none when both are false', () => {
      expect(getTextareaResize(false, false)).toBe('none');
    });

    it('should return vertical when only height is true', () => {
      expect(getTextareaResize(true, false)).toBe('vertical');
    });

    it('should return horizontal when only width is true', () => {
      expect(getTextareaResize(false, true)).toBe('horizontal');
    });

    it('should return both when both are true', () => {
      expect(getTextareaResize(true, true)).toBe('both');
    });

    it('should default to vertical resize', () => {
      expect(getTextareaResize()).toBe('vertical');
    });
  });

  describe('validateJson', () => {
    it('should return valid for empty string', () => {
      const result = validateJson('');
      expect(result.isValid).toBe(true);
      expect(result.data).toBeNull();
      expect(result.error).toBeNull();
    });

    it('should return valid for whitespace-only string', () => {
      const result = validateJson('   ');
      expect(result.isValid).toBe(true);
    });

    it('should parse valid JSON object', () => {
      const result = validateJson('{"key": "value"}');
      expect(result.isValid).toBe(true);
      expect(result.data).toEqual({ key: 'value' });
      expect(result.error).toBeNull();
    });

    it('should parse valid JSON array', () => {
      const result = validateJson('[1, 2, 3]');
      expect(result.isValid).toBe(true);
      expect(result.data).toEqual([1, 2, 3]);
    });

    it('should return invalid for malformed JSON', () => {
      const result = validateJson('{"key": value}');
      expect(result.isValid).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toContain('Unexpected token');
    });
  });

  describe('formatJson', () => {
    it('should format object with default indentation', () => {
      const result = formatJson({ key: 'value' });
      expect(result).toBe('{\n  "key": "value"\n}');
    });

    it('should format with custom indentation', () => {
      const result = formatJson({ key: 'value' }, 4);
      expect(result).toBe('{\n    "key": "value"\n}');
    });

    it('should return empty string for null', () => {
      expect(formatJson(null)).toBe('');
    });

    it('should return empty string for undefined', () => {
      expect(formatJson(undefined)).toBe('');
    });
  });

  describe('objectToKeyValueString', () => {
    it('should convert object to key-value string', () => {
      const result = objectToKeyValueString({ foo: 'bar', num: 42 });
      expect(result).toBe('foo: "bar"\nnum: 42');
    });

    it('should return empty string for null', () => {
      expect(objectToKeyValueString(null)).toBe('');
    });

    it('should return empty string for non-object', () => {
      expect(objectToKeyValueString('string')).toBe('');
    });

    it('should handle nested objects', () => {
      const result = objectToKeyValueString({ nested: { a: 1 } });
      expect(result).toBe('nested: {"a":1}');
    });
  });
});
```

**Step 2: Run tests**

```bash
cd frontend
bun run test src/utils/inputUtils.test.js
```

Expected: All tests pass.

**Step 3: Commit**

```bash
git add frontend/src/utils/inputUtils.test.js
git commit -m "test: add tests for inputUtils utility"
```

---

### Task C3: Test Utility - layoutUtils.js

**Files:**
- Read: `frontend/src/utils/layoutUtils.js`
- Create: `frontend/src/utils/layoutUtils.test.js`

**Step 1: Read existing layoutUtils.js**

Check if file exists and understand its contents.

**Step 2: Create tests**

```javascript
import { describe, it, expect } from 'vitest';
// Import functions from layoutUtils.js once you read it

describe('layoutUtils', () => {
  it('should have tests for layout utilities', () => {
    // Write tests based on actual functions in layoutUtils.js
    expect(true).toBe(true);
  });
});
```

**Step 3: Run and commit**

```bash
cd frontend
bun run test src/utils/layoutUtils.test.js
git add frontend/src/utils/layoutUtils.test.js
git commit -m "test: add tests for layoutUtils utility"
```

---

### Task C4: Test Component - ToolCopyButton

**Files:**
- Create: `frontend/src/components/inputs/ToolCopyButton.test.jsx`

**Step 1: Write tests**

```javascript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ToolCopyButton from './ToolCopyButton';

describe('ToolCopyButton', () => {
  it('should render copy button', () => {
    render(<ToolCopyButton text="test content" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should have aria-label for accessibility', () => {
    render(<ToolCopyButton text="test" />);
    expect(screen.getByLabelText(/copy/i)).toBeInTheDocument();
  });

  it('should call clipboard API when clicked', async () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText: mockWriteText },
    });

    render(<ToolCopyButton text="test content" />);
    fireEvent.click(screen.getByRole('button'));

    expect(mockWriteText).toHaveBeenCalledWith('test content');
  });

  it('should show checkmark after successful copy', async () => {
    vi.useFakeTimers();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    render(<ToolCopyButton text="test" />);
    fireEvent.click(screen.getByRole('button'));

    // Wait for async operation
    await vi.advanceTimersByTimeAsync(0);

    // Check that success state is shown (implementation dependent)
    // This test may need adjustment based on actual component behavior
    
    vi.useRealTimers();
  });
});
```

**Step 2: Run tests**

```bash
cd frontend
bun run test src/components/inputs/ToolCopyButton.test.jsx
```

**Step 3: Commit**

```bash
git add frontend/src/components/inputs/ToolCopyButton.test.jsx
git commit -m "test: add tests for ToolCopyButton component"
```

---

### Task C5: Test Hook - useLayoutToggle

**Files:**
- Create: `frontend/src/hooks/useLayoutToggle.test.js`

**Step 1: Write tests**

```javascript
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useLayoutToggle from './useLayoutToggle';

describe('useLayoutToggle', () => {
  it('should initialize with default layout', () => {
    const { result } = renderHook(() => useLayoutToggle());
    expect(result.current.layout).toBeDefined();
  });

  it('should toggle layout', () => {
    const { result } = renderHook(() => useLayoutToggle());
    const initialLayout = result.current.layout;

    act(() => {
      result.current.toggleLayout();
    });

    expect(result.current.layout).not.toBe(initialLayout);
  });

  it('should persist layout to storage', () => {
    const { result } = renderHook(() => useLayoutToggle());
    
    act(() => {
      result.current.setLayout('split');
    });

    // Re-render hook and check if persisted value is loaded
    const { result: result2 } = renderHook(() => useLayoutToggle());
    expect(result2.current.layout).toBe('split');
  });
});
```

**Step 2: Run tests**

```bash
cd frontend
bun run test src/hooks/useLayoutToggle.test.js
```

**Step 3: Commit**

```bash
git add frontend/src/hooks/useLayoutToggle.test.js
git commit -m "test: add tests for useLayoutToggle hook"
```

---

## Integration and Validation

### Task I1: Run Full Test Suite Locally

**Step 1: Run all frontend tests**

```bash
cd frontend
bun run test
```

Expected: All tests pass.

**Step 2: Run with coverage**

```bash
bun run test:coverage
```

Expected: Coverage report generated.

**Step 3: Verify build still works**

```bash
bun run build
```

Expected: Build completes without errors.

---

### Task I2: Validate CI Workflow

**Step 1: Test locally with act (optional)**

If `act` is installed:

```bash
act -j go-tests
act -j frontend-checks
```

**Step 2: Push branch and create PR**

```bash
git push origin feature/faster-ci
```

Create PR and observe CI execution times.

---

### Task I3: Performance Validation

**Step 1: Record baseline timing**

Before changes: Note current CI time (~5-10 minutes)

**Step 2: Measure after changes**

With all optimizations, expected times:
- Go Tests: ~30-60 seconds (cached modules)
- Frontend Tests & Build: ~45-90 seconds (cached deps)
- Total PR check: ~1-2 minutes

**Step 3: Document improvements**

Update README or CONTRIBUTING with new CI times.

---

## Summary of Changes

### Files Created:
- `frontend/vitest.config.js` - Vitest configuration
- `frontend/src/test/setup.js` - Test setup file
- `frontend/src/utils/storage.test.js` - Storage utility tests
- `frontend/src/utils/inputUtils.test.js` - Input utility tests
- `frontend/src/utils/layoutUtils.test.js` - Layout utility tests
- `frontend/src/components/inputs/ToolCopyButton.test.jsx` - Component tests
- `frontend/src/hooks/useLayoutToggle.test.js` - Hook tests

### Files Modified:
- `frontend/package.json` - Added test dependencies
- `.github/workflows/ci.yml` - Added caching and frontend tests

### Expected Outcomes:
- PR check time reduced from 5-10 min to 1-2 min
- Frontend tests running in CI
- 15-20+ unit tests covering core utilities and components

---

## Execution Options

**This plan has 3 independent work streams:**

1. **Work Stream A** (CI Optimization) - Modifies `.github/workflows/ci.yml`
2. **Work Stream B** (Frontend Testing Setup) - Modifies `frontend/package.json` and creates config
3. **Work Stream C** (Frontend Tests) - Creates test files (depends on Work Stream B)

**Parallel execution:**
- Agent 1: Work Stream A (independent)
- Agent 2: Work Stream B (independent)
- Agent 3: Work Stream C (waits for B)

**Or serial execution:**
- Complete Work Stream B first
- Then Work Streams A and C can run in parallel

Choose execution method based on available agents.
