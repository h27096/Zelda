# Plateau Quest · v0.2

A small, original, Zelda-inspired 2D platform game foundation designed for iPad and desktop browsers. No Nintendo art, music, or code is included.

## Play

Open the GitHub Pages site at `https://h27096.github.io/Zelda/` once Pages is enabled for **main / root** under repository **Settings → Pages**. For local testing, run `python3 -m http.server 8000` in this folder and open `http://localhost:8000`. ES modules require an HTTP server rather than opening `index.html` from Files.

On iPad, use the five on-screen buttons: move, jump, sword, and **◆** to interact. On desktop, use **A/D** or **←/→** to move, **W/↑/Space** to jump, **J/K** to attack, and **E/Enter** to interact. Stand by a shrine and interact to enter. In a shrine, interact near the altar at the far right to finish, or near the glowing entrance to leave. Save and pause are at the top. Progress saves automatically every 12 seconds and when the page is hidden. Saves live only in that browser on that device; clearing site data removes them. An interrupted shrine trial restarts when you enter again; completed shrines remain cleared.

## Current scope

An exploratory Great Plateau area, jumping and tile collisions, camera, sword combat, four roaming enemies, five hearts, save/pause, four shrine rooms, and a locked gate. The Wind shrine is a platform traverse; Courage requires a guardian fight; Ascent has a sky orb; Power has a sword-activated crystal. The gate opens after all four are cleared. It marks the end of the current build; the next region is not built yet.

## Roadmap

- v0.2: four shrines with distinct trials and persistent completion, locked Plateau gate. More detailed terrain and art remain to be added.
- v0.3: inventory, shield, bow and limited arrows, bombs, pickups, food and upgrades.
- v0.4: Hyrule regions and villages, tower map and fast travel, Koroks and quests.
- Later: Sky and Depths, major dungeons, castle finale, polish and accessibility.

Code is split across `src/world.js` (tiles/collision), `src/input.js` (controls), `src/save.js` (versioned local save), and `src/main.js` (game loop/rendering). Art consists of simple canvas shapes while we develop original assets.
