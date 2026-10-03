# WILDBOUND · v0.6 — World Expansion

An original browser adventure with a top-down / 2.5D perspective, built on the working v0.2–v0.5 game. No build step or dependencies; desktop keyboard and iPad touch controls share the same gameplay. The repository path stays `h27096/Zelda` for compatibility. The preserved platformer remains under `legacy/`.

**Final user-created sprites, animations, music, and SFX are intentionally postponed.** v0.6 uses existing placeholders and new semantic placeholder props. No final replacement player art was generated. The optional sprite manifest and missing-image fallback remain in place; missing audio is silent because audio integration is a future milestone.

[Play on GitHub Pages](https://h27096.github.io/Zelda/) · [Roadmap](ROADMAP.md) · [Testing](TESTING.md)

## World expansion

Finish the four existing shrine trials, return to Rowan at the **Lantern Temple**, then take the southern descent. The original Plateau geometry and all eight shrine rooms remain intact. The former starting sanctuary is now **Dawnrest Sanctuary**; technical IDs and save keys stay stable.

The outdoor world is now **3072 × 4608**, with seamless, reversible region boundaries:

- **Hearthstead Vale**: a safe settlement, three NPCs, cottages, merchant, cooking hearth, rest/travel stone and sunberry gathering.
- **Glassfen Marsh**: dry trails between pools, Frostpath shortcuts, harmful brambles, reeds, a bell landmark and hidden echo stones.
- **Copperwind Reach**: slower scree terrain, a third stair/elevated platform, survey cairn, copperroot gathering and a rest/travel camp.

Three new optional scrapper enemies use the existing combat behavior and placeholder visuals. Interact with new rest stones to unlock their fast travel points. Region discovery, landmarks and echo stones persist; unexplored expansion regions are shaded on the world map.

## People, quests, crowns, meals and gear

Use **E / USE** near a person to open paused dialogue. Mara offers **A warm welcome**, then **A meal for the road**. Tavi offers **Beyond the lanterns** and **The cairnkeepers**. Accept explicitly, track objectives in **Journal → Quests**, and return to the giver to complete them. Gathering turn-ins consume their requested items; exploration and cooking achievements can count before acceptance. Rewards cannot be claimed twice.

Ivo buys and sells with **crowns**. Prices, inventory and stock are data-driven and persistent. Old collected trail tokens become crowns once on migration; their journal history remains intact. New caches award their original tokens plus spendable crowns, enemies award three crowns, and landmarks/echo stones award five. Shrine blessings remain a separate progression resource. Equipped items must be unequipped before sale. Forage and quest rewards are finite in this foundation; trading always sells below purchase price.

Gather sunberries, sweet reeds and copperroot with E / USE. At the village hearth, choose a recipe to combine ingredients: **Wayfarer broth** (berry + reed) heals three hearts and restores 25 stamina; **Sunrise mash** (berry + root) heals two and restores 50. Eat from **Pack & gear**; values cap at your shrine-upgraded limits, and full vitals prevent wasting a meal.

**Tempered trailblade** adds one sword damage while blade condition remains. **Reedwoven coat** reduces heavy hits by one (minimum one damage) and protects against brambles. Tavi's **Cairnkeeper charm**, earned for three of four hidden echo stones, reduces stamina costs by 15%. Equip/unequip in the pack; the original bow, tool selection, blade repair and combat timings remain. NPCs have fixed, authored positions in v0.6 so they are always findable; day/night schedules are deferred.

## Extending v0.6

| Module | Add or change |
| --- | --- |
| `src/content.js` | Region bounds, adjacency, descriptions, terrain, trails, NPCs, quests, items, merchant stock, recipes, discoveries, echo stones and enemies |
| `src/adventure.js` | Validated expansion state, transactions, proximity checks, objectives, one-time rewards, crafting, gear and region-entry events |
| `src/adventure-ui.js` | Accessible journal tabs and context-sensitive dialogue/shop/cooking buttons |
| `src/world.js` | Combines original Plateau with expansion geometry; retains foot collision and ramp-based floor changes |
| `src/journey.js` | Shared travel discovery, threat gating and shrine blessings |
| `src/save.js` | Schema 6, safe old-save migration and backup recovery |

Regions use one connected coordinate space rather than scene reloads. Add an entry to `worldRegions` and its neighbor pairs to `regionLinks`; author connecting trails, collision-safe rest points, objects and any hazards/water/surfaces/ramps. `regionFor` and `updateRegion` handle boundary discovery without recreating player or enemy state. Increase the world bounds if needed. IDs must be unique and stable; changing existing IDs requires migration. Keep the Plateau cliff corridor and original coordinates intact. Add movement-based reachability tests for new terrain and interactables.

NPC definitions provide `name`, semantic `kind`, dialogue, position and optional quest/shop IDs. Quest objectives support held items, recorded landmarks, cooked recipe counts and collectible totals; `requires` chains quests. Recipes list ingredient counts and an output item. Gear items declare slots and effects; presentation is independent of stats. New art can be mapped to entity kinds in `assets/manifest.js` without rewriting gameplay. New recipes/items/shops automatically participate in validation and UI; add tests for their rules and safe approach points.

Schema 6 adds an `adventure` object containing crowns, bag, equipped item IDs, quest states, gathered nodes, echo stones, landmarks, region discoveries, cooking counts and merchant stock. v0.5 loads retain all valid player/checkpoint coordinates, hearts/stamina upgrades, equipment, shrine locations, seals, caches, defeats and play time. Migration does not write storage; the next successful save backs up the previous payload. The existing key and map ID are retained. Invalid expansion saves use the same backup recovery as older saves. Do not reset user saves to add content.

## v0.5 · Four original trials

Each shrine now contains two playable rooms with signs, mechanisms, a cache and a far-side plinth. The first plinth advances to the challenge room; the last grants a persistent seal and one **trail blessing**, once only. Replaying is supported. Use E / USE near room objects; Q selects tools and F / TOOL activates them. The featured tool is selected on entry, but all tools remain available.

| Shrine | Original trial | Tool and lesson |
| --- | --- | --- |
| Windstep | The Copper Courier | Tether: deliver a copper block to a plate, then carry around a stone spine. Movement slows while carrying; release to regain stamina and turn gradually around the block. |
| Reedlight | A Ribbon Across Rain | Frostpath: cross one basin, then two separated currents using safe dry banks. |
| Rootsong | A Borrowed Moment | Stillmark: freeze moving weights on plates and cross timed doors. The far side latches the door open; occupied doors never close on an actor. |
| Embercrest | Echoes in Copper | Pulse Orb: activate a gong, then sound two gongs with the same blast. Read the danger ring and retreat before detonating. |

Open **M / Escape / Journal** to spend each blessing on **+1 maximum heart** or **+25 maximum stamina**. Four shrine rewards allow four choices in any combination; upgrades are permanent. Healing, rest, regeneration and respawn use the upgraded capacities. The eight one-time shrine caches each grant five collectible trail tokens, five arrows (30 maximum), and two hearts. Trail tokens are collectibles, separate from spendable blessings.

The Journal includes the Plateau map, discovered fast-travel buttons and completion checks. Start is available immediately; lighting the tower, entering a shrine, or resting at the temple discovers that travel point. A tower marker alone does not unlock shrine travel. Travel needs an outdoor position at least 240 units from a living same-floor enemy. It clears temporary effects and sets a safe destination checkpoint without healing or resupplying. Inside a shrine, use **Return to Plateau** first.

Entering a room establishes its checkpoint. Death, reload or **Reset current room** restarts its mechanisms without losing rewards. The near-side plinth returns to the previous room or the Plateau; the Journal provides an always-available exit and reset to recover misplaced blocks. Outdoor enemies stop while you explore a shrine and resume when you leave.

### Earlier save compatibility

Schema 6 retains the existing storage keys and read-only load/rotating backup behavior. v0.2–v0.5 saves migrate automatically. Existing seals, open descent, ending state, treasures, equipment, health, valid positions and enemy defeats are retained. Previously recorded alcove seals count as completed shrines and award their unspent blessings retroactively; you can still play every new room and collect its caches. No prior reward is revoked. Unknown locations, invalid room indices, unknown treasure IDs, excessive upgrades and out-of-range vitals are rejected with backup recovery.

### Extend the room framework

`src/shrines.js` defines each shrine's `tool`, `title` and `rooms`. Rooms declare bounds, spawn, walls, door, waters, crates, motion, targets and plates. The reusable rules are `weight`, `cross`, `still` and `pulse`; `makeRoom` clones templates so transient state never leaks between visits. Local collision and sight sampling route through `Game.moveBody` and `Game.clearLine`; outdoor geometry is unchanged. `src/journey.js` owns discovery, validated upgrades and travel. `src/shrine-render.js` draws original masonry and semantic props with the existing actor/sprite pipeline.

To add a room, append a definition with a safe spawn and a rule, then add a movement/tool replay in `tests/helpers/shrine-play.js`. New shrine IDs also need a world entrance, travel destination and treasure IDs. Persistent room locations store the shrine ID and room index; keep their ordering stable or migrate them in `src/save.js` when changing existing content. Temporary crates, freezes, pulses and ice are deliberately reconstructed, preventing reload softlocks. The four fixed entrance/exit/plinth/cache positions are in `roomObjects` and can be generalized per room when needed.

## The Plateau

v0.3 expands the working v0.2 engine into a 3072 × 2304 region. The original glade, stairs, upper bridge and independent underpass remain in place. Trails connect the Dawnrest Sanctuary starting area, Plateau Tower, Old Road Ruins, Lantern Temple, Whisperwood, Reedlight Wetlands and Ember Highlands. Four ponds, two stair climbs, solid cliffs, seven placeholder enemies around several camps, four treasure caches and three fruit pickups reward exploration.

The game still uses the original movement, collision, depth sorting, camera, combat, input and save architecture. The previous platformer remains untouched under `legacy/`.

## Your first journey

1. From the starting rest stone, meet **Rowan** to the southeast. Use E or the touch Use button nearby.
2. Follow the northern trail up the original stairs and light **Plateau Tower** on the terrace. Shrine markers appear on the journal map.
3. Visit four shrines in any order. **Windstep** sits across the upper bridge; **Reedlight** is beyond the northeast pond; **Rootsong** is deep along the western forest trail; **Embercrest** is on the southeast highland, reached by its southern stairs.
4. Enter each shrine and solve its two original tool rooms. Use the far plinth to advance, then receive its seal. Each new seal grants one trail blessing; spend it in the Journal on a heart or stamina upgrade.
5. Bring all four seals to Rowan at the **Lantern Temple** in the center of the Plateau.
6. Follow the temple trail south through the opened descent. Continue beyond the cliff into Hearthstead Vale, or return to explore the Plateau freely.

A persistent objective strip, nearby interaction prompt, trail signs, dialogue, and the paused **Journal** with map/checklist provide directions. The entire southern cliff is blocked except its single gated descent. Tower activation, shrine recording and the temple hand-in enforce the tutorial order. Combat and treasure are optional; guarded caches require clearing nearby enemies. Fruit and caches heal and grant collectible trail tokens, and equivalent spendable crowns.

## Controls

| Action | Keyboard | iPad |
| --- | --- | --- |
| Move | WASD / arrows | Left joystick |
| Sword | J / K / Space | Sword button |
| Talk / inspect / enter shrine | E / Enter | Use button |
| Guard (hold) | L | Guard |
| Selected tool | F (hold/release for bow) | Tool |
| Select next tool | Q | ↻ tool selector |
| Sprint | Shift + move | Drag joystick beyond rim |
| Quests / pack / gear / cooking / shop | Journal buttons (Tab / Enter) | Journal buttons; USE near NPC/hearth |
| Map / Journal / pause | M, Escape or Journal | Journal |
| Save | Save button | Save |
| Room sign / cache / exit / plinth | E / Enter nearby | Use |
| Upgrade / travel / reset room / leave shrine | Journal buttons (Tab / Enter) | Journal buttons |

Use rest stones to heal and set your checkpoint. Death restores your full heart capacity there without losing collected seals, treasure or defeated enemies. Cliff edges remain solid. Water is solid except for temporary Frostpath crossings. Return from upper platforms by their stairs or bridge. Eight-direction movement, simultaneous joystick and sword, pointer cancellation, safe-area spacing and background pause are preserved.

## Run locally / GitHub Pages

No dependencies or build step are needed. Use Node 22+:

```sh
npm run serve
# http://127.0.0.1:8000
npm test
# http://127.0.0.1:8000/tests/browser.html
# http://127.0.0.1:8000/tests/ui.html
# http://127.0.0.1:8000/tests/expansion-ui.html
```

Any static HTTP server works. GitHub Pages can serve **main / root** directly. Imports and assets are relative, including under `/Zelda/`; all entry assets and production imports use `v=0.6.0` to avoid stale cached prior-version files. There is no external runtime, CDN or network-loaded artwork.

## Saves and migration

The browser-local key remains `plateau-quest-topdown`, with schema **6**, map ID `great-plateau`, and backup key `plateau-quest-topdown-backup`. Saves occur every 12 active seconds, after important events, when hidden/leaving, and on manual Save. Storage failures show a notice and do not crash the game.

v0.2 schema-2 `plateau-slice` saves migrate on load. Valid positions, health, checkpoint, enemy defeats and play time carry forward; new tutorial state starts fresh. An old position now occupied by a new landmark moves safely to the starting stone. Loading does not rewrite storage. The first successful migrated save retains the previous valid v0.2 payload as its backup; later saves rotate the last valid payload as before. v0.3 schema-3 saves keep all tutorial, completion, treasure and defeat state and receive the v0.4 starter equipment. Invalid new progress, unknown IDs, inconsistent unlocks and locked-exit positions are rejected, with backup recovery or a safe fresh start.

Seals, guide/tower state, exit unlock, completion and collected item IDs persist. Reloading inside a shrine returns to the current room entrance. Mechanisms reset; collected treasure, seals and upgrades persist. Leaving uses the safe outdoor approach, which becomes your outdoor checkpoint. New Game requires confirmation and clears only top-down saves. The old `plateau-quest-v1` platformer key is untouched. Saves are per browser/origin, do not sync across devices, and disappear if site data is cleared.

## Architecture and assets

| Module | Responsibility |
| --- | --- |
| `src/main.js` | DOM, fixed 60 Hz simulation, journal/progression UI, lifecycle and saves |
| `src/game.js` | Player, enemies, combat, interactions, tutorial events and snapshots |
| `src/combat.js` | Timed swings, directional guards, projectiles, damage and enemy state transitions |
| `src/abilities.js` | Modular Pulse Orb, Tether, Stillmark and Frostpath prototypes |
| `src/equipment.js` | Bounded equipment state, supply kit definitions and validation |
| `src/combat-render.js` | Asset-independent combat cues and original tool placeholders |
| `src/world.js` | Declarative regions, trails, landmarks, objects, floor support and collision |
| `src/progression.js` | Progress validation, objective text, journal checklist and token totals |
| `src/input.js` | Keyboard/pointer ownership, joystick and edge-triggered actions |
| `src/camera.js` | Camera bounds/smoothing and feet-based depth ordering |
| `src/render.js` | Culling, terrain, lower/upper passes, projection and journal map |
| `src/assets.js` | Sprite-sheet loading and original placeholder fallback |
| `assets/manifest.js` | Semantic animation definitions for replaceable art |
| `src/save.js` | Schema validation, migration and browser persistence |

World `(x,y)` describes the feet; `level` is discrete floor support. Visual elevation interpolates along stairs. Lower actors draw before bridge/upper surfaces; same-floor actors sort by foot Y. Only connected ramps change floor. Regions extend support surfaces, ramps, water, trails and semantic objects independently of their artwork.

The simulation caps frame catch-up, the canvas caps device pixel ratio at 2×, offscreen objects/grass/water are culled, and the journal map only redraws when opened. There are ten enemies and no external art dependencies. Physical iPad Safari performance and real multitouch still require device testing; desktop tests do not establish an iPad frame-rate guarantee.

See [ROADMAP.md](ROADMAP.md), [TESTING.md](TESTING.md), and [assets/README.md](assets/README.md). Final user-created sprites and music are intentionally postponed until the user is ready.

## v0.4 combat and original trail tools

- Sword: 90 ms windup, active until 220 ms, recovery to 380 ms. Tap during recovery to queue the next strike; three-hit chain, stronger/wider finisher. Facing locks during swings. Each target takes one hit per swing. Ground sectors show reach and flash during active frames.
- Guard: hold L / GUARD, face the threat. Front attacks cost 24 stamina plus hold drain; rear hits, empty stamina, and explosions bypass it. Walking slows while guarding. Sword, sprint, bow, and abilities also use stamina; it regenerates after a short delay.
- Bow: hold F / TOOL, use movement direction to aim while standing still, release to fire. One arrow per shot; collision-sampled projectiles stop on world geometry and crates and cannot hit another floor. Maximum 30 arrows. Blur, pause and cancelled pointers discard aiming without firing.
- **Pulse Orb**: throw forward into navigable space, wait 0.65 seconds to arm, then activate again to burst. The visible 88-unit danger ring includes the player. Walls and floor separation block damage. One orb at a time; short cooldown after detonation.
- **Tether**: face the copper crate near (600, 740), activate to carry it ahead as you steer; activate again to release. Collision, range and stamina limit movement. Crates reset on reload, so this prototype cannot permanently block progression.
- **Stillmark**: suspend a visible enemy or copper crate for three seconds. Costs 28 stamina, with a four-second cooldown.
- **Frostpath**: face a pond from its bank to create a narrow crossing for 18 seconds, costing 30 stamina. An occupied crossing remains until you leave; only the player traverses prototype ice. Saves on ice use your land checkpoint. Temporary tool effects are deliberately not serialized.

All tools are available for testing from an existing v0.3 save. A new optional lookout at (750, 1100), southeast of the start, remains available even when all six original camps were cleared. Enemies notice unobstructed nearby players, approach, telegraph a directional attack, recover, and return home after disengaging. Hurt frames and collision-aware knockback prevent contact damage spam. Defeats persist and grant three arrows.

Trail supply kits east of the start (390, 700), on the Old Road approach (1020, 900), and west of Reedlight pond (1760, 720) grant arrows and a replacement practice blade once each. Blade condition starts at 40 and wears on successful hits. At zero, the blade remains usable but loses its stronger finisher. Rest stones repair it and restore at least 12 arrows so experimenting cannot exhaust progression resources. Equipment, stamina, tool selection and collected kits persist in schema 6 independently of the tutorial token inventory. Existing custom sprites remain optional through the semantic asset manifest; combat cues render independently.

v0.5 adds shrine interiors; final sprites, music and external runtime dependencies remain absent. Device Safari/multitouch and sustained iPad performance still need testing on physical hardware.
