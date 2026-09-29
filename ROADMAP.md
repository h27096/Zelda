# Revised roadmap — BOTW + TOTK through a classic top-down lens

## v0.2 · The new engine (implemented)

Small Plateau slice, eight-direction movement, top-down collision, camera, depth sorting, separate elevation/support layers, stairs, bridge/underpass, touch and keyboard input, versioned saves, replaceable original placeholders, and one simple enemy. Previous platformer and shrine trials remain playable in `legacy/`.

## v0.3 · Great Plateau (implemented)

A connected original region with Shrine of Resurrection, Temple of Time, Plateau Tower, forests, ruins, ponds, camps, treasure and four distinct shrine alcoves. Rowan guides the tower → four seals → temple hand-in → southern descent tutorial. A journal map/checklist, gated exit, completion state and schema-2 save migration are implemented. Alcoves offer a seal and rest; full shrine puzzles remain v0.5 work. The v0.2 movement, bridge/underpass, controls and architecture are retained.

## v0.4 · Combat and original trail tools (implemented)

Timed three-strike sword chains, directional stamina-limited guarding, aim/release bow and finite arrows, remote Pulse Orbs, collision-aware Tether crates, Stillmark suspension, and Frostpath water crossings. Enemy notice/approach/windup/recovery/return states, invulnerability, knockback and checkpoint respawn. Supply kits, practice blade condition and repair, compact touch selection, keyboard parity, schema-4 migration and modular ability APIs. The v0.3 world, progression and original geometry remain intact. Physical iPad Safari verification is still pending.

## v0.5 · Shrines and progression (implemented)

Eight original rooms across Windstep (Tether), Reedlight (Frostpath), Rootsong (Stillmark) and Embercrest (Pulse Orb). Data-driven room definitions, entrances, exits, room checkpoints, safe reset, one-time shrine caches and persistent seals. Each seal grants a trail blessing for +1 heart or +25 stamina. The Journal map includes discovered travel points and upgrade controls. Schema 5 migrates v0.2–v0.4 saves without losing earned progression. The Plateau, original geometry, combat, controls and asset hooks remain; final visuals and audio stay in v0.6.

## v0.6 · Original visual and audio identity

The user supplies original character sprites/animations, tilesets, environment/UI art, sound effects and music. Replace placeholders through asset manifests. Gameplay code should continue asking for semantic animation names and directions. Audio playback/settings and asset preloading should respect iPad user-gesture requirements.

## v0.7 and beyond · Expand and polish

Broader Hyrule regions and villages, quests and dungeons; Sky and Depths using the world/elevation foundations; accessibility, performance, and control polish. Detailed scope should be agreed before each milestone. No full BOTW/TOTK recreation is implied by this prototype.
