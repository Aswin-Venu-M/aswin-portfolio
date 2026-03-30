# Projects Carousel Autoplay Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 4-second autoplay to the Projects carousel that pauses on hover or manual interaction and resumes 2 seconds after the user stops interacting.

**Architecture:** A single `setInterval` (created once on mount) ticks every 4s and skips if `isPaused` or `isAnimating` refs are true. Hover and manual navigation set `isPaused = true` and schedule a deferred resume via `setTimeout`. All logic lives in `src/components/Projects.tsx` with no new files, no new state, and no changes to the `navigate()` signature.

**Tech Stack:** React 19, TypeScript, GSAP (existing). No test framework — verify via `npm run build` (TypeScript compile) and visual browser check.

---

### Task 1: Add new refs

**Files:**
- Modify: `src/components/Projects.tsx:19-29` (ref declarations block)

- [ ] **Step 1: Add the four new refs immediately after the existing ref block**

Open `src/components/Projects.tsx`. The existing refs are declared at lines ~19–29. Add the four new refs directly after `cardWrapperRefs` and `ariaLiveRef`:

```tsx
const isPaused = useRef(false);
const isHovered = useRef(false);
const resumeTimerRef = useRef<number | undefined>(undefined);
const navigateRef = useRef<(index: number) => void>(() => {});
```

`resumeTimerRef` uses `number | undefined` (not `null`) because `clearTimeout` is typed as accepting `number | undefined` in TypeScript — passing `null` causes a compile error.

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npm run build
```

Expected: build succeeds with no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/Projects.tsx
git commit -m "feat: add autoplay refs to Projects carousel"
```

---

### Task 2: Sync navigateRef after navigate definition

**Files:**
- Modify: `src/components/Projects.tsx:88` (immediately after the `navigate` function, before any `useLayoutEffect`)

- [ ] **Step 1: Add the ref sync line**

The `navigate` function ends at ~line 87. Add this line immediately after the closing brace, before the first `useLayoutEffect`:

```tsx
// Keep navigateRef current so the setInterval closure always calls the latest navigate
navigateRef.current = navigate;
```

This runs synchronously on every render — including the render triggered by `setActiveIndex` inside GSAP's `onComplete`. By the time the next interval tick fires (4s later), `navigateRef.current` points to the `navigate` from the most recent render, which closes over the latest `activeIndex` state. No stale-closure concern.

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/Projects.tsx
git commit -m "feat: sync navigateRef on every render for autoplay"
```

---

### Task 3: Add pauseAutoplay and scheduleResume helpers

**Files:**
- Modify: `src/components/Projects.tsx` (add two functions after the `navigateRef.current = navigate` line, before any `useLayoutEffect`)

- [ ] **Step 1: Add pauseAutoplay()**

```tsx
function pauseAutoplay() {
  isPaused.current = true;
  clearTimeout(resumeTimerRef.current);
  resumeTimerRef.current = undefined;
}
```

- [ ] **Step 2: Add scheduleResume()**

```tsx
function scheduleResume() {
  clearTimeout(resumeTimerRef.current);
  resumeTimerRef.current = setTimeout(() => {
    if (!isHovered.current) {
      isPaused.current = false;
    }
  }, 2000);
}
```

The `isHovered` guard prevents autoplay resuming while the mouse is still over the carousel (e.g. user clicked a dot while hovering).

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/Projects.tsx
git commit -m "feat: add pauseAutoplay and scheduleResume helpers"
```

---

### Task 4: Add handleManualNavigate wrapper

**Files:**
- Modify: `src/components/Projects.tsx` (add after `scheduleResume`, before `useLayoutEffect`)

- [ ] **Step 1: Add handleManualNavigate()**

```tsx
function handleManualNavigate(index: number) {
  pauseAutoplay();
  navigate(index);
  scheduleResume();
}
```

