# Replaceable sprites

Wildbound v0.6 intentionally keeps placeholders. The user's final player sprites,
animations, music and SFX are postponed until ready. Keep the existing `link` and
`bokoblin` technical keys for compatibility; they are not visible character names.
The expansion adds `npc`, `house`, `forage`, `echo`, `discovery` and `cooking`
semantic kinds. Add optional `idle.s` clips for these to the manifest; absent or
failed images continue to use procedural placeholders. NPC definitions carry
names/colors separately from stats, dialogue and collision. Future per-character
art can supply a separate visual key while retaining the shared `npc` interaction
kind. Audio is currently absent and requires no assets to run.

Edit `assets/manifest.js` and place your own image files in this directory. Paths in `src` are relative to `assets/`, including on GitHub Pages. No gameplay code needs to change.

Example definition inside `assetManifest.link.animations`:

```js
idle: {
  s: { src: 'link.png', width: 32, height: 48, row: 0, frames: 1, anchorX: 16, anchorY: 46 }
},
walk: {
  s: { src: 'link.png', width: 32, height: 48, row: 1, frames: 4, fps: 10, anchorX: 16, anchorY: 46 },
  n: { src: 'link.png', width: 32, height: 48, row: 2, frames: 4, fps: 10, anchorX: 16, anchorY: 46 }
}
```

Animations are horizontal strips: `row` and optional `column` are zero-based frame indices. `width`/`height` are one frame's pixel size. Anchors locate the feet relative to that frame's top-left. These anchors control rendering, not collision. Sprite dimensions never determine collision geometry.

Current character states: `idle`, `walk`, `attack`; directions: `n`, `ne`, `e`, `se`, `s`, `sw`, `w`, `nw`. Unspecified state falls back to `idle`; unspecified direction falls back to `s`; absent/unavailable images fall back to the original procedural placeholder. Future systems can request `shield` and `bow` using the same contract. Enemy uses the `bokoblin` asset ID; props use `tree`, `rock`, `sign`, `checkpoint` with `idle.s` clips.

Keep gameplay foot positions, hit radius and elevation in world/entity data. A tree canopy can be much larger than its solid trunk. Preserve transparent backgrounds for sprites. Loading is asynchronous and failures are surfaced without preventing play. Terrain drawing is currently procedural in `render.js`; a future tileset renderer can replace that visual pass independently of world support/collision.

Use original or appropriately licensed assets. The game currently has no music or sound; audio integration belongs to the later original-art milestone.

## v0.3 semantic placeholders

The manifest now includes `guide`, `tower`, `shrine`, `temple`, `sanctuary`, `ruin`, `chest`, `pickup`, `camp` and `gate`. Their original canvas placeholders live beside the v0.2 fallbacks. World data supplies shrine colors, glyphs, names and descriptions; gameplay only uses stable IDs and interaction kinds. The renderer supplies `active` to indicate a lit tower, recorded seal, opened gate or collected cache. Future art can extend the manifest with corresponding animation states without changing collision geometry. Region and trail geometry in `src/world.js` is original and not traced from a Nintendo map.
