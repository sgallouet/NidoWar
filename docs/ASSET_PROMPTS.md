# NidoWar Asset Prompts

Use these prompts for the next asset generation pass. They describe the current NidoWar visual target: original cartoon-anime isometric fantasy strategy art, saturated cel-shaded color, confident black ink demarcation, clean readable shapes, chroma-keyed sprite exports, and manifest-driven integration.

Do not include names of reference games, studios, or artists in generator prompts. Use the reference screenshots only to judge density, lighting, and quality.

## Current Target: Cartoon-Anime Inked Strategy Map

The new target is the provided 2026-05-31 cartoon/anime isometric castle-map reference. It is much more achievable than transparent pixel art because:
- Strong dark outlines make sprite borders easy to separate after chroma-key removal.
- Cel-shaded color bands are easier to match than noisy painterly pixel micro-detail.
- Readability comes from black demarcation, saturated palette, and clean shape grouping.
- Grass should be judged first before trees, roads, walls, water, mountains, units, or structures.

### Sampled Target Palette

These colors were sampled from `ChatGPT Image May 31, 2026, 08_23_47 PM.png`. Use the exact hex values in prompts and runtime tint targets.

**Grass field levels**
- Ink / deepest edge: `#051005`, `#0c1a08`, `#082606`
- Deep green shadow: `#0a440e`, `#11470c`, `#204608`
- Dark grass: `#2d4f0c`, `#41670a`, `#4c6f08`
- Mid grass: `#608306`, `#739507`, `#729708`
- Light grass: `#84a80a`, `#84aa0c`
- Bright accents: `#3e9811`, `#187317`

**Supporting map colors**
- Dirt and worn ground: `#d2a353`, `#b08f3f`, `#918360`, `#6e6142`, `#463c1e`
- Pale road / wall stone: `#dedad2`, `#d2caba`, `#c6bdab`, `#bcb29e`, `#948e7c`
- Stone shadow: `#353d3b`, `#434947`, `#58584b`, `#686759`
- Water: `#0172a8`, `#06638f`, `#064c72`, `#1990bc`
- Foliage shadow: `#0a440e`, `#204608`, `#34520a`, `#456408`

### Grass Acceptance Target

The first pass must match the target grass only:
- Saturated yellow-green lawn, not muted realistic grass.
- Large calm grass fields with clear color bands, not noisy photoreal texture.
- Black/dark olive ink strokes and contact creases visible inside the grass.
- Small hand-drawn tufts and short curved line details, but no rocks, trees, roads, water, buildings, mountains, or props.
- Opaque square terrain textures for blending, not transparent transition art.

## Hard Rule: No Custom Transition Art

Do not generate art whose job is to transition from one exact terrain material into another exact terrain material. These assets are hard to control, rarely match both surfaces, and tend to stamp badly in game.

Instead, generate reusable brush components that we combine at runtime: broad dirt wear, grass bite marks, loose stones, broken road pieces, moss, weeds, flowers, cracks, roots, pebbles, low walls, fence pieces, prop bases, separate shadows, and contact darkening.

Runtime controls do the integration work: alpha, tint, scale, density masks, contact shadows, and composition placement.

## Global Prompt Prefix

```text
Original cartoon-anime isometric fantasy strategy game art, saturated cel-shaded colors, confident black and dark-olive ink outlines, clean hand-painted shapes, readable 4X map silhouettes, bright yellow-green grass highlights, deep green shadow shapes, crisp demarcation between materials, no UI, no text, game-ready asset. Match this sampled palette: grass ink #051005 #0c1a08 #082606, deep grass #0a440e #11470c #204608, dark grass #2d4f0c #41670a #4c6f08, mid grass #608306 #739507 #729708, light grass #84a80a #84aa0c, dirt #d2a353 #b08f3f #918360, pale stone #dedad2 #d2caba #c6bdab, water #0172a8 #06638f #064c72.
```

## Global Negative Prompt

```text
flat texture, blurry, photorealistic, 3D render, realistic grass, vector illustration, low-detail mobile icon, plastic shading, plain noise, muted realistic palette, pastel grass, beige-only palette, no outlines, thin gray outlines, black background, white background, gray background, checker background, UI frame, text, watermark, logo, copied game screenshot, copied existing sprite, missing black outlines, weak demarcation, inconsistent perspective, tiny unreadable silhouette, magenta pixels inside the asset.
```

