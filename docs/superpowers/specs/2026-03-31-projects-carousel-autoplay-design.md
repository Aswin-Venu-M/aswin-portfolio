# Projects Carousel Autoplay — Design Spec

**Date:** 2026-03-31
**File:** `src/components/Projects.tsx`

## Overview

Add autoplay to the existing GSAP-powered Projects carousel. Slides advance every 4 seconds. Autoplay pauses on hover or manual interaction and resumes 2 seconds after the user stops interacting.

## Approach

`setInterval` with refs — no new state, zero extra renders.

## Refs Added

| Ref | Type | Purpose |
|-----|------|---------|
| `isPaused` | `useRef<boolean>(false)` | Tracks paused state without triggering re-renders |
| `resumeTimerRef` | `useRef<ReturnType<typeof setTimeout> \| null>(null)` | Holds pending resume timeout for cleanup |

## Autoplay Logic

A single `useEffect` (runs once on mount) creates a `setInterval` at **4000ms**.

On each tick:
1. If `isPaused.current === true` → skip.
2. If `isAnimating.current === true` → skip (existing guard).
3. Next index: `(activeIndexRef.current + 1) % projects.length` — wraps to 0 after last slide.
4. Call `navigate(nextIndex)`.

Cleanup on unmount: `clearInterval` + `clearTimeout(resumeTimerRef.current)`.

## Pause Triggers

- `mouseenter` on the carousel container → `isPaused.current = true`, clears any pending resume timer.
- Any manual `navigate()` call (prev/next, dot indicator, keyboard arrow) → same.

## Resume Triggers

- `mouseleave` on the carousel container → schedules `isPaused.current = false` after **2000ms**.
- After any manual `navigate()` call → same 2s delayed resume.

Helper `pauseAutoplay()` and `scheduleResume()` extracted internally to avoid duplication.

## Accessibility

- `prefers-reduced-motion: reduce` → interval is never created; autoplay is fully disabled.
- Existing `aria-live` region already announces slide changes on navigation — autoplay uses the same `navigate()` path, so announcements are automatic.

## Constraints

- No new `useState` — `isPaused` and `resumeTimerRef` are refs only.
- The existing `isAnimating` guard in `navigate()` naturally prevents double-advances mid-transition.
- No changes to the `navigate()` function signature — pause/resume hooks are injected via a wrapper at call sites.
