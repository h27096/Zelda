# Verification · v0.4

## Baseline

Inspected and ran completed v0.3 commit `876ee0e`. All 18 existing Node tests passed before implementation, and the game rendered in the desktop browser. World, progression, bridge/underpass, both stair sets, camera, asset loader and legacy platformer are retained.

## Simulation checks

Run `npm test` with Node 22+. **33 tests pass**:

- Original movement, diagonal speed, collision, anti-tunneling, stairs/rails, elevation, separate upper/lower passage, depth ordering and camera bounds.
- Reachability traversal through actual movement for every landmark/enemy, closed descent, full tower/seals/temple/exit progression and return after completion.
- Sword windup, hit window, one hit per target, facing and combo queue; directional block, stamina limits, hurt frames, telegraphed enemy attacks/recovery/disengagement.
- Bow aim/release, finite ammo, projectile damage/expiry, walls and floor/ramp separation. Input cancellation prevents unwanted shots.
- Pulse Orb arming, area damage, player danger and floor isolation; Stillmark freeze expiry; Tether movement/collision/stamina; Frostpath crossing, occupied expiry, land-safe saves and removal after leaving.
- Death preserves progress/equipment and clears dangerous transients. Crates block melee sight lines and reset clear of saved player/checkpoint positions.
- Supply collection once, repair and resupply; schema-2/schema-3 migration, completed progress and original backups retained, schema-4 equipment roundtrip, malformed state rejection, storage failures and legacy key preservation.

Old instant-contact/instant-sword assertions now advance through intentional attack windows. Schema expectations are updated to 4.

## Browser checks

Serve with `npm run serve`; visit `/tests/browser.html`. **38 checks pass** in desktop Chromium: keyboard aliases, simultaneous joystick/sword, cancellation/capture loss, touch bow release versus cancellation, held guard, tool selection, sprint release, blur, four canvas sizes, both floors, original landmarks, journal map and isolated storage. Pointer capture is stubbed only for synthetic events; real capture needs hardware testing.

At `/tests/ui.html`, click **Run acceptance checks** (or use `?run`). **11 checks pass** against the real entry point: journal buttons/Escape, shrine entry/return, first/repeat seal, saved upper-floor reload, temple exit unlock and manual saving. The iframe uses isolated memory storage. Bounded timers avoid waiting on offscreen iframe animation frames.

The real game was visually inspected at 1024×768 and narrow portrait size. A physical iPad/Safari session and sustained frame-rate measurement were unavailable. On hardware, verify simultaneous joystick plus guard/bow, joystick sprint beyond the rim, cancelled touches, safe areas, toolbar resizing, background/resume, journal scrolling and save/reload.

## Compatibility and limits

Production imports use `v=0.4.0` and remain relative for GitHub Pages `/Zelda/`. No dependencies or build step were added. The development server accepts `PORT` (default 8000). Legacy files are unchanged. The existing fixed 60 Hz loop, capped catch-up, 2× pixel ratio and entity culling remain. Projectiles expire; only one orb and one ice crossing exist at once, with seven enemies.

Prototype crates, ice, orbs and freezes reset on reload. Saving on ice returns to a land checkpoint. A worn practice blade remains usable with a weaker finisher. No full shrine interiors, final character art or music were added. GitHub Pages deployment and physical Safari performance are not claimed by local tests.