## Generation Settings
- Generate complete replacement sheets from scratch, not deltas or edits of previous attempts.
- Generate sprite sheets on a perfectly flat solid chroma-key magenta background: `#ff00ff`. Do not ask the generator for alpha transparency directly; it often fails and leaves dirty dark pixels.
- The magenta background must be one uniform color with no texture, no lighting, no shadows, no gradients, no antialiasing haze, and no floor plane.
- Do not use magenta anywhere inside the subject. The chroma-key removal tool should be able to remove every magenta pixel cleanly.
- Final checked-in sprite sheets should still become alpha PNGs after local chroma-key removal, but the generator prompt should request magenta.
- Use fixed sheet layouts so manifests can be written without hand-cropping:
  - Terrain materials: single opaque square, preferably `1254x1254` or at least `1024x1024`; use cartoon/anime cel-shaded grass bands, inked tufts, and dark outline creases, not photoreal micro-noise.
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
- Assets look best when requested as larger authored clusters with clean black/dark-olive outline language, not many tiny symbols. Tiny isolated icons read weakly on the map.
- Forest art must be large vertical masses: mixed conifers and broadleaf trees, dark teal interior shadows, warm rim highlights, visible trunks near the base, and undergrowth. Single scattered trees are not enough.
- Rocks work well when they have strong blue-gray shadow planes and warm beige top edges. Use them in clusters and barriers, not evenly sprinkled.
- Torches need a clear small-map version: tall enough to read, but with the flame and post inside one bottom-pivoted frame. Oversized presentation variants should not be mixed into the same runtime sheet unless they are in separate rows.
- Never rely on generated transition sheets as the terrain solution. The reference look is built from authored composition, broad alpha-blended brush overlays, placed detail pieces, tinting, scale variation, shadows, and controlled density.
- Brush art should be single-purpose and reusable: dirt wear, grass bite marks, small stone clusters, moss, cracks, weeds, prop bases, and vegetation breakup. Avoid directional edge-piece systems that require perfect tile matching.
- Road art is now the weakest visible material: avoid straight grid-like cobblestone lines. Request broken, irregular stones, overgrown edges, missing stones, and diagonal/curving path pieces.
- Tree sheets can look excellent as source art, but the runtime map needs authored forest regions, canopy clumps, and edge silhouettes. Do not rely on single random tree stamps to create the final strategy-map density.
- When a generator preview shows black around sprites, assume alpha failed. Regenerate on flat `#ff00ff` chroma key and remove it locally; do not accept black-matted tree edges.
- Current terrain art should now stop chasing pixel-art micro-detail. The first material target is clean cartoon/anime grass: saturated color bands, dark ink strokes, hand-drawn tufts, and broad readable lawn shapes.
- The immediate map target is the sampled cartoon/anime reference palette. Avoid sparse random scattering and avoid realistic grass texture.
- The next reset should not start with mountains, water, landmarks, roads/walls, forest, rocks, or unit sprites. First generate and blend simple grass-only terrain levels until the lawn color and ink language match the target.
- The first screenshots should prove the grass field works before trees, roads, low walls, mountains, water, lighting, or large landmarks are introduced.

---

## World Terrain Material Kit

### 1. Grass Meadow Terrain Texture
```text
Original cartoon-anime isometric fantasy strategy ground material, seamless grass meadow terrain texture matching the supplied target image exactly, saturated cel-shaded lawn with strong black and dark-olive ink demarcation, opaque square texture, 1254x1254 or 1024x1024, loops seamlessly. Use sampled grass palette: ink/deepest #051005 #0c1a08 #082606, deep shadow #0a440e #11470c #204608, dark grass #2d4f0c #41670a #4c6f08, mid grass #608306 #739507 #729708, light grass #84a80a #84aa0c, bright accents #3e9811 #187317. Broad readable color patches, short curved ink grass strokes, small hand-drawn tufts, clean anime/cel shading, no photoreal blades, no pixel-art noise, no flowers, no rocks, no dirt path, no trees, no water, no tile border, no grid.
```

