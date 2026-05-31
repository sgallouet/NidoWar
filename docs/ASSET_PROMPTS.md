# NidoWar Asset Prompts

Use these prompts for the next asset generation pass. They describe an original NidoWar visual target: high-detail modern isometric pixel fantasy strategy art, rich terrain storytelling, painterly pixel clusters, dramatic warm/cool lighting, chroma-keyed sprite exports, and manifest-driven integration.

Do not include names of reference games, studios, or artists in generator prompts. Use the reference screenshots only to judge density, lighting, and quality.

## Hard Rule: No Custom Transition Art

Do not generate art whose job is to transition from one exact terrain material into another exact terrain material. These assets are hard to control, rarely match both surfaces, and tend to stamp badly in game.

Instead, generate reusable brush components that we combine at runtime: broad dirt wear, grass bite marks, loose stones, broken road pieces, moss, weeds, flowers, cracks, roots, pebbles, low walls, fence pieces, prop bases, separate shadows, and contact darkening.

Runtime controls do the integration work: alpha, tint, scale, density masks, contact shadows, and composition placement.

## Global Prompt Prefix

```text
Original high-detail modern isometric pixel art for a fantasy strategy game, rich hand-authored terrain detail, painterly pixel clusters, crisp readable silhouettes, warm golden highlights and cool blue-green shadows, chunky pixel edges, no vector art, no smooth 3D render, no UI, no text, game-ready asset.
```

## Global Negative Prompt

```text
flat texture, blurry, photorealistic, 3D render, vector illustration, low-detail mobile icon, plastic shading, plain noise, black background, white background, gray background, checker background, UI frame, text, watermark, logo, copied game screenshot, copied existing sprite, inconsistent perspective, tiny unreadable silhouette, magenta pixels inside the asset.
```

## Generation Settings
- Generate complete replacement sheets from scratch, not deltas or edits of previous attempts.
- Generate sprite sheets on a perfectly flat solid chroma-key magenta background: `#ff00ff`. Do not ask the generator for alpha transparency directly; it often fails and leaves dirty dark pixels.
- The magenta background must be one uniform color with no texture, no lighting, no shadows, no gradients, no antialiasing haze, and no floor plane.
- Do not use magenta anywhere inside the subject. The chroma-key removal tool should be able to remove every magenta pixel cleanly.
- Final checked-in sprite sheets should still become alpha PNGs after local chroma-key removal, but the generator prompt should request magenta.
- Use fixed sheet layouts so manifests can be written without hand-cropping:
  - Terrain materials: single opaque square, preferably `1254x1254` or at least `1024x1024`; use very small-scale detail because the renderer repeats terrain textures several times across the map.
  - Tree clusters / rocks / brush overlay sheets: `4 columns x 3 or 4 rows`, whole image `1448x1086` when using the current generator.
  - Shrub and small vegetation sheets: `5 columns x 4 rows`, whole image `1448x1086`.
  - Small ground decal sheets: `7 columns x 6 rows`, whole image `1448x1086`.
- Put one isolated asset centered in each grid cell with generous transparent padding. Do not let sprites overlap neighboring cells.
- Use a consistent three-quarter isometric camera direction within a pack.
- Use bottom-center pivots: the ground contact point should sit near the lower center of each frame.
- Avoid baked rectangular footprints. Ground contact shadows and dirt/moss bases should be irregular and alpha-broken.
- After chroma-key removal, inspect the sheet at 200-400% zoom. Reject or regenerate if dark halos, magenta fringing, black matte pixels, or missing edge pixels remain.

