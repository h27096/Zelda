# Verification · v0.5

## Starting point

Inspected clean main at `0568a9d`, the merged v0.4 implementation (`6e7e8e1`), repository history, current modules and tests. The v0.3/v0.2 world geometry and legacy platformer are unchanged. Shrine alcove expectations were replaced with actual room traversal; existing combat and engine tests remain in place.

## Simulation

Run `npm test` with Node 22+. **43 tests pass**.

- All original movement, diagonal speed, collider, anti-tunneling, stairs/rails, bridge/underpass, depth sorting, camera and world reachability regressions.
- Existing sword timing/combo, guard direction, stamina, hurt frames, enemy windup/recovery, bow release/cancellation, floor-separated projectiles and all four tool checks.
- Full Plateau guide → tower → eight solved shrine rooms → four seals → temple → unlocked descent → return and save/load.
- Every shrine solved and replayed through movement and actual v0.4 tool activation. `tests/helpers/shrine-play.js` supplies deterministic input routes; it never assigns completion flags or crate positions. Facing is selected directly for deterministic aim between movement segments.
- Walls, outer boundaries, closed doors, water, early altar attempts, shared-pulse requirement, Stillmark expiry, moving weight alone failing to open a door, reward duplication and outdoor enemy isolation.
- Room checkpoint reload/death/reset, effect clearing, safe upper-floor return, retained cache rewards and seals, upgraded healing/regen/death, bounded blessing spending and upgrade persistence.
- Discovered-only travel, threat/shrine restrictions, safe destination/checkpoint placement and effect cleanup.
- Schema 2/3/4 migration, original backup retention, legacy keys, schema 5 roundtrip, malformed equipment/progress/location rejection and corrupt-primary recovery.

## Browser

Serve with `npm run serve` and open `/tests/browser.html`: **78 checks pass** in the desktop in-app Chromium browser. These exercise keyboard aliases, simultaneous joystick/sword, pointer cancellation/capture loss, bow cancellation versus release, guard, tool selection, sprint and menu input; the outdoor renderer; all eight shrine rooms at 1024×768, 768×1024, 390×844 and 844×390; complete shrine input replays; map rendering and isolated storage. Synthetic pointers stub capture only; this is not physical multitouch evidence.

Open `/tests/ui.html?run`: **18 checks pass** against the actual game entry point with isolated in-memory saves. Covers journal button/Escape/M, playable shrine entry, no unearned seal, room help, disabled indoor travel, reset, reload checkpoint, upper-floor exit, temple unlock, both upgrades, safe fast travel, manual save, nine-heart portrait HUD and touch action bounds.

The real game iframe was visually inspected in landscape and 390×844 portrait. The shrine camera centers rooms horizontally on wide screens and tracks within their bounds on narrow screens. The portrait HUD uses two explicit rows to keep maximum hearts and buttons clear of the objective.

## Compatibility and remaining device checks

Relative production imports and entry assets use `v=0.5.0`. No runtime dependencies, build requirement or external media were added. Great Plateau world geometry and `legacy/` are unchanged. The 60 Hz fixed step, capped catch-up and 2× pixel ratio remain. Outdoor enemies pause while indoors; rooms have at most one moving crate, two waters or two targets. Effects expire and are not serialized.

Carrying now slows movement to 85 units/second and disables sprint so the 110-unit/second block can keep up. Tether still uses solid actor/terrain collision; turn gradually and release to refill stamina. The room reset and exit controls provide recovery from misplaced blocks.

Physical iPad Safari, real concurrent touches, safe-area/browser-toolbar resizing and sustained hardware frame rate still require a device session. Desktop rendering and synthetic input tests do not establish those guarantees. GitHub Pages deployment is not established by local verification; serve the root on main after merging the change.