### 1A. Grass Color Level Set For Runtime Blending
```text
Create three opaque square cartoon-anime isometric grass terrain textures for runtime blending, all matching the supplied target image palette and line language. Each texture is 1254x1254, seamless, no alpha, no objects, no roads, no trees, no rocks, no flowers, no water.

Texture A: calm mid lawn using mostly #608306 #739507 #729708 with light patches #84a80a #84aa0c and sparse ink strokes #0c1a08 #082606.
Texture B: darker shadow lawn using #0a440e #11470c #204608 #2d4f0c with black/dark-olive curved ink demarcation #051005 #0c1a08 and limited mid grass #608306.
Texture C: brighter sunlit lawn using #739507 #84a80a #84aa0c with small bright accents #3e9811 #187317 and enough dark outline strokes #082606 #204608 to match the target.

Style: original cartoon-anime isometric fantasy strategy map grass, cel-shaded bands, confident black ink outlines, clean hand-painted tufts, readable from 4X camera distance, no realistic grass, no soft painterly blur, no pixel-art micro-noise.
```

### 2. Dirt Path Terrain Texture
```text
Original cartoon-anime isometric fantasy strategy ground material, seamless dirt path texture matching the target palette, cel-shaded ochre compacted earth with black/dark-brown ink cracks and clean worn patches, sampled dirt colors #d2a353 #b08f3f #918360 #6e6142 #463c1e, tiny pale pebbles using #c6bdab #bcb29e, no giant stones, no large brush strokes, no tile border, no grid, opaque square texture, 1254x1254 or 1024x1024, loops seamlessly.
```

### 3. Cobblestone Road Texture
```text
Original cartoon-anime isometric fantasy strategy ground material, seamless old cobblestone road texture matching the target palette, small irregular pale stones with bold black/dark-gray ink gaps, sampled stone lights #dedad2 #d2caba #c6bdab #bcb29e #948e7c, stone shadows #353d3b #434947 #58584b #686759, tiny moss using #608306 #739507, chipped edges, no straight grid lines, no tile border, opaque square texture, 1254x1254 or 1024x1024, loops seamlessly.
```

### 4. Forest Floor Texture
```text
Original cartoon-anime isometric fantasy strategy ground material, seamless shadowed forest floor texture, cel-shaded deep green moss with black ink cracks and dark foliage shadows, sampled greens #0a440e #11470c #204608 #2d4f0c #41670a, tiny fallen leaves and exposed roots in #6e6142 #463c1e, no large plants, no giant root shapes, no tile border, no grid, opaque square texture, 1254x1254 or 1024x1024, loops seamlessly.
```

### 5. Shallow Water Texture
```text
Original cartoon-anime isometric fantasy strategy water material, seamless lake water texture matching the target palette, saturated cel-shaded blue with dark ink ripple lines, sampled water colors #0172a8 #06638f #064c72 #1990bc, darker depth #1c353f #2e4756, clean anime highlight shapes, occasional tiny lily pad hints very sparse, no shore edge, opaque square texture, 1254x1254 or 1024x1024, loops seamlessly.
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
Original cartoon-anime isometric fantasy meadow decal sprite sheet, flat solid #ff00ff chroma-key magenta background, 32 isolated small ground decals: flower clusters, tiny blue flowers, white flowers, yellow flowers, clover patches, weeds, short grass clumps, moss spots, small leaves, each decal 16x16 to 32x24 pixels, crisp readable inked shapes, no shadows baked too large.
```

### 9. Dirt And Road Small Decals
```text
Original cartoon-anime isometric fantasy path decal sprite sheet, flat solid #ff00ff chroma-key magenta background, 32 isolated small ground decals: pebble clusters, cracked dirt, loose cobbles, muddy patches, straw bits, tiny roots, wheel ruts, dry grass at edges, each decal 16x16 to 40x28 pixels, crisp readable inked shapes.
```

### 10. Forest Floor Decals
```text
Original cartoon-anime isometric fantasy forest decal sprite sheet, flat solid #ff00ff chroma-key magenta background, 32 isolated small decals: mushrooms, fern sprouts, fallen leaves, exposed roots, moss pads, tiny dark flowers, pine needles, small branches, each decal 16x16 to 48x32 pixels, cool shadow palette with warm highlights.
```

---

## World Prop Sheet

### 11. Rocks And Boulders
```text
Original cartoon-anime isometric fantasy rocks and boulders sprite sheet, flat solid #ff00ff chroma-key magenta background, 16 isolated props, gray-blue stone with warm beige highlights, moss patches, strong bottom contact shadow, varied sizes from small stone to medium boulder, bottom-center pivot friendly, no background, no UI.
```

