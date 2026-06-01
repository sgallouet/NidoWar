# NidoWar Art Direction

This document is the visual quality bar for world map, battle arenas, units, structures, UI-adjacent icons, and future asset prompts.

## Legal And Creative Boundary
- Reference screenshots from commercial games may be used only as quality and composition references.
- Do not copy exact sprites, UI frames, map layouts, faction marks, buildings, characters, or distinctive compositions from any reference game.
- The target is an original NidoWar look: cartoon-anime isometric fantasy strategy art with saturated cel-shaded color, strong black/dark-olive ink demarcation, readable tactical silhouettes, and clean authored terrain.
- Any prompt or art request must describe the NidoWar style directly. Avoid asking for assets "in the style of" a named living studio, artist, or game.
- When a reference image is discussed, translate it into concrete traits before prompting: cartoon/anime isometric projection, saturated sampled palette, bold ink outlines, readable strategy-map silhouettes, cel-shaded terrain bands, and clean authored composition.

## Visual Pillars
- Dense authored terrain: every screen should contain deliberate macro composition first, then layered ground variation, paths, rocks, grass clumps, flowers, roots, ruins, elevation hints, and small story props.
- Cartoon/anime ink language: surfaces are not flat noise. Use cel-shaded color bands, thick black or dark-olive demarcation strokes, clean hand-drawn tufts, and deliberate shadow shapes.
- Warm light, cool shadows: torches, windows, magic, and sunrise highlights should push warm yellow/orange; ambient shadows should drift blue, violet, or deep green.
- Tall silhouettes: forests, cliffs, buildings, ruins, and hero banners must rise above the ground plane and create depth.
- Readability at game scale: units and interactables need bold silhouettes, rim highlights, and clear feet/pivots even when surrounded by dense scenery.
- Cohesive world and battle art: world map, battle arena, units, terrain, and lighting must feel like one art system, not separate generated packs.

## Camera And Projection
- World map: isometric/three-quarter top-down fantasy strategy view.
- Battle arena: side-leaning tactical view with hexes visible through surface material, not sterile board-game tiles.
- Props should support depth by overlapping terrain and casting contact shadows.
- Unit feet must sit cleanly on the world or hex plane through manifest anchors.

## Palette
- Base grass sampled from the current target: ink `#051005`, `#0c1a08`, `#082606`; deep shadow `#0a440e`, `#11470c`, `#204608`; dark grass `#2d4f0c`, `#41670a`, `#4c6f08`; mid grass `#608306`, `#739507`, `#729708`; light grass `#84a80a`, `#84aa0c`; bright accents `#3e9811`, `#187317`.
- Dirt and paths sampled from the current target: `#d2a353`, `#b08f3f`, `#918360`, `#6e6142`, `#463c1e`.
- Stone sampled from the current target: lights `#dedad2`, `#d2caba`, `#c6bdab`, `#bcb29e`, `#948e7c`; shadows `#353d3b`, `#434947`, `#58584b`, `#686759`.
- Forests: saturated greens with black/dark-olive outline masses and occasional red/purple foliage accents.
- Water sampled from the current target: `#0172a8`, `#06638f`, `#064c72`, `#1990bc`.
- Night: deep navy ambient, cyan edge light in shadows, warm torch pools.
- Magic accents: restrained cyan, violet, gold, and red. Use sparingly so they remain special.

## World Map Density Rules
- A plain terrain surface is never final art, but a noisy terrain surface is not final art either. Calm readable open space is required for strategy-map readability.
- The world must be accepted in layers, not as one mixed screenshot:
  - First grass-only daylight: saturated cartoon/anime lawn matching the sampled target palette and black/dark-olive ink language. No mountains, no water, no roads, no walls/fences, no trees, no rocks, no lighting overlay, no large landmarks, no torches, no hero.
  - Then road/wall pass: roads, low walls/fences, and boundary structure are added only after the grass color and ink-demarcation base succeeds.
  - Then structure pass: ruins and larger landmarks are added only after the road/wall composition succeeds.
  - Then lighting/assets pass: shadows, torches, structures, resources, and units are added only after the base map succeeds.
- Each biome requires:
  - Base material texture.
  - Runtime composition masks for placement, size, tint, opacity, and density.
  - Reusable alpha-blended overlays and decals.
  - Small decals.
  - Medium props.
  - Tall occluders.
  - Contact shadows.
  - At least one warm light or emissive prop variant when appropriate.
- Large empty fields must be composed, not filled. Their centers should stay quieter than their edges so units, roads, settlements, and UI markers remain readable.
- Roads and paths should be irregular, stone-edged, and partially overgrown.
- Do not solve terrain integration with custom art that tries to transition from one specific material into another. Those assets are brittle and rarely match both sides. Use reusable dirt wear, grass bite marks, stones, weeds, prop bases, runtime alpha blending, tinting, scale variation, and shadows instead.
- Forests should be built from layered canopy sprites plus trunks/shadow bases, not scattered identical small trees. They are deferred until the grass-only base matches the sampled cartoon/anime palette and ink language.
- Mountains, cliffs, water, and shoreline borders are later composition anchors. They are deferred until grass, then road/wall composition are accepted.
- Random scattering is a detail layer only. It must never be the primary method for making the map feel authored.

## Battle Arena Rules
- Hexes must be readable, but the grid should feel embedded in the terrain.
- Hex outlines may be lit or carved, never pure flat UI strokes unless selected.
- Each battle biome needs foreground silhouettes, midground props, and a distant backdrop/parallax layer.
- Units need idle frames and hit/readability effects before full animation polish.
- Obstacles must be visually clear enough to explain blocking rules.

## Lighting Rules
- Lighting is a core art feature, not a final overlay bandage.
- Each emissive prop should have:
  - A sprite.
  - A soft radial light.
  - A small bright core.
  - Nearby warm tint on terrain/props when possible.
- Night scenes require localized warm pools and cool ambient shadows.
- Day scenes still need directional shadows and color grading.
- Avoid uniform dark overlays that flatten the map.

## Asset Delivery Rules
- Transparent PNG for sprites, props, units, buildings, effects, and decals.
- Terrain source textures may be opaque if they are material tiles. Reusable overlays, decals, props, and effects require alpha.
- Every asset or sheet must have a JSON manifest.
- Use consistent pivots:
  - World decals: center of ground footprint.
  - Props/buildings: bottom-center contact point.
  - Units/heroes: feet midpoint.
  - Effects/lights: visual center unless attached to a source sprite.
- Every asset pack must include a quick visual QA screenshot in `docs/qa/` before being accepted.

## Phase 2 Visual Acceptance Bar
- A screenshot of NidoWar's world map should no longer read as a flat texture with scattered decals.
- It should read as a richly authored fantasy strategy map with visible paths, forest massing, landmarks, shadowed depth, and warm/cool lighting.
- The map can still be a prototype, but it must demonstrate the final cartoon/anime inked art pipeline, not a temporary look.
