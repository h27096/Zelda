# Replaceable sprites

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