### 12. Tall Grass And Shrubs
```text
Original cartoon-anime isometric fantasy vegetation prop sprite sheet, flat solid #ff00ff chroma-key magenta background, 20 isolated props arranged in a 5 columns x 4 rows grid, tall grass clumps, reeds, flowering shrubs, broadleaf bushes, red-purple accent plants, layered leaves, strong silhouettes, cool blue-green shadow bases, warm golden edge highlights, irregular dirt/moss contact bases, bottom-center pivot friendly, one prop per cell with padding, no UI, no text.
```

### 13. Forest Tree Cluster Props
```text
Original cartoon-anime isometric fantasy forest tree cluster sprite sheet, flat solid #ff00ff chroma-key magenta background, 12 isolated large vertical props arranged in a 4 columns x 3 rows grid, dense mixed conifer and broadleaf forest masses, overlapping canopies, dark teal and navy interior shadows, moss green and yellow-green highlights, warm rim light on top edges, visible trunks and rocks near the base, flowers and undergrowth at ground contact, irregular alpha-broken silhouette, bottom-center pivot friendly, each cluster large enough to occlude terrain and create depth, no single tiny trees, no UI, no text.
```

### 14. Cliff And Mountain Edge Props
```text
Original cartoon-anime isometric fantasy cliff and mountain props, flat solid #ff00ff chroma-key magenta background, 12 isolated rocky wall segments, jagged gray-blue stone, snow or pale highlights on sharp planes, dark crevices, moss at base, tall silhouettes, bottom-center pivot friendly, no background.
```

### 15. Torch And Light Source Props
```text
Original cartoon-anime isometric fantasy torch and brazier sprite sheet, flat solid #ff00ff chroma-key magenta background, runtime-ready small map props arranged in a clean grid, 16 isolated standing torches and braziers, bright white-yellow flame core, orange glow pixels, dark metal or wood supports, stone or dirt base, readable at small world-map size, consistent height per row, bottom-center pivot friendly, one torch per cell with padding, no oversized showcase torches mixed into runtime rows, no UI, no text.
```

### 16. Treasure And Interactable Props
```text
Original cartoon-anime isometric fantasy strategy map interactable props sprite sheet, flat solid #ff00ff chroma-key magenta background, 16 isolated props: treasure chests, resource crates, glowing shrine stones, signposts, banners, wells, small ruins, campfires, magic obelisk, strong silhouettes, warm/cool lighting accents, bottom-center pivot friendly.
```

---

## World Structure Kit

### 17. Small Medieval House
```text
Original cartoon-anime isometric fantasy medieval house prop, flat solid #ff00ff chroma-key magenta background, three-quarter isometric view, stone base, timber walls, blue slate roof, warm lit windows, moss and small flowers at base, strong readable silhouette, bottom-center pivot, no UI, no text.
```

### 18. Guard Tower
```text
Original cartoon-anime isometric fantasy guard tower prop, flat solid #ff00ff chroma-key magenta background, three-quarter isometric view, pale stone tower, blue roof, small banner, warm torch lights, crisp inked details, strong silhouette, bottom-center pivot, no UI, no text.
```

### 19. Castle Gate Segment
```text
Original cartoon-anime isometric fantasy castle wall and gate segment, flat solid #ff00ff chroma-key magenta background, three-quarter isometric view, pale stone walls, crenellations, wooden gate, torch sconces, warm light, mossy base, strong silhouette, bottom-center pivot, no UI, no text.
```

### 20. Mine Entrance Resource Node
```text
Original cartoon-anime isometric fantasy resource node, flat solid #ff00ff chroma-key magenta background, mine entrance built into rock, timber supports, mine cart, gold ore sparkle, lantern glow, moss and dirt at base, bottom-center pivot, no UI, no text.
```

### 21. Magic Shrine Resource Node
```text
Original cartoon-anime isometric fantasy magic shrine prop, flat solid #ff00ff chroma-key magenta background, ancient stone pedestal with cyan glowing rune, small candles, broken stones, moss and flowers, cool magical light plus warm candle highlights, bottom-center pivot, no UI, no text.
```

---

## World Hero And Army Visuals

### 22. World Hero Idle Sprite
```text
Original cartoon-anime isometric fantasy strategy hero sprite, flat solid #ff00ff chroma-key magenta background, full body standing on invisible ground plane, readable at map scale, heroic cloak, small banner pole, metal armor with blue and gold accents, warm rim light, cool shadow side, feet visible for anchor, 4 idle frames on one horizontal sprite sheet, no UI, no text.
```