## Current Generator Lessons
- The current generator often returns `1448x1086` transparent sheets. Prompts should explicitly request a grid layout and exact row/column count.
- Assets look best when requested as larger authored clusters, not many tiny symbols. Tiny isolated icons read weakly on the map.
- Forest art must be large vertical masses: mixed conifers and broadleaf trees, dark teal interior shadows, warm rim highlights, visible trunks near the base, and undergrowth. Single scattered trees are not enough.
- Rocks work well when they have strong blue-gray shadow planes and warm beige top edges. Use them in clusters and barriers, not evenly sprinkled.
- Torches need a clear small-map version: tall enough to read, but with the flame and post inside one bottom-pivoted frame. Oversized presentation variants should not be mixed into the same runtime sheet unless they are in separate rows.
- Never rely on generated transition sheets as the terrain solution. The reference look is built from authored composition, broad alpha-blended brush overlays, placed detail pieces, tinting, scale variation, shadows, and controlled density.
- Brush art should be single-purpose and reusable: dirt wear, grass bite marks, small stone clusters, moss, cracks, weeds, prop bases, and vegetation breakup. Avoid directional edge-piece systems that require perfect tile matching.
- Road art is now the weakest visible material: avoid straight grid-like cobblestone lines. Request broken, irregular stones, overgrown edges, missing stones, and diagonal/curving path pieces.
- Tree sheets can look excellent as source art, but the runtime map needs authored forest regions, canopy clumps, and edge silhouettes. Do not rely on single random tree stamps to create the final strategy-map density.
- When a generator preview shows black around sprites, assume alpha failed. Regenerate on flat `#ff00ff` chroma key and remove it locally; do not accept black-matted tree edges.
- Current terrain art was too large in-game. Terrain material prompts must ask for very fine micro-detail: grass blades, dirt pebbles, cracks, and moss clusters should read small at world-map scale, not as giant painted clumps.
- The map target is dense authored composition: roads leading through forests and landmarks, clustered props, tall occluders, warm/cool lighting, and shadow grouping. Avoid sparse random scattering.
- The next reset should not start with mountains, water, landmarks, roads/walls, or unit sprites. First generate simple base composition anchors: meadow clearing overlays, forest edge/canopy masses, shadow brushes, clustered rocks, restrained shrubs, and subtle dirt-wear brushes.
- The first screenshots should prove the forest-framed clearing works before roads and low walls are introduced. Keep roads, walls, mountains, water, lighting, and large landmarks hidden until this meadow/forest base composition works.

---

## World Terrain Material Kit

### 1. Grass Meadow Terrain Texture
```text
Original high-detail modern isometric pixel art fantasy strategy ground material, seamless grass meadow terrain texture, moss green and olive base with yellow-green highlights, cool teal shadow flecks, very fine micro-detail grass blades, tiny weeds, small moss clusters, subtle color variation, no giant clumps, no flowers or rocks, no tile border, no grid, opaque square texture, 1254x1254 or 1024x1024, loops seamlessly.
```

### 2. Dirt Path Terrain Texture
```text
Original high-detail modern isometric pixel art fantasy strategy ground material, seamless reddish brown dirt path texture, ochre dust, compacted earth, very small pebbles, fine cracks, tiny dry patches, subtle darker damp soil clusters, painterly pixel micro-clusters, no giant stones, no large brush strokes, no tile border, no grid, opaque square texture, 1254x1254 or 1024x1024, loops seamlessly.
```

### 3. Cobblestone Road Texture
```text
Original high-detail modern isometric pixel art fantasy strategy ground material, seamless old cobblestone road texture, small irregular pale gray and warm beige stones, broken spacing, dark blue-gray cracks, tiny moss between stones, chipped edges, fine painterly pixel clusters, no straight grid lines, no tile border, opaque square texture, 1254x1254 or 1024x1024, loops seamlessly.
```

### 4. Forest Floor Texture
```text
Original high-detail modern isometric pixel art fantasy strategy ground material, seamless shadowed forest floor texture, deep green moss, tiny fallen leaves, thin exposed roots, dark teal shadow clusters, small brown twigs, fine pixel micro-detail, no large plants, no giant root shapes, no tile border, no grid, opaque square texture, 1254x1254 or 1024x1024, loops seamlessly.
```

### 5. Shallow Water Texture
```text
Original high-detail modern isometric pixel art fantasy strategy water material, seamless dark teal shallow water texture, fine pixel ripples, small navy depth patches, muted cyan highlights, occasional tiny lily pad hints very sparse, no shore edge, opaque square texture, 1254x1254 or 1024x1024, loops seamlessly.
```

### 6. Deprecated Grass To Dirt Transition Mask Sprites
```text
Do not generate this. Directional terrain transition sheets are deprecated because they are hard to generate reliably, rarely match both source materials, and do not match the reference construction method. Use reusable brush overlays: road dirt underpaint, grass bite marks, stones, weeds, tint, alpha, scale, and shadows.
```

