# Plateau Quest · v0.2 — The New Trail

A browser-based, **top-down / 2.5D Zelda fan-game prototype**, inspired by The Minish Cap's perspective and BOTW + TOTK's exploration. Designed for iPad and PC. All current art is original canvas placeholder art; no Nintendo sprites, music, or code are included.

[Play on GitHub Pages](https://h27096.github.io/Zelda/) · [Preserved platformer prototype](legacy/index.html)

## What changed

The repository was inspected before conversion. Its static ES-module setup, input/world/save separation, sword interaction, hearts, pause menu, and periodic/visibility saving concepts carry forward. Gravity, jumping, horizontal camera logic, and side-scrolling shrine layouts do not fit the revised engine. The complete previous playable build is retained under `legacy/`, including its original save key. Git history also preserves it.

The main game is intentionally a **small Great Plateau test slice**, not the completed Plateau or four shrines:

- Eight-direction movement with normalized diagonals, independent foot collisions, sliding along obstacles, and substeps to prevent tunneling.
- A following two-axis camera; feet-based Y sorting on each elevation layer.
- Grass, trees with solid trunks and overlapping canopies, rocks, signs, water, a rest stone, a raised overlook, stairs, and a bridge with an independent lower path.
- One original Bokoblin-style enemy with basic pursuit, sword damage, contact damage, and checkpoint respawn. Defeat persists.
- Simultaneous touch joystick + action buttons; keyboard controls; safe-area spacing; pause/input release when backgrounded.
- Versioned validated saves, previous-save recovery, checkpoint and enemy state, and clear storage-failure notices.
- Semantic asset/animation definitions so final art can replace placeholders around v0.6.

## Play and controls

| Action | Keyboard | iPad |
| --- | --- | --- |
| Move | WASD or arrows | Drag the left joystick |
| Sword | J, K, or Space | Sword button |
| Read sign / rest | E or Enter | Use button |
| Pause | Escape or pause button | Pause button |
| Save | Save button | Save button |

From the resting glade, follow the tan trail east and north. Climb the wide stairs onto the overlook, then walk east across the wooden bridge. Return by the stairs and approach the bridge from the south on the lower path to walk beneath it. Walk behind and in front of tree canopies to see depth sorting. Water and cliff edges block movement. Use the rest stone to heal and set your respawn point.

Cliff/ledge edges are solid in v0.2. Jumping off ledges, swimming, combat combos, and the full Plateau are future work. The elevated east bank is reached and left over the bridge.

## Run locally / GitHub Pages

No dependencies or build step are required. Serve this folder over HTTP; ES modules cannot be launched reliably by double-clicking the HTML file.

```sh
npm run serve
# Open http://127.0.0.1:8000
npm test
# Browser input/render tests: http://127.0.0.1:8000/tests/browser.html
```

The local server uses Node 22 or newer. Any ordinary static HTTP server also works. GitHub Pages can serve **main / root** directly; all imports and asset URLs are relative and work under `/Zelda/`. No external runtime, CDN, or network-loaded art is required.

## Saves

Progress autosaves every 12 active seconds, after important events, and when hidden or leaving the page. Manual save reports success/failure. Saves are local to this browser and origin; they do not sync between iPad and PC. Clearing site data removes them.

The new key is `plateau-quest-topdown`, with schema version 2 and map ID `plateau-slice`; a last valid previous save is retained at `plateau-quest-topdown-backup`. Loading validates coordinates against current collision data, floor, health, checkpoint and enemy IDs. Invalid main saves fall back to backup or a safe fresh start. Storage denial/quota errors do not crash gameplay. Death restores five hearts at the checkpoint.

The old `plateau-quest-v1` save is retained for `legacy/`; side-scroller coordinates and shrine completion are deliberately not converted into this different map. New Game requires confirmation and clears only top-down saves.

## Architecture

| Module | Responsibility |
| --- | --- |
| `src/main.js` | DOM, fixed 60 Hz simulation, lifecycle, save scheduling |
| `src/game.js` | Player, simple enemy/combat, interactions, state snapshots |
| `src/world.js` | Map objects, walkable floor support, foot collision, ramp connections |
| `src/input.js` | Keyboard/pointer ownership, joystick, edge-triggered actions |
| `src/camera.js` | Camera bounds/smoothing and deterministic depth ordering |
| `src/render.js` | Culling, terrain, lower/upper draw passes and projection |
| `src/assets.js` | Sprite-sheet loading and original placeholder fallback |
| `assets/manifest.js` | Replaceable semantic animation definitions |
| `src/save.js` | Schema validation and browser persistence |

World `(x,y)` describes the feet on a navigable plane; `level` is a discrete support/collision layer. `elevationAt` supplies visual height, including continuous stair interpolation. Lower actors draw before bridge/upper surfaces; actors on the same layer sort by foot Y. A bridge does not change an actor's floor just because it overlaps them. Only connected stairs switch floor. New regions should describe support surfaces, obstacles and transitions independently of artwork; directed ledge drops will need an explicit transition rule.

The canvas resolution is capped at 2× device pixel ratio, the simulation uses fixed steps and caps frame catch-up, and offscreen entities/grass are culled. Physical iPad Safari performance and real multitouch still need device testing; desktop browser checks do not establish an iPad frame-rate guarantee.

## Revised roadmap

See [ROADMAP.md](ROADMAP.md). v0.2 establishes the new engine; v0.3 expands the Great Plateau; v0.4 deepens combat/abilities; v0.5 adds shrines/progression; v0.6 starts replacing placeholder art and audio with the user's original work. Later versions expand Hyrule, Sky, and Depths.

See [assets/README.md](assets/README.md) for swapping art without changing gameplay, and [TESTING.md](TESTING.md) for verification and remaining device checks.