### 23. World Hero Walk Sprite
```text
Original cartoon-anime isometric fantasy strategy hero walk cycle, flat solid #ff00ff chroma-key magenta background, same hero design, eight directional isometric map movement poses or 4 directional if space limited, readable silhouette, cloak and banner motion, feet visible for anchor, sprite sheet with even frame spacing, no UI, no text.
```

### 24. Selection Ring And Movement Marker
```text
Original cartoon-anime isometric fantasy strategy selection effects sprite sheet, flat solid #ff00ff chroma-key magenta background, glowing gold selection ring in isometric ellipse, blue movement path dots, reachable tile sparkle, invalid red cross marker, soft pixel glow, no text, no UI frame.
```

---

## Battle Arena Kit

### 25. Stone Desert Hex Base
```text
Original cartoon-anime isometric tactical fantasy battle arena hex tile sprite sheet, flat solid #ff00ff chroma-key magenta background, sandy stone hexes embedded in terrain, irregular carved edges, small cracks, pebbles, moss tufts, warm sunset highlights, cool shadow sides, 12 variants, each hex isolated with padding, readable hex shape but not sterile UI.
```

### 26. Grass Ruins Hex Base
```text
Original cartoon-anime isometric tactical fantasy battle arena hex tile sprite sheet, flat solid #ff00ff chroma-key magenta background, grassy ruined stone hexes, worn cobbles, moss, weeds, cracked slabs, warm light and cool shadows, 12 variants, each hex isolated with padding, readable hex shape but natural terrain surface.
```

### 27. Elevated Hex Blocks
```text
Original cartoon-anime isometric tactical fantasy battle arena elevated hex block sprite sheet, flat solid #ff00ff chroma-key magenta background, stone platform hexes with vertical cliff sides, cracked top surface, moss and grass tufts, strong side shadows, 8 height/edge variants, each isolated with padding.
```

### 28. Battle Arena Obstacles
```text
Original cartoon-anime isometric tactical fantasy battle arena obstacle sprite sheet, flat solid #ff00ff chroma-key magenta background, 20 isolated props: rock stacks, cactus, shrubs, broken pillars, dead trees, crates, low walls, torch stands, strong silhouettes, bottom-center pivots, readable blocking shapes.
```

### 29. Battle Backdrop Desert Oasis
```text
Original cartoon-anime fantasy battle background, wide 16:9 parallax backdrop, desert oasis at golden hour, palm silhouettes, distant trees, warm sky, cool ground shadows, clean cel-shaded clusters with dark ink demarcation, no UI, no text, background layer not transparent.
```

---

## Unit Style Prompts

### 30. Human Infantry Unit
```text
Original cartoon-anime fantasy tactical unit sprite, flat solid #ff00ff chroma-key magenta background, human infantry with shield and spear, readable at battle scale, strong silhouette, warm rim highlights, cool shadow side, feet visible for anchor, idle pose, 4-frame idle sprite sheet, no UI, no text.
```

### 31. Human Archer Unit
```text
Original cartoon-anime fantasy tactical unit sprite, flat solid #ff00ff chroma-key magenta background, human archer with cloak and bow, readable at battle scale, strong silhouette, warm rim highlights, cool shadow side, feet visible for anchor, idle pose, 4-frame idle sprite sheet, no UI, no text.
```

### 32. Beast Rider Unit
```text
Original cartoon-anime fantasy tactical unit sprite, flat solid #ff00ff chroma-key magenta background, armored beast rider on lizard-like mount, readable at battle scale, colorful feathers or cloth accents, strong silhouette, warm rim highlights, cool shadow side, feet or mount contact visible for anchor, 4-frame idle sprite sheet, no UI, no text.
```

### 33. Large Brute Unit
```text
Original cartoon-anime fantasy tactical unit sprite, flat solid #ff00ff chroma-key magenta background, large brute creature with heavy weapon, readable at battle scale, hunched powerful silhouette, saturated accent colors, warm rim highlights, cool shadow side, feet visible for anchor, 4-frame idle sprite sheet, no UI, no text.
```