`navigate()` already guards out-of-bounds indices, so no clamping needed here.

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/Projects.tsx
git commit -m "feat: add handleManualNavigate wrapper for autoplay pause"
```

---

### Task 5: Wire handleManualNavigate to all manual call sites

**Files:**
- Modify: `src/components/Projects.tsx:141-145` (handleKeyDown), `src/components/Projects.tsx:204-227` (prev/next buttons), `src/components/Projects.tsx:237-248` (dot indicators)

- [ ] **Step 1: Update handleKeyDown**

Find `handleKeyDown` (~line 141). Replace:

```tsx
if (e.key === "ArrowRight") navigate(activeIndex + 1);
if (e.key === "ArrowLeft") navigate(activeIndex - 1);
```

With:

```tsx
if (e.key === "ArrowRight") handleManualNavigate(activeIndex + 1);
if (e.key === "ArrowLeft") handleManualNavigate(activeIndex - 1);
```

- [ ] **Step 2: Update Prev button onClick**

Find the Prev button (~line 206). Replace:

```tsx
onClick={() => navigate(activeIndex - 1)}
```

With:

```tsx
onClick={() => handleManualNavigate(activeIndex - 1)}
```

- [ ] **Step 3: Update Next button onClick**

Find the Next button (~line 220). Replace:

```tsx
onClick={() => navigate(activeIndex + 1)}
```

With:

```tsx
onClick={() => handleManualNavigate(activeIndex + 1)}
```

- [ ] **Step 4: Update dot indicator onClick**

Find the dot indicator buttons (~line 241). Replace:

```tsx
onClick={() => navigate(i)}
```

With:

```tsx
onClick={() => handleManualNavigate(i)}
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npm run build
```

Expected: build succeeds with no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/Projects.tsx
git commit -m "feat: route all manual navigation through handleManualNavigate"
```

---

### Task 6: Add the autoplay useEffect

**Files:**
- Modify: `src/components/Projects.tsx` (add a new `useEffect` after the existing `useLayoutEffect` cleanup block, before the `handleKeyDown` definition)

- [ ] **Step 1: Add the autoplay effect**

Add this effect after the closing `}, []);` of the main `useLayoutEffect`:

```tsx
// Autoplay: advance every 4s, skip if paused or mid-transition
useEffect(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const id = setInterval(() => {
    if (isPaused.current || isAnimating.current) return;
    const nextIndex = (activeIndexRef.current + 1) % projects.length;
    navigateRef.current(nextIndex);
  }, 4000);

  return () => {
    clearInterval(id);
    clearTimeout(resumeTimerRef.current);
  };
}, []);
```

Note: `projects`, `isPaused`, `isAnimating`, `activeIndexRef`, `navigateRef`, and `resumeTimerRef` are all stable references (module constant or refs) — no deps needed.

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/Projects.tsx
git commit -m "feat: add autoplay setInterval effect to Projects carousel"
```

---

### Task 7: Wire hover pause/resume on the carousel container

**Files:**
- Modify: `src/components/Projects.tsx:172-199` (the `containerRef` div in JSX)

- [ ] **Step 1: Add onMouseEnter and onMouseLeave to the container div**

Find the container `<div>` with `ref={containerRef}` (~line 172). It currently has `tabIndex`, `onKeyDown`, and `aria-label`. Add two more props:

```tsx
onMouseEnter={() => {
  isHovered.current = true;
  pauseAutoplay();
}}
onMouseLeave={() => {
  isHovered.current = false;
  scheduleResume();
}}
```

Use `onMouseEnter`/`onMouseLeave` (not `onMouseOver`/`onMouseOut`) — these are non-bubbling and fire only when the pointer crosses the container boundary, not on every child-to-child move.

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Browser verification**

Run `npm run dev` and open the Projects section. Verify:

- [ ] Carousel automatically advances every ~4s
- [ ] Hovering the carousel pauses it; moving the mouse away resumes it after ~2s
- [ ] Clicking Prev/Next buttons pauses and schedules a 2s resume
- [ ] Clicking dot indicators behaves the same
- [ ] Keyboard ArrowLeft/ArrowRight pauses and schedules a 2s resume
- [ ] Wraps from last slide back to first correctly
- [ ] No visible jank or double-advance

- [ ] **Step 4: Final commit**

```bash
git add src/components/Projects.tsx
git commit -m "feat: pause autoplay on hover with onMouseEnter/onMouseLeave"
```
