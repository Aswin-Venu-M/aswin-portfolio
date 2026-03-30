# Projects Carousel Autoplay — Design Spec

**Date:** 2026-03-31
**File:** `src/components/Projects.tsx`

## Overview

Add autoplay to the existing GSAP-powered Projects carousel. Slides advance every 4 seconds. Autoplay pauses on hover or manual interaction and resumes 2 seconds after the user stops interacting.

## Approach

`setInterval` with refs — no new state, zero extra renders. The interval always runs; on each tick it checks flags and skips rather than stopping and restarting (avoids interval-drift and multiple-interval bugs).

## Refs Added

| Ref | Type | Purpose |
|-----|------|---------|
| `isPaused` | `useRef<boolean>(false)` | Whether autoplay is currently paused |
| `isHovered` | `useRef<boolean>(false)` | Whether the mouse is currently over the container — only mutated by `onMouseEnter`/`onMouseLeave` |
| `resumeTimerRef` | `useRef<ReturnType<typeof setTimeout> \| null>(null)` | Holds the pending resume timeout for cleanup |
| `navigateRef` | `useRef<(index: number) => void>(() => {})` | Always-current reference to `navigate`, prevents stale closure in the interval |

## Stale Closure Strategy

`navigate` is a plain function defined in the component body and redefined each render. The `setInterval` (created once with `[]` deps) would hold a stale copy. Solution: update the ref unconditionally in the render body, **before any `useEffect`/`useLayoutEffect`**:

```ts
// Immediately after the navigate function definition:
navigateRef.current = navigate;
```

This assignment runs synchronously during render. Because `useEffect` callbacks only fire after the browser has painted (i.e., after the full render cycle completes), the interval — created inside a `useEffect` — cannot tick before `navigateRef.current` is populated with the current `navigate`. Moving this assignment inside a `useEffect` would recreate the stale-closure bug. Do not place it before `navigate` is declared, and do not place it inside any effect.

The interval tick calls `navigateRef.current(nextIndex)`. `handleKeyDown` and JSX event handlers are passed directly as props and always receive a fresh closure on each render — no stale-closure concern there.

`projects` is a static constant imported from `src/data/projects.ts`, so `projects.length` inside the interval is always stable.

## Autoplay Effect

A single `useEffect` with dependency array `[]` (runs once on mount).

First, check `window.matchMedia("(prefers-reduced-motion: reduce)").matches` at mount time. If `true`, return immediately — no interval is created. Dynamic OS-setting changes mid-session are out of scope. On component remount, the cleanup from the previous mount (`clearInterval` + `clearTimeout`) runs first, then a fresh `prefers-reduced-motion` check and a new interval are created — correct behavior.

Otherwise, create a `setInterval` at **4000ms**. On each tick:
1. If `isPaused.current === true` → skip.
2. If `isAnimating.current === true` → skip (existing guard prevents double-advance mid-transition).
3. Compute `nextIndex = (activeIndexRef.current + 1) % projects.length` — wraps to 0 after the last slide.
4. Call `navigateRef.current(nextIndex)`.

**Cadence when a tick is skipped:** If the interval fires while `isAnimating === true`, the tick is skipped and the next tick fires 4s later — not 4s after the animation ends. With a 0.45s transition, the minimum effective dwell time is ~3.55s. This is acceptable.

**Tab visibility:** Browsers may throttle background intervals to 1s or more in power-saving modes. Ticks are still skipped by the `isPaused`/`isAnimating` guards. The carousel silently resumes from its current position when the tab is foregrounded. No `visibilitychange` listener is added.

Cleanup on unmount: `clearInterval(intervalId)` + `clearTimeout(resumeTimerRef.current)`.

## Helper Functions

### `pauseAutoplay()`
```ts
isPaused.current = true;
clearTimeout(resumeTimerRef.current); // clearTimeout(null) is a safe no-op
resumeTimerRef.current = null;
```
Does not touch `isHovered`. Only `onMouseEnter`/`onMouseLeave` may mutate `isHovered` — `handleManualNavigate` must not.