### 34. Spell Impact Effect
```text
Original cartoon-anime fantasy battle effect sprite sheet, flat solid #ff00ff chroma-key magenta background, magical impact burst, bright white-yellow core, cyan and violet sparks, chunky pixel shards, 8 animation frames, no UI, no text, isolated with padding.
```

---

## First Asset Batch Recommendation

Generate in this order for the cartoon-anime visual reset:
1. Grass Color Level Set For Runtime Blending using the sampled target colors exactly.
2. Single accepted Grass Meadow Terrain Texture if the three-level blend is not coherent.
3. Small grass ink/tuft decal pack only after the base lawn color is accepted.
4. Dirt wear and pale road/stone pieces only after the grass screenshot matches the target.
5. Low walls, trees, rocks, structures, mountains, water, torches, units, and landmarks only after grass and road/wall basics pass.

Do not proceed to forest, roads, battle arena assets, or unit sprites until the grass-only world map proves it can match the target palette and black-outline language.

## Copy-Ready Reference Extraction Prompts

Use these when uploading a reference image to an art generator. The reference image is for shape language, density, composition logic, and lighting cues only. The generated assets must be original NidoWar art, not a copy of the reference image.

### 0. Grass Color Level Set From New Cartoon-Anime Target
```text
Analyze the attached cartoon/anime isometric strategy-map reference image and extract only its grass color language: saturated yellow-green lawn bands, deep green shadow islands, black/dark-olive ink demarcation strokes, short hand-drawn grass tufts, and clean cel-shaded surface grouping. Do not copy the castle, wall layout, roads, water, mountains, trees, rocks, fields, exact map composition, UI, faction identity, or any recognizable object from the reference.

Create three original opaque square grass terrain textures for runtime blending, 1254x1254 each, seamless, no alpha, no objects, no roads, no trees, no rocks, no flowers, no water, no buildings. Target the exact sampled palette from the reference: ink/deepest #051005 #0c1a08 #082606, deep shadow #0a440e #11470c #204608, dark grass #2d4f0c #41670a #4c6f08, mid grass #608306 #739507 #729708, light grass #84a80a #84aa0c, bright accents #3e9811 #187317.

Texture A: calm mid lawn using mostly #608306 #739507 #729708 with light patches #84a80a #84aa0c and sparse dark ink strokes.
Texture B: darker shadow lawn using #0a440e #11470c #204608 #2d4f0c with clear black/dark-olive curved ink demarcation.
Texture C: brighter sunlit lawn using #739507 #84a80a #84aa0c with small bright accents #3e9811 #187317 and enough dark outline strokes to match the target.

Style target: original cartoon-anime isometric fantasy strategy map grass, saturated cel-shaded color, confident black ink outlines, clean hand-painted tufts, readable from 4X camera distance, strong material demarcation, no realistic grass, no pixel-art micro-noise, no soft painterly blur, no vector art, no 3D render.

Negative prompt: photorealistic grass, muted realistic green, pastel grass, noisy pixel texture, soft blur, no outlines, thin gray outlines, giant clumps, flowers, rocks, dirt paths, roads, trees, buildings, water, mountains, UI, text, watermark, copied game screenshot, copied map layout.
```

### A. Meadow Clearing Overlay Pack From Reference
```text
Analyze the attached reference image and extract only its high-level ground composition logic: how clearings break up grass fields, where dirt wear appears, how small stones and flowers cluster, edge softness, detail density, alpha-blended overlap, and warm/cool lighting balance. Do not copy any exact sprite, landmark, layout, faction symbol, UI element, palette identity, or recognizable composition from the reference.

Create original cartoon-anime isometric fantasy strategy map art: meadow clearing brush overlay sprite sheet, flat solid #ff00ff chroma-key magenta background, 12 isolated irregular ground brush components arranged in a clean 4 columns x 3 rows grid. Subtle dirt wear, small pale stones, tiny flowers, weeds, broken moss, alpha-broken organic edges, no hard rectangular edges, no road stones, no black halo, designed for runtime alpha/tint/scale control to break up large grass fields, no UI, no text.

Style target: clean hand-painted terrain shapes, saturated cel-shaded color, crisp readable silhouettes, strong black and dark-olive ink outlines, bright yellow-green highlights, deep green shadows, no vector art, no smooth 3D render.

Negative prompt: flat texture, blurry, photorealistic, 3D render, vector illustration, low-detail mobile icon, plastic shading, plain noise, black background, white background, gray background, checker background, UI frame, text, watermark, logo, copied game screenshot, copied existing sprite, missing black outlines, weak demarcation, inconsistent perspective, tiny unreadable silhouette, magenta pixels inside the asset.
```