### 7. Deprecated Dirt To Cobblestone Transition Mask Sprites
```text
Do not generate this. Dirt-to-stone transition sheets are deprecated because road integration should be built from broad dirt underpaint overlays plus placed stone detail pieces, vegetation breakup, tint, alpha, scale, and shadows.
```

---

## World Decal Sheet

### 8. Meadow Small Decals
```text
Original high-detail modern isometric pixel art fantasy meadow decal sprite sheet, flat solid #ff00ff chroma-key magenta background, 32 isolated small ground decals: flower clusters, tiny blue flowers, white flowers, yellow flowers, clover patches, weeds, short grass clumps, moss spots, small leaves, each decal 16x16 to 32x24 pixels, crisp readable pixels, no shadows baked too large.
```

### 9. Dirt And Road Small Decals
```text
Original high-detail modern isometric pixel art fantasy path decal sprite sheet, flat solid #ff00ff chroma-key magenta background, 32 isolated small ground decals: pebble clusters, cracked dirt, loose cobbles, muddy patches, straw bits, tiny roots, wheel ruts, dry grass at edges, each decal 16x16 to 40x28 pixels, crisp readable pixels.
```

### 10. Forest Floor Decals
```text
Original high-detail modern isometric pixel art fantasy forest decal sprite sheet, flat solid #ff00ff chroma-key magenta background, 32 isolated small decals: mushrooms, fern sprouts, fallen leaves, exposed roots, moss pads, tiny dark flowers, pine needles, small branches, each decal 16x16 to 48x32 pixels, cool shadow palette with warm highlights.
```

---

## World Prop Sheet

### 11. Rocks And Boulders
```text
Original high-detail modern isometric pixel art fantasy rocks and boulders sprite sheet, flat solid #ff00ff chroma-key magenta background, 16 isolated props, gray-blue stone with warm beige highlights, moss patches, strong bottom contact shadow, varied sizes from small stone to medium boulder, bottom-center pivot friendly, no background, no UI.
```

### 12. Tall Grass And Shrubs
```text
Original high-detail modern isometric pixel art fantasy vegetation prop sprite sheet, flat solid #ff00ff chroma-key magenta background, 20 isolated props arranged in a 5 columns x 4 rows grid, tall grass clumps, reeds, flowering shrubs, broadleaf bushes, red-purple accent plants, layered leaves, strong silhouettes, cool blue-green shadow bases, warm golden edge highlights, irregular dirt/moss contact bases, bottom-center pivot friendly, one prop per cell with padding, no UI, no text.
```

### 13. Forest Tree Cluster Props
```text
Original high-detail modern isometric pixel art fantasy forest tree cluster sprite sheet, flat solid #ff00ff chroma-key magenta background, 12 isolated large vertical props arranged in a 4 columns x 3 rows grid, dense mixed conifer and broadleaf forest masses, overlapping canopies, dark teal and navy interior shadows, moss green and yellow-green highlights, warm rim light on top edges, visible trunks and rocks near the base, flowers and undergrowth at ground contact, irregular alpha-broken silhouette, bottom-center pivot friendly, each cluster large enough to occlude terrain and create depth, no single tiny trees, no UI, no text.
```

### 14. Cliff And Mountain Edge Props
```text
Original high-detail modern isometric pixel art fantasy cliff and mountain props, flat solid #ff00ff chroma-key magenta background, 12 isolated rocky wall segments, jagged gray-blue stone, snow or pale highlights on sharp planes, dark crevices, moss at base, tall silhouettes, bottom-center pivot friendly, no background.
```

### 15. Torch And Light Source Props
```text
Original high-detail modern isometric pixel art fantasy torch and brazier sprite sheet, flat solid #ff00ff chroma-key magenta background, runtime-ready small map props arranged in a clean grid, 16 isolated standing torches and braziers, bright white-yellow flame core, orange glow pixels, dark metal or wood supports, stone or dirt base, readable at small world-map size, consistent height per row, bottom-center pivot friendly, one torch per cell with padding, no oversized showcase torches mixed into runtime rows, no UI, no text.
```

### 16. Treasure And Interactable Props
```text
Original high-detail modern isometric pixel art fantasy strategy map interactable props sprite sheet, flat solid #ff00ff chroma-key magenta background, 16 isolated props: treasure chests, resource crates, glowing shrine stones, signposts, banners, wells, small ruins, campfires, magic obelisk, strong silhouettes, warm/cool lighting accents, bottom-center pivot friendly.
```