### `scheduleResume()`
Always clears the previous timer before scheduling a new one. The timer only sets `isPaused = false` if the mouse is no longer over the container.

```ts
clearTimeout(resumeTimerRef.current);
resumeTimerRef.current = setTimeout(() => {
  if (!isHovered.current) {
    isPaused.current = false;
  }
}, 2000);
```

**Resume timing:** The 2s timer starts at the moment of the click, not after the animation ends. The existing GSAP transition is 0.45s, so after a manual click, the animation completes after ~0.45s and the autoplay resume happens ~1.55s later. This is acceptable UX.

If the 2s timer fires while `isAnimating.current === true` (only possible with rapid successive clicks), `isPaused` becomes `false` and the next interval tick (up to 4s later) handles the advance. Effective delay may be up to 4s — acceptable.

On rapid successive manual clicks, each call resets the 2s window from the last click. Intended.

## Pause & Resume Triggers

### Hover (container `onMouseEnter` / `onMouseLeave`)
Use React's `onMouseEnter`/`onMouseLeave` on the container element. These events do not bubble and do not fire when the pointer moves between sibling or child elements within the container — they fire only when the pointer crosses the container's boundary. `onMouseOver`/`onMouseOut` must not be used as they bubble and would fire spuriously on child-to-child pointer moves.

- `onMouseEnter` → `isHovered.current = true`, then `pauseAutoplay()`.
- `onMouseLeave` → `isHovered.current = false`, then `scheduleResume()`.

**Touch/mobile:** `onMouseEnter`/`onMouseLeave` do not fire on touch devices. There are no swipe/drag handlers in the current codebase. Autoplay runs uninterrupted on touch — acceptable for a portfolio site.

### Manual navigation wrapper: `handleManualNavigate(index)`
All manual call sites call `handleManualNavigate(index)` instead of `navigate(index)` directly. The existing `navigate()` already guards out-of-bounds indices (`targetIndex < 0 || targetIndex >= projects.length`) so callers need not clamp.

```ts
function handleManualNavigate(index: number) {
  pauseAutoplay();
  navigate(index);
  scheduleResume();
}
```

**Call sites updated (in-place edits to existing code):**
- Prev button `onClick`: replace `navigate(activeIndex - 1)` → `handleManualNavigate(activeIndex - 1)`
- Next button `onClick`: replace `navigate(activeIndex + 1)` → `handleManualNavigate(activeIndex + 1)`
- Dot indicator `onClick`: replace `navigate(i)` → `handleManualNavigate(i)`
- `handleKeyDown` body: replace both `navigate(activeIndex ± 1)` calls → `handleManualNavigate` equivalents

`navigate()` itself is not modified.

## Edge Cases

- **Last slide:** Autoplay resumes after ~2s and wraps to slide 0. Intended.
- **Mouse over + dot click:** `onMouseEnter` sets `isHovered = true` and pauses. `handleManualNavigate` calls `scheduleResume()`. When timer fires, `isHovered.current === true`, so `isPaused` stays `true`. Autoplay remains paused until `mouseleave`.
- **Rapid clicks:** `scheduleResume()` cancels the previous timer before creating a new one — no stacked timeouts.
- **`clearTimeout(null)`:** Safe no-op — no null-guard needed.

## Accessibility

- `prefers-reduced-motion: reduce` → autoplay fully disabled (interval never created).
- The existing `aria-live` region announces slide changes via `navigate()` — autoplay reuses the same path, so announcements are automatic.

## Constraints

- No new `useState` — all new refs only; zero extra renders.
- `setInterval` effect has `[]` dependency array — created exactly once.
- `navigate()` signature is unchanged.
- `isHovered` is exclusively mutated by `onMouseEnter`/`onMouseLeave`.
- No swipe handlers exist; if added in future they must call `handleManualNavigate` not `navigate` directly.