### B. Road Dirt Underpaint Overlay Pack From Reference
```text
Analyze the attached reference image and extract only its high-level road composition logic: how paths are readable through soft dirt wear, how grass overlaps path edges, how width varies, how curves and forks feel authored, and how detail density changes along the road. Do not copy any exact sprite, landmark, layout, faction symbol, UI element, palette identity, or recognizable composition from the reference.

Create original cartoon-anime isometric fantasy strategy map art: road dirt brush underpaint sprite sheet, flat solid #ff00ff chroma-key magenta background, 12 isolated broad irregular dirt wear components arranged in a clean 4 columns x 3 rows grid. Reddish brown compacted earth, wheel-worn dirt, tiny pebbles, dusty patches, broken organic edges, no need to match any exact grass texture, no hard tile transition borders, no rectangular stamps, designed for runtime alpha/tint/scale control under road stone details, no UI, no text.

Style target: clean hand-painted terrain shapes, saturated cel-shaded color, crisp readable silhouettes, strong black and dark-olive ink outlines, bright yellow-green highlights, deep green shadows, no vector art, no smooth 3D render.

Negative prompt: flat texture, blurry, photorealistic, 3D render, vector illustration, low-detail mobile icon, plastic shading, plain noise, black background, white background, gray background, checker background, UI frame, text, watermark, logo, copied game screenshot, copied existing sprite, missing black outlines, weak demarcation, inconsistent perspective, tiny unreadable silhouette, magenta pixels inside the asset.
```

### C. Road Stone Detail Piece Pack From Reference
```text
Analyze the attached reference image and extract only its high-level road detail language: how stones are sparse or broken, how missing stones create rhythm, how moss and grass interrupt the path, and how road detail supports composition without becoming a perfect grid. Do not copy any exact sprite, landmark, layout, faction symbol, UI element, palette identity, or recognizable composition from the reference.

Create original cartoon-anime isometric fantasy strategy map art: road stone detail brush sprite sheet, flat solid #ff00ff chroma-key magenta background, 24 isolated broken pale-stone detail components arranged in a clean 6 columns x 4 rows grid. Short stone clusters, missing stones, small curves, fork hints, caps, scattered loose stones, moss between stones, small grass tufts, each piece alpha-broken and designed for runtime placement on top of dirt underpaint, no regular grid, no wide smooth ribbon, no UI, no text.

Style target: clean hand-painted terrain shapes, saturated cel-shaded color, crisp readable silhouettes, strong black and dark-olive ink outlines, bright yellow-green highlights, deep green shadows, no vector art, no smooth 3D render.

Negative prompt: flat texture, blurry, photorealistic, 3D render, vector illustration, low-detail mobile icon, plastic shading, plain noise, black background, white background, gray background, checker background, UI frame, text, watermark, logo, copied game screenshot, copied existing sprite, missing black outlines, weak demarcation, inconsistent perspective, tiny unreadable silhouette, magenta pixels inside the asset.
```

### D. Low Wall And Fence Segment Pack From Reference
```text
Analyze the attached reference image and extract only its high-level boundary composition logic: how low walls, fences, and small barriers guide the eye, how segments overlap terrain, how breaks and corners create paths, and how bases are dressed with grass, stones, and dirt. Do not copy any exact sprite, landmark, layout, faction symbol, UI element, palette identity, or recognizable composition from the reference.

Create original cartoon-anime isometric fantasy strategy map art: low wall and fence segment sprite sheet, flat solid #ff00ff chroma-key magenta background, 16 isolated map barrier pieces arranged in a clean 4 columns x 4 rows grid. Low pale stone walls, wooden fence segments, broken corners, short gate gaps, mossy bases, small grass tufts, stones and dirt contact marks, readable at world-map scale, bottom-center pivot friendly, no tall castle towers, no large buildings, no UI, no text.

Style target: clean hand-painted terrain shapes, saturated cel-shaded color, crisp readable silhouettes, strong black and dark-olive ink outlines, bright yellow-green highlights, deep green shadows, no vector art, no smooth 3D render.

Negative prompt: flat texture, blurry, photorealistic, 3D render, vector illustration, low-detail mobile icon, plastic shading, plain noise, black background, white background, gray background, checker background, UI frame, text, watermark, logo, copied game screenshot, copied existing sprite, missing black outlines, weak demarcation, inconsistent perspective, tiny unreadable silhouette, magenta pixels inside the asset.
```