---

## World Structure Kit

### 17. Small Medieval House
```text
Original high-detail modern isometric pixel art fantasy medieval house prop, flat solid #ff00ff chroma-key magenta background, three-quarter isometric view, stone base, timber walls, blue slate roof, warm lit windows, moss and small flowers at base, strong readable silhouette, bottom-center pivot, no UI, no text.
```

### 18. Guard Tower
```text
Original high-detail modern isometric pixel art fantasy guard tower prop, flat solid #ff00ff chroma-key magenta background, three-quarter isometric view, pale stone tower, blue roof, small banner, warm torch lights, crisp pixel details, strong silhouette, bottom-center pivot, no UI, no text.
```

### 19. Castle Gate Segment
```text
Original high-detail modern isometric pixel art fantasy castle wall and gate segment, flat solid #ff00ff chroma-key magenta background, three-quarter isometric view, pale stone walls, crenellations, wooden gate, torch sconces, warm light, mossy base, strong silhouette, bottom-center pivot, no UI, no text.
```

### 20. Mine Entrance Resource Node
```text
Original high-detail modern isometric pixel art fantasy resource node, flat solid #ff00ff chroma-key magenta background, mine entrance built into rock, timber supports, mine cart, gold ore sparkle, lantern glow, moss and dirt at base, bottom-center pivot, no UI, no text.
```

### 21. Magic Shrine Resource Node
```text
Original high-detail modern isometric pixel art fantasy magic shrine prop, flat solid #ff00ff chroma-key magenta background, ancient stone pedestal with cyan glowing rune, small candles, broken stones, moss and flowers, cool magical light plus warm candle highlights, bottom-center pivot, no UI, no text.
```

---

## World Hero And Army Visuals

### 22. World Hero Idle Sprite
```text
Original high-detail modern isometric pixel art fantasy strategy hero sprite, flat solid #ff00ff chroma-key magenta background, full body standing on invisible ground plane, readable at map scale, heroic cloak, small banner pole, metal armor with blue and gold accents, warm rim light, cool shadow side, feet visible for anchor, 4 idle frames on one horizontal sprite sheet, no UI, no text.
```

### 23. World Hero Walk Sprite
```text
Original high-detail modern isometric pixel art fantasy strategy hero walk cycle, flat solid #ff00ff chroma-key magenta background, same hero design, eight directional isometric map movement poses or 4 directional if space limited, readable silhouette, cloak and banner motion, feet visible for anchor, sprite sheet with even frame spacing, no UI, no text.
```

### 24. Selection Ring And Movement Marker
```text
Original high-detail modern isometric pixel art fantasy strategy selection effects sprite sheet, flat solid #ff00ff chroma-key magenta background, glowing gold selection ring in isometric ellipse, blue movement path dots, reachable tile sparkle, invalid red cross marker, soft pixel glow, no text, no UI frame.
```

---

## Battle Arena Kit

### 25. Stone Desert Hex Base
```text
Original high-detail modern tactical fantasy battle arena hex tile sprite sheet, flat solid #ff00ff chroma-key magenta background, sandy stone hexes embedded in terrain, irregular carved edges, small cracks, pebbles, moss tufts, warm sunset highlights, cool shadow sides, 12 variants, each hex isolated with padding, readable hex shape but not sterile UI.
```

### 26. Grass Ruins Hex Base
```text
Original high-detail modern tactical fantasy battle arena hex tile sprite sheet, flat solid #ff00ff chroma-key magenta background, grassy ruined stone hexes, worn cobbles, moss, weeds, cracked slabs, warm light and cool shadows, 12 variants, each hex isolated with padding, readable hex shape but natural terrain surface.
```

### 27. Elevated Hex Blocks
```text
Original high-detail modern tactical fantasy battle arena elevated hex block sprite sheet, flat solid #ff00ff chroma-key magenta background, stone platform hexes with vertical cliff sides, cracked top surface, moss and grass tufts, strong side shadows, 8 height/edge variants, each isolated with padding.
```

### 28. Battle Arena Obstacles
```text
Original high-detail modern tactical fantasy battle arena obstacle sprite sheet, flat solid #ff00ff chroma-key magenta background, 20 isolated props: rock stacks, cactus, shrubs, broken pillars, dead trees, crates, low walls, torch stands, strong silhouettes, bottom-center pivots, readable blocking shapes.
```

