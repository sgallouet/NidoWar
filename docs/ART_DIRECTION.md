# NidoWar Art Direction

This document is the visual quality bar for world map, battle arenas, units, structures, UI-adjacent icons, and future asset prompts.

## Legal And Creative Boundary
- Reference screenshots from commercial games may be used only as quality and composition references.
- Do not copy exact sprites, UI frames, map layouts, faction marks, buildings, characters, or distinctive compositions from any reference game.
- The target is an original NidoWar look: high-detail modern isometric pixel fantasy strategy art with dense terrain storytelling, readable tactical silhouettes, and dramatic painterly lighting.
- Any prompt or art request must describe the NidoWar style directly. Avoid asking for assets "in the style of" a named living studio, artist, or game.

## Visual Pillars
- Dense authored terrain: every screen should contain layered ground variation, paths, rocks, grass clumps, flowers, roots, ruins, elevation hints, and small story props.
- Painterly pixel clusters: surfaces are not flat noise. Use hand-placed clusters, broken edges, chunky highlights, and deliberate shadow shapes.
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
- Base grass: moss, olive, deep emerald, yellow-green highlights.
- Dirt and paths: reddish brown, ochre, dusty rose edges, darker damp soil patches.
- Stone: blue-gray shadows, warm beige highlights, cracked dark seams.
- Forests: several greens, with dark teal/blue shadow masses and occasional red/purple foliage accents.
- Water: dark teal/navy base, desaturated cyan highlights, small lily/shore detail.
- Night: deep navy ambient, cyan edge light in shadows, warm torch pools.
- Magic accents: restrained cyan, violet, gold, and red. Use sparingly so they remain special.

## World Map Density Rules
- A plain terrain surface is never final art.
- Each biome requires:
  - Base material texture.
  - Transition mask or blended edge family.
  - Small decals.
  - Medium props.
  - Tall occluders.
  - Contact shadows.
  - At least one warm light or emissive prop variant when appropriate.
- Large empty fields must be broken by clusters, paths, rocks, tree shadows, elevation, or interactable landmarks.
- Roads and paths should be irregular, stone-edged, and partially overgrown.
- Forests should be built from layered canopy sprites plus trunks/shadow bases, not scattered identical small trees.

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
- Terrain source textures may be opaque if they are material tiles, but their transitions and decals require alpha.
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
- The map can still be a prototype, but it must demonstrate the final art pipeline, not a temporary look.