## Phase 2 Visual Reset Composition Assets

### 35. Mountain And Cliff Border Pack
```text
Original cartoon-anime isometric fantasy world map mountain and cliff border sprite sheet, flat solid #ff00ff chroma-key magenta background, 12 isolated large edge pieces arranged in a clean 4 columns x 3 rows grid, jagged pale stone peaks, blue-gray shadow planes, warm sunlit ridges, moss and shrubs at the base, pieces designed to overlap into continuous map borders, bottom-center pivot friendly, no UI, no text, no copied composition.
```

### 36. Shoreline Edge Pack
```text
Original cartoon-anime isometric fantasy world map shoreline edge sprite sheet, flat solid #ff00ff chroma-key magenta background, 16 isolated lake shore pieces arranged in a clean 4 columns x 4 rows grid, dark teal water edge, mossy grass banks, scattered stones, tiny reeds, lily pads, irregular alpha-broken borders, pieces designed to form a natural lake boundary, no UI, no text.
```

### 37. Forest Edge And Canopy Mass Pack
```text
Original cartoon-anime isometric fantasy forest mass sprite sheet, flat solid #ff00ff chroma-key magenta background, 12 large isolated forest edge pieces arranged in a clean 4 columns x 3 rows grid, mixed conifers and broadleaf canopies, dark teal interior shadows, warm yellow-green rim highlights, visible trunks and undergrowth at the base, pieces designed to overlap into dense forest borders, bottom-center pivot friendly, no single tiny trees, no UI, no text.
```

### 38. Meadow Clearing Overlay Pack
```text
Original cartoon-anime isometric fantasy meadow clearing brush overlay sprite sheet, flat solid #ff00ff chroma-key magenta background, 12 isolated irregular ground brush components arranged in a clean 4 columns x 3 rows grid, subtle dirt wear, small pale stones, tiny flowers, weeds, broken moss, no hard rectangular edges, no road stones, no black halo, designed for runtime alpha/tint/scale control to break up large grass fields.
```

### 39. Road Stone Piece Pack
```text
Original cartoon-anime isometric fantasy road piece sprite sheet, flat solid #ff00ff chroma-key magenta background, 24 isolated narrow broken pale-stone path pieces arranged in a clean 6 columns x 4 rows grid, straight segments, soft curves, forks, caps, scattered missing stones, moss between stones, overgrown dirt edges, each piece alpha-broken and designed to be stamped along authored paths, no regular grid, no wide smooth ribbon, no UI, no text.
```

### 40. Road Dirt Underpaint Overlay Pack
```text
Original cartoon-anime isometric fantasy road dirt brush underpaint sprite sheet, flat solid #ff00ff chroma-key magenta background, 12 isolated broad irregular dirt wear components arranged in a clean 4 columns x 3 rows grid, reddish brown compacted earth, wheel-worn dirt, tiny pebbles, dusty patches, broken organic edges, no need to match any exact grass texture, no hard tile transition borders, no rectangular stamps, designed for runtime alpha/tint/scale control under road stone details, no UI, no text.
```

### 41. Road Edge Vegetation Breakup Pack
```text
Original cartoon-anime isometric fantasy road edge vegetation brush sprite sheet, flat solid #ff00ff chroma-key magenta background, 20 isolated small reusable vegetation components arranged in a clean 5 columns x 4 rows grid, grass bite marks, weeds, clover, moss patches, tiny flowers, small stones, broken dirt-edge fragments, designed for runtime placement, tint, alpha, scale, and shadow control, no directional transition system, no rectangular stamps, no UI, no text.
```

### 42. Low Wall And Fence Segment Pack
```text
Original cartoon-anime isometric fantasy low wall and fence segment sprite sheet, flat solid #ff00ff chroma-key magenta background, 16 isolated map barrier pieces arranged in a clean 4 columns x 4 rows grid, low pale stone walls, wooden fence segments, broken corners, short gate gaps, mossy bases, small grass tufts, stones and dirt contact marks, readable at world-map scale, bottom-center pivot friendly, no tall castle towers, no large buildings, no UI, no text.
```