### 29. Battle Backdrop Desert Oasis
```text
Original high-detail modern pixel art fantasy battle background, wide 16:9 parallax backdrop, desert oasis at golden hour, palm silhouettes, distant trees, warm sky, cool ground shadows, painterly pixel clusters, no UI, no text, background layer not transparent.
```

---

## Unit Style Prompts

### 30. Human Infantry Unit
```text
Original high-detail modern pixel art fantasy tactical unit sprite, flat solid #ff00ff chroma-key magenta background, human infantry with shield and spear, readable at battle scale, strong silhouette, warm rim highlights, cool shadow side, feet visible for anchor, idle pose, 4-frame idle sprite sheet, no UI, no text.
```

### 31. Human Archer Unit
```text
Original high-detail modern pixel art fantasy tactical unit sprite, flat solid #ff00ff chroma-key magenta background, human archer with cloak and bow, readable at battle scale, strong silhouette, warm rim highlights, cool shadow side, feet visible for anchor, idle pose, 4-frame idle sprite sheet, no UI, no text.
```

### 32. Beast Rider Unit
```text
Original high-detail modern pixel art fantasy tactical unit sprite, flat solid #ff00ff chroma-key magenta background, armored beast rider on lizard-like mount, readable at battle scale, colorful feathers or cloth accents, strong silhouette, warm rim highlights, cool shadow side, feet or mount contact visible for anchor, 4-frame idle sprite sheet, no UI, no text.
```

### 33. Large Brute Unit
```text
Original high-detail modern pixel art fantasy tactical unit sprite, flat solid #ff00ff chroma-key magenta background, large brute creature with heavy weapon, readable at battle scale, hunched powerful silhouette, saturated accent colors, warm rim highlights, cool shadow side, feet visible for anchor, 4-frame idle sprite sheet, no UI, no text.
```

### 34. Spell Impact Effect
```text
Original high-detail modern pixel art fantasy battle effect sprite sheet, flat solid #ff00ff chroma-key magenta background, magical impact burst, bright white-yellow core, cyan and violet sparks, chunky pixel shards, 8 animation frames, no UI, no text, isolated with padding.
```

---

## First Asset Batch Recommendation

Generate in this order for the Phase 2 visual reset:
1. Meadow clearing overlay pack.
2. Forest edge and canopy mass pack.
3. Directional/contact shadow brush pack for trees, rocks, and shrubs.
4. Rocks and shrub cluster pack.
5. Road dirt underpaint overlay pack.
6. Road stone detail piece pack.
7. Road-edge vegetation breakup pack.
8. Low wall and fence segment pack.
9. Landmark dressing props.
10. Torch and light source props.
11. Mountain and shoreline packs only after meadow/forest and road/wall composition are accepted.

Do not proceed to battle arena assets until the world map art pipeline proves it can match the density and lighting bar.

## Copy-Ready Reference Extraction Prompts

Use these when uploading a reference image to an art generator. The reference image is for shape language, density, composition logic, and lighting cues only. The generated assets must be original NidoWar art, not a copy of the reference image.

### A. Meadow Clearing Overlay Pack From Reference
```text
Analyze the attached reference image and extract only its high-level ground composition logic: how clearings break up grass fields, where dirt wear appears, how small stones and flowers cluster, edge softness, detail density, alpha-blended overlap, and warm/cool lighting balance. Do not copy any exact sprite, landmark, layout, faction symbol, UI element, palette identity, or recognizable composition from the reference.

Create original high-detail modern isometric pixel art for a fantasy strategy world map: meadow clearing brush overlay sprite sheet, flat solid #ff00ff chroma-key magenta background, 12 isolated irregular ground brush components arranged in a clean 4 columns x 3 rows grid. Subtle dirt wear, small pale stones, tiny flowers, weeds, broken moss, alpha-broken organic edges, no hard rectangular edges, no road stones, no black halo, designed for runtime alpha/tint/scale control to break up large grass fields, no UI, no text.

Style target: rich hand-authored terrain detail, painterly pixel clusters, crisp readable silhouettes, warm golden highlights, cool blue-green shadows, chunky pixel edges, no vector art, no smooth 3D render.

Negative prompt: flat texture, blurry, photorealistic, 3D render, vector illustration, low-detail mobile icon, plastic shading, plain noise, black background, white background, gray background, checker background, UI frame, text, watermark, logo, copied game screenshot, copied existing sprite, inconsistent perspective, tiny unreadable silhouette, magenta pixels inside the asset.
```

