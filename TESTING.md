# Wildbound verification · v0.6

## Starting point

Inspected current main at `a2bb2c6`, its CNAME-only change after the merged v0.5 implementation (`a0ac66d`, merge `31211cd`), and the preceding v0.4 commits. Ran all 43 original tests before editing. Continued those modules rather than rebuilding. Original Plateau geometry, eight shrine rooms and the legacy platformer remain; the southern corridor now opens into new terrain after the old boundary.

## Simulation

Run `npm test` with Node 22+. **53 tests pass** (43 retained regressions plus 10 expansion scenarios).

- An additional flood-fill uses actual `move` calls from the open southern descent to verify every expansion object can be approached, including the new elevated cairn. The old reachability test still covers every original Plateau object with the gate locked; new gated objects have their own open-gate traversal test.
- Seamless region entry/return, discovery once, widened corridor and safe travel points.
- NPC proximity, acceptance, prerequisite quests, objective progress, consuming turn-ins, one-time rewards and discoveries before acceptance.
- Merchant funds/stock limits, buying/selling, equipped-item restrictions and transaction persistence.
- Atomic recipe consumption, meal healing/stamina bounds, cooking quest progress, and no consumption at full vitals.
- Gear sword damage, heavy-hit mitigation, bramble protection, stamina cost effects and blade condition.
- Expanded rest/travel/death/shrine reload coexisting with bag, crowns and blessing upgrades.
- Exact v0.5 fixture migration including an active shrine, equipment, upgrades, treasures and progression; read-only load, backup retention, once-only token conversion and invalid expansion-state recovery.

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

Open `/tests/expansion-ui.html?run`: **26 checks pass** against the actual game entry point using isolated saves. NPC use, quest acceptance/turn-in/follow-up, shop purchases and stock, equipment and sale restrictions, cooking/eating, persistence across reloads, discovered landmarks on both floors, new fast travel, Escape and synthetic touch USE. Journal fit and 44-pixel action targets are checked at 1024×768, 768×1024, 390×844 and 844×390. Scene buttons allow visual inspection; `?preview&scene=mara`, `glass-bell`, or `survey-cairn` provide clean fixture previews.

Relative production imports and entry assets use `v=0.6.0`. No runtime dependencies, build requirement or external media were added. Original Great Plateau geometry and `legacy/` remain, with expanded outdoor bounds and the southern corridor connected onward. The 60 Hz fixed step, capped catch-up and 2× pixel ratio remain. Outdoor enemies pause while indoors; rooms have at most one moving crate, two waters or two targets. Effects expire and are not serialized.

Carrying now slows movement to 85 units/second and disables sprint so the 110-unit/second block can keep up. Tether still uses solid actor/terrain collision; turn gradually and release to refill stamina. The room reset and exit controls provide recovery from misplaced blocks.

Physical iPad Safari, real concurrent touches, safe-area/browser-toolbar resizing and sustained hardware frame rate still require a device session. Desktop rendering and synthetic input tests do not establish those guarantees. GitHub Pages deployment is not established by local verification; serve the root on main after merging the change.
