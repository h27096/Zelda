# Verification · v0.3

## Baseline inspected before editing

Cloned and ran commit `8a0efdd` (completed v0.2). All 11 engine tests and 16 browser checks passed, and the game rendered in the desktop in-app browser. The v0.2 movement/input/camera/combat/rendering architecture and original stair/bridge/underpass geometry were retained.

## Automated checks

Run `npm test` (Node 22+). **18 tests pass**, including:

- Existing diagonal speed, collision, anti-tunneling, stairs/rails, cliff, upper bridge/lower passage, depth sorting, camera, combat, checkpoint, save/backup and storage-failure checks. The old single-enemy save assertion now verifies the defeated enemy is absent while newly added enemies remain.
- A flood traversal using actual `move()` transitions: every interactive object and enemy is reachable from the start, including both upper platforms and all four shrines. No traversed state crosses the sealed descent.
- Tower prerequisite, four seals in arbitrary order, duplicate seal prevention, temple-only hand-in, exit traversal, completion persistence and return travel.
- Paused shrine simulation, partial-progress reload, upper-floor reload, checkpoint death preserving progress, guarded caches and duplicate treasure prevention.
- All ponds and the southern cliff/corridor, both directions on the new stairs.
- v0.2 migration preserving health/history, relocation around new landmarks, read-only loading, original payload backup, malformed progress rejection and recovered old backups.

## Browser checks

Serve the project and open `/tests/browser.html`. **29 checks pass** in desktop Chromium: keyboard aliases/diagonals, pointer cancellation and capture loss, simultaneous joystick + sword, blur release, Escape with button focus, four canvas sizes (1024×768, 768×1024, 390×844, 844×390), both floors, every new landmark type, four shrine seals, journal map and isolated save storage.

Open `/tests/ui.html` and click **Run acceptance checks**. **11 checks pass** against the real game entry point in an iframe: journal open/close by button and Escape, shrine entry, record/repeat seal, return, reload retaining the seal and upper floor, temple hand-in and manual save feedback. Each iframe uses its own in-memory storage; real browser game saves are never overwritten. Scenario buttons support visual inspection of the starting area, tower, temple and Ember shrine, plus portrait and landscape layouts.

## Visual/device scope

The starting sanctuary, tower, temple, shrine alcove, journal/map, persistent objective, interaction prompt and controls were inspected in desktop Chromium. The game continues using a 60 Hz fixed simulation, capped catch-up, 2× maximum pixel ratio, original entity/grass culling, visible-water culling and map rendering only when the journal opens.

A physical iPad/Safari session and sustained device frame-rate measurement were unavailable. Synthetic pointer checks and responsive views cannot guarantee real multitouch or Safari performance. On an iPad, verify landscape/portrait, safe areas, browser-toolbar resizing, simultaneous drag + sword, interrupted touch, background/resume, scrolling the journal and save/reload. After merging/deploying, repeat a smoke check on the actual GitHub Pages `/Zelda/` path.

## Release notes

Production asset URLs use `v=0.3.0` throughout to avoid mixing cached v0.2 modules with v0.3 HTML. No runtime dependency or build process was added. The legacy platformer files are unchanged. Full shrine puzzles, broader combat abilities and the region beyond the southern descent are future milestones.