### B. Road Dirt Underpaint Overlay Pack From Reference
```text
Analyze the attached reference image and extract only its high-level road composition logic: how paths are readable through soft dirt wear, how grass overlaps path edges, how width varies, how curves and forks feel authored, and how detail density changes along the road. Do not copy any exact sprite, landmark, layout, faction symbol, UI element, palette identity, or recognizable composition from the reference.

Create original high-detail modern isometric pixel art for a fantasy strategy world map: road dirt brush underpaint sprite sheet, flat solid #ff00ff chroma-key magenta background, 12 isolated broad irregular dirt wear components arranged in a clean 4 columns x 3 rows grid. Reddish brown compacted earth, wheel-worn dirt, tiny pebbles, dusty patches, broken organic edges, no need to match any exact grass texture, no hard tile transition borders, no rectangular stamps, designed for runtime alpha/tint/scale control under road stone details, no UI, no text.

Style target: rich hand-authored terrain detail, painterly pixel clusters, crisp readable silhouettes, warm golden highlights, cool blue-green shadows, chunky pixel edges, no vector art, no smooth 3D render.

Negative prompt: flat texture, blurry, photorealistic, 3D render, vector illustration, low-detail mobile icon, plastic shading, plain noise, black background, white background, gray background, checker background, UI frame, text, watermark, logo, copied game screenshot, copied existing sprite, inconsistent perspective, tiny unreadable silhouette, magenta pixels inside the asset.
```

### C. Road Stone Detail Piece Pack From Reference
```text
Analyze the attached reference image and extract only its high-level road detail language: how stones are sparse or broken, how missing stones create rhythm, how moss and grass interrupt the path, and how road detail supports composition without becoming a perfect grid. Do not copy any exact sprite, landmark, layout, faction symbol, UI element, palette identity, or recognizable composition from the reference.

Create original high-detail modern isometric pixel art for a fantasy strategy world map: road stone detail brush sprite sheet, flat solid #ff00ff chroma-key magenta background, 24 isolated broken pale-stone detail components arranged in a clean 6 columns x 4 rows grid. Short stone clusters, missing stones, small curves, fork hints, caps, scattered loose stones, moss between stones, small grass tufts, each piece alpha-broken and designed for runtime placement on top of dirt underpaint, no regular grid, no wide smooth ribbon, no UI, no text.

Style target: rich hand-authored terrain detail, painterly pixel clusters, crisp readable silhouettes, warm golden highlights, cool blue-green shadows, chunky pixel edges, no vector art, no smooth 3D render.

Negative prompt: flat texture, blurry, photorealistic, 3D render, vector illustration, low-detail mobile icon, plastic shading, plain noise, black background, white background, gray background, checker background, UI frame, text, watermark, logo, copied game screenshot, copied existing sprite, inconsistent perspective, tiny unreadable silhouette, magenta pixels inside the asset.
```

### D. Low Wall And Fence Segment Pack From Reference
```text
Analyze the attached reference image and extract only its high-level boundary composition logic: how low walls, fences, and small barriers guide the eye, how segments overlap terrain, how breaks and corners create paths, and how bases are dressed with grass, stones, and dirt. Do not copy any exact sprite, landmark, layout, faction symbol, UI element, palette identity, or recognizable composition from the reference.

Create original high-detail modern isometric pixel art for a fantasy strategy world map: low wall and fence segment sprite sheet, flat solid #ff00ff chroma-key magenta background, 16 isolated map barrier pieces arranged in a clean 4 columns x 4 rows grid. Low pale stone walls, wooden fence segments, broken corners, short gate gaps, mossy bases, small grass tufts, stones and dirt contact marks, readable at world-map scale, bottom-center pivot friendly, no tall castle towers, no large buildings, no UI, no text.

Style target: rich hand-authored terrain detail, painterly pixel clusters, crisp readable silhouettes, warm golden highlights, cool blue-green shadows, chunky pixel edges, no vector art, no smooth 3D render.

Negative prompt: flat texture, blurry, photorealistic, 3D render, vector illustration, low-detail mobile icon, plastic shading, plain noise, black background, white background, gray background, checker background, UI frame, text, watermark, logo, copied game screenshot, copied existing sprite, inconsistent perspective, tiny unreadable silhouette, magenta pixels inside the asset.
```

