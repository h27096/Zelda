# Verification

## Automated engine checks

Run `npm test` (Node 22+). The suite verifies normalized diagonal speed, terrain/trunk/rock/water boundaries, stair ascent and descent, solid cliff edges, ramp side rails, bridge and independent underpass support, anti-tunneling movement, depth order, camera clamps, versioned save roundtrip and backup recovery, invalid-position rejection, unavailable storage, preserved legacy saves, combat persistence, death respawn and healing.

## Browser integration checks

Serve the project and open `/tests/browser.html`. The page tests the actual input/renderer modules: keyboard diagonals, overlapping keyboard aliases, blur release, pointer cancellation, joystick direction, simultaneous move + attack, lost capture, Escape with button focus, four canvas sizes (1024×768, 768×1024, 390×844, 844×390), upper-floor rendering, and persistence against isolated test storage.

These synthetic pointer tests exercise event handling, not physical iPad multitouch. The renderer size checks do not emulate Safari or validate the entire responsive UI.

## Verified in this implementation environment

- 11 engine tests pass.
- 16 browser integration checks pass in the desktop Chromium-based in-app browser.
- Main game rendered and visually inspected, including Link, terrain, trees, rock, sign, rest stone, stairs, enemy, HUD and touch controls.
- Pause opens; Escape from focused Continue resumes; manual save displays success.
- Main page console check showed no warnings or errors.
- A physical iPad/Safari session and sustained device frame-rate measurement were unavailable.

## Device acceptance pass still required

On a real iPad, check portrait/landscape, browser-toolbar resizing, safe-area spacing, drag + sword with two fingers, interrupted touch, background/resume, save/reload and private/storage-restricted browsing. On PC, walk both directions through the stairs, across and under the bridge, behind trees, into water/cliff boundaries, and defeat the enemy. Confirm upper-floor save/reload and repeat on the GitHub Pages subpath after deployment.

A live Pages upgrade check exposed cached platformer JS/CSS being reused with new HTML. Entry assets and the ES-module graph now use the same v0.2.0 query version so returning browsers fetch matching engine files. Bump this version across the graph when deploying incompatible changes.
