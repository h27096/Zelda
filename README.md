# Plateau Quest · v0.3 — The Great Plateau

A browser-based top-down / 2.5D exploration prototype for iPad and PC, inspired by classic Zelda perspective and BOTW's sense of discovery. All artwork, region layouts, characters and dialogue are original placeholders. No Nintendo sprites, maps, music or dialogue are included.

[Play on GitHub Pages](https://h27096.github.io/Zelda/) · [Preserved platformer](legacy/index.html)

## The Plateau

v0.3 expands the working v0.2 engine into a 3072 × 2304 region. The original glade, stairs, upper bridge and independent underpass remain in place. Trails connect the Shrine of Resurrection starting area, Plateau Tower, Old Road Ruins, Temple of Time, Whisperwood, Reedlight Wetlands and Ember Highlands. Four ponds, two stair climbs, solid cliffs, six placeholder enemies around several camps, four treasure caches and three fruit pickups reward exploration.

The game still uses the original movement, collision, depth sorting, camera, simple combat, input and save architecture. The previous platformer remains untouched under `legacy/`.

## Your first journey

1. From the starting rest stone, meet **Rowan** to the southeast. Use E or the touch Use button nearby.
2. Follow the northern trail up the original stairs and light **Plateau Tower** on the terrace. Shrine markers appear on the journal map.
3. Visit four shrines in any order. **Windstep** sits across the upper bridge; **Reedlight** is beyond the northeast pond; **Rootsong** is deep along the western forest trail; **Embercrest** is on the southeast highland, reached by its southern stairs.
4. Enter each small sanctuary alcove, record its seal, and return to the trail. These are deliberately lightweight resting chambers; full puzzles are planned for v0.5.
5. Bring all four seals to Rowan at the **Temple of Time** in the center of the Plateau.
6. Follow the temple trail south through the opened descent. This completes v0.3. The next region is not built yet; return to explore and collect remaining treasure freely.

A persistent objective strip, nearby interaction prompt, trail signs, dialogue, and the paused **Journal** with map/checklist provide directions. The entire southern cliff is blocked except its single gated descent. Tower activation, shrine recording and the temple hand-in enforce the tutorial order. Combat and treasure are optional; guarded caches require clearing nearby enemies. Fruit and caches heal and grant collectible trail tokens, with no currency-spending system yet.

## Controls

| Action | Keyboard | iPad |
| --- | --- | --- |
| Move | WASD / arrows | Left joystick |
| Sword | J / K / Space | Sword button |
| Talk / inspect / enter shrine | E / Enter | Use button |
| Journal / pause | Escape or Journal | Journal |
| Save | Save button | Save |
| Record seal / leave alcove | Focus and activate its button; Escape returns | Alcove buttons |

Use rest stones to heal and set your checkpoint. Death restores five hearts there without losing collected seals, treasure or defeated enemies. Water and cliff edges are solid. Return from upper platforms by their stairs or bridge. Eight-direction movement, simultaneous joystick and sword, pointer cancellation, safe-area spacing and background pause are preserved.

## Run locally / GitHub Pages

No dependencies or build step are needed. Use Node 22+:

```sh
npm run serve
# http://127.0.0.1:8000
npm test
# http://127.0.0.1:8000/tests/browser.html
# http://127.0.0.1:8000/tests/ui.html
```

Any static HTTP server works. GitHub Pages can serve **main / root** directly. Imports and assets are relative, including under `/Zelda/`; all entry assets and production imports use `v=0.3.0` to avoid stale cached v0.2 files. There is no external runtime, CDN or network-loaded artwork.

## Saves and migration

The browser-local key remains `plateau-quest-topdown`, with schema **3**, map ID `great-plateau`, and backup key `plateau-quest-topdown-backup`. Saves occur every 12 active seconds, after important events, when hidden/leaving, and on manual Save. Storage failures show a notice and do not crash the game.

v0.2 schema-2 `plateau-slice` saves migrate on load. Valid positions, health, checkpoint, enemy defeats and play time carry forward; new tutorial state starts fresh. An old position now occupied by a new landmark moves safely to the starting stone. Loading does not rewrite storage. The first successful v0.3 save retains the previous valid v0.2 payload as its backup; later saves rotate the last valid payload as before. Invalid new progress, unknown IDs, inconsistent unlocks and locked-exit positions are rejected, with backup recovery or a safe fresh start.

Seals, guide/tower state, exit unlock, completion and collected item IDs persist. Reloading inside an alcove returns to its outdoor approach with recorded progress intact. New Game requires confirmation and clears only top-down saves. The old `plateau-quest-v1` platformer key is untouched. Saves are per browser/origin, do not sync across devices, and disappear if site data is cleared.

## Architecture and assets

| Module | Responsibility |
| --- | --- |
| `src/main.js` | DOM, fixed 60 Hz simulation, journal/alcove UI, lifecycle and saves |
| `src/game.js` | Player, enemies, combat, interactions, tutorial events and snapshots |
| `src/world.js` | Declarative regions, trails, landmarks, objects, floor support and collision |
| `src/progression.js` | Progress validation, objective text, journal checklist and token totals |
| `src/input.js` | Keyboard/pointer ownership, joystick and edge-triggered actions |
| `src/camera.js` | Camera bounds/smoothing and feet-based depth ordering |
| `src/render.js` | Culling, terrain, lower/upper passes, projection and journal map |
| `src/assets.js` | Sprite-sheet loading and original placeholder fallback |
| `assets/manifest.js` | Semantic animation definitions for replaceable art |
| `src/save.js` | Schema validation, migration and browser persistence |

World `(x,y)` describes the feet; `level` is discrete floor support. Visual elevation interpolates along stairs. Lower actors draw before bridge/upper surfaces; same-floor actors sort by foot Y. Only connected ramps change floor. Regions extend support surfaces, ramps, water, trails and semantic objects independently of their artwork.

The simulation caps frame catch-up, the canvas caps device pixel ratio at 2×, offscreen objects/grass/water are culled, and the journal map only redraws when opened. There are only six enemies and no external art dependencies. Physical iPad Safari performance and real multitouch still require device testing; desktop tests do not establish an iPad frame-rate guarantee.

See [ROADMAP.md](ROADMAP.md), [TESTING.md](TESTING.md), and [assets/README.md](assets/README.md). Final user-created sprites and music remain planned around v0.6.