## Phase 2 Visual Reset Composition Assets

### 35. Mountain And Cliff Border Pack
```text
Original high-detail modern isometric pixel art fantasy world map mountain and cliff border sprite sheet, flat solid #ff00ff chroma-key magenta background, 12 isolated large edge pieces arranged in a clean 4 columns x 3 rows grid, jagged pale stone peaks, blue-gray shadow planes, warm sunlit ridges, moss and shrubs at the base, pieces designed to overlap into continuous map borders, bottom-center pivot friendly, no UI, no text, no copied composition.
```

### 36. Shoreline Edge Pack
```text
Original high-detail modern isometric pixel art fantasy world map shoreline edge sprite sheet, flat solid #ff00ff chroma-key magenta background, 16 isolated lake shore pieces arranged in a clean 4 columns x 4 rows grid, dark teal water edge, mossy grass banks, scattered stones, tiny reeds, lily pads, irregular alpha-broken borders, pieces designed to form a natural lake boundary, no UI, no text.
```

### 37. Forest Edge And Canopy Mass Pack
```text
Original high-detail modern isometric pixel art fantasy forest mass sprite sheet, flat solid #ff00ff chroma-key magenta background, 12 large isolated forest edge pieces arranged in a clean 4 columns x 3 rows grid, mixed conifers and broadleaf canopies, dark teal interior shadows, warm yellow-green rim highlights, visible trunks and undergrowth at the base, pieces designed to overlap into dense forest borders, bottom-center pivot friendly, no single tiny trees, no UI, no text.
```

### 38. Meadow Clearing Overlay Pack
```text
Original high-detail modern isometric pixel art fantasy meadow clearing brush overlay sprite sheet, flat solid #ff00ff chroma-key magenta background, 12 isolated irregular ground brush components arranged in a clean 4 columns x 3 rows grid, subtle dirt wear, small pale stones, tiny flowers, weeds, broken moss, no hard rectangular edges, no road stones, no black halo, designed for runtime alpha/tint/scale control to break up large grass fields.
```

### 39. Road Stone Piece Pack
```text
Original high-detail modern isometric pixel art fantasy road piece sprite sheet, flat solid #ff00ff chroma-key magenta background, 24 isolated narrow broken pale-stone path pieces arranged in a clean 6 columns x 4 rows grid, straight segments, soft curves, forks, caps, scattered missing stones, moss between stones, overgrown dirt edges, each piece alpha-broken and designed to be stamped along authored paths, no regular grid, no wide smooth ribbon, no UI, no text.
```

### 40. Road Dirt Underpaint Overlay Pack
```text
Original high-detail modern isometric pixel art fantasy road dirt brush underpaint sprite sheet, flat solid #ff00ff chroma-key magenta background, 12 isolated broad irregular dirt wear components arranged in a clean 4 columns x 3 rows grid, reddish brown compacted earth, wheel-worn dirt, tiny pebbles, dusty patches, broken organic edges, no need to match any exact grass texture, no hard tile transition borders, no rectangular stamps, designed for runtime alpha/tint/scale control under road stone details, no UI, no text.
```

### 41. Road Edge Vegetation Breakup Pack
```text
Original high-detail modern isometric pixel art fantasy road edge vegetation brush sprite sheet, flat solid #ff00ff chroma-key magenta background, 20 isolated small reusable vegetation components arranged in a clean 5 columns x 4 rows grid, grass bite marks, weeds, clover, moss patches, tiny flowers, small stones, broken dirt-edge fragments, designed for runtime placement, tint, alpha, scale, and shadow control, no directional transition system, no rectangular stamps, no UI, no text.
```

### 42. Low Wall And Fence Segment Pack
```text
Original high-detail modern isometric pixel art fantasy low wall and fence segment sprite sheet, flat solid #ff00ff chroma-key magenta background, 16 isolated map barrier pieces arranged in a clean 4 columns x 4 rows grid, low pale stone walls, wooden fence segments, broken corners, short gate gaps, mossy bases, small grass tufts, stones and dirt contact marks, readable at world-map scale, bottom-center pivot friendly, no tall castle towers, no large buildings, no UI, no text.
```
