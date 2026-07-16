# Train.ETA — Motion & Micro-Interactions Polish

Date: 2026-07-16

## Goal

The app is functionally solid but feels static and lifeless. This pass injects
motion and micro-interactions to make it feel "alive" — without changing the
dark glassmorphism style, the app structure, or the ETA table rendering.

Scope is deliberately limited to **motion & micro-interactions only**:

- Pulsing "LIVE" indicator
- Shimmer skeleton loaders (replacing plain `Loading...` text)
- Spring transition when opening a station detail
- Tab-switch cross-fade/slide
- Tactile press feedback on list rows and nav buttons
- Staggered list reveal on tab open

## Non-goals (explicitly out of scope)

- No changes to `EtaTable.tsx` rendering or layout.
- No new hero features (trip planner, line map, countdown ticker in table).
- No new dependencies.
- No change to data fetching logic or store shape.

## Design

### 1. Pulsing LIVE dot

A small animated dot that pulses to signal real-time data.

- Added as a CSS class `.live-dot` with a `pulse` keyframe (scale + opacity loop).
- Shown in the station detail header next to the refresh button (in `StationPicker`
  where `selectedStation` is rendered), and optionally on the list header when
  data is fresh.
- Color: a calm green (`#22c55e`) to read as "live/healthy".
- Hidden under `prefers-reduced-motion`.

### 2. Shimmer skeletons

Replace the plain `Loading...` text in `EtaDisplay` (first load only) with a
shimmering skeleton card that mimics the ETA table shape.

- New component `src/components/Skeleton.tsx` exporting `EtaSkeleton`.
- Shimmer achieved with a moving gradient background (`shimmer` keyframe) on
  placeholder bars.
- Only shown on `isLoading` (initial load), NOT on background refetch, to avoid
  flicker.
- Respects `prefers-reduced-motion` (static grey bars, no movement).

### 3. Spring open transition

When a station is selected, the detail view animates in with a spring/overshoot
curve instead of the current flat fade.

- New keyframe `springIn` (translateY + slight scale, cubic-bezier overshoot).
- Applied to the detail container in `StationPicker` (`selectedStation` branch).

### 4. Tab-switch transition

Content cross-fades / slides when switching between MTR / LRT / BUS / FAV.

- New keyframe `tabIn` (fade + small translateY).
- Applied to the list container on `currentTab` change. Use `key={currentTab}`
  on the wrapper so React remounts and replays the animation.

### 5. Press feedback

- Station rows (`.station-row`) get an `:active` scale-down + background flash.
- Nav buttons already scale on `:active`; keep and refine timing.
- Implemented via CSS `:active` pseudo-class + transition (no JS state needed).

### 6. Staggered list reveal

Accordion groups fade/slide in with a slight stagger on tab open.

- Each `.glass-card` group in the list gets `animation: staggerIn` with
  `animation-delay` indexed by position (applied via inline `style` index or
  nth-child). Use a small capped stagger (e.g. 24ms × index, max ~300ms).

## Files to change

- `src/App.css` — add keyframes & utility classes: `pulse`, `shimmer`,
  `springIn`, `tabIn`, `staggerIn`, `.live-dot`, `.shimmer`, `.station-row`
  active state, `.press`.
- `src/components/Skeleton.tsx` — new `EtaSkeleton` component.
- `src/components/EtaDisplay.tsx` — use `EtaSkeleton` on initial `isLoading`.
- `src/components/StationPicker.tsx` — spring-in on detail view, LIVE dot in
  header, staggered reveal on list cards, `key={currentTab}` wrapper.
- `src/components/Header.tsx` — LIVE dot next to tab title when not loading.
- `src/components/Tabs.tsx` — refine nav `:active` press (mostly CSS).

## Accessibility

- All motion wrapped in `@media (prefers-reduced-motion: reduce)` to disable
  looping/transform animations, matching the existing pattern in `App.css`.
- No change to focus order, ARIA roles, or semantics.

## Testing

- Existing Vitest suite must keep passing (`npm run test`).
- `npm run lint` and `npm run build` must pass.
- Manual: verify reduced-motion disables animations; verify no layout shift.
