# NidoWar Asset Prompts

Use these prompts for the next asset generation pass. They describe an original NidoWar visual target: high-detail modern isometric pixel fantasy strategy art, rich terrain storytelling, painterly pixel clusters, dramatic warm/cool lighting, transparent sprite exports, and manifest-driven integration.

Do not include names of reference games, studios, or artists in generator prompts. Use the reference screenshots only to judge density, lighting, and quality.

## Global Prompt Prefix

```text
Original high-detail modern isometric pixel art for a fantasy strategy game, rich hand-authored terrain detail, painterly pixel clusters, crisp readable silhouettes, warm golden highlights and cool blue-green shadows, chunky pixel edges, no vector art, no smooth 3D render, no UI, no text, game-ready asset, clean alpha transparency where requested.
```

## Global Negative Prompt

```text
flat texture, blurry, photorealistic, 3D render, vector illustration, low-detail mobile icon, plastic shading, plain noise, black background, white background, UI frame, text, watermark, logo, copied game screenshot, copied existing sprite, inconsistent perspective, tiny unreadable silhouette.
```

## Generation Settings
- Prefer nearest-neighbor pixel output or generate larger and downsample with nearest-neighbor cleanup.
- Keep all sprite sheets on transparent background.
- Ask for isolated assets with enough padding to crop into JSON manifest frames.
- Use fixed camera direction within a pack.
- After generation, clean frames manually if alpha edges are dirty.

---

## World Terrain Material Kit

### 1. Grass Meadow Terrain Texture
```text
Original high-detail modern isometric pixel art fantasy strategy ground material, seamless grass meadow terrain texture, moss green and olive base with yellow-green highlights, cool teal shadow flecks, hand-painted pixel clusters, tiny weeds and color variation, no flowers or rocks, no tile border, no grid, opaque square texture, 512x512, loops seamlessly.
```

### 2. Dirt Path Terrain Texture
```text
Original high-detail modern isometric pixel art fantasy strategy ground material, seamless reddish brown dirt path texture, ochre dust, compacted earth, tiny pebbles, cracked dry patches, darker damp soil clusters, painterly pixel clusters, no tile border, no grid, opaque square texture, 512x512, loops seamlessly.
```

### 3. Cobblestone Road Texture
```text
Original high-detail modern isometric pixel art fantasy strategy ground material, seamless old cobblestone road texture, irregular pale gray and warm beige stones, dark blue-gray cracks, moss between stones, chipped edges, painterly pixel clusters, no tile border, no grid, opaque square texture, 512x512, loops seamlessly.
```

### 4. Forest Floor Texture
```text
Original high-detail modern isometric pixel art fantasy strategy ground material, seamless shadowed forest floor texture, deep green moss, fallen leaves, exposed roots, dark teal shadow clusters, small brown twigs, no large plants, no tile border, no grid, opaque square texture, 512x512, loops seamlessly.
```

### 5. Shallow Water Texture
```text
Original high-detail modern isometric pixel art fantasy strategy water material, seamless dark teal shallow water texture, small pixel ripples, navy depth patches, muted cyan highlights, occasional lily pad hints very sparse, no shore edge, opaque square texture, 512x512, loops seamlessly.
```

### 6. Grass To Dirt Transition Mask Sprites
```text
Original high-detail modern isometric pixel art terrain transition sprites, grass blending into reddish dirt with irregular overgrown edge, moss tufts, small pebbles, painterly pixel clusters, transparent background, 8 directional transition pieces on one sprite sheet, each piece isolated with padding, no grid lines, no UI.
```

### 7. Dirt To Cobblestone Transition Mask Sprites
```text
Original high-detail modern isometric pixel art terrain transition sprites, broken cobblestone road fading into reddish dirt, loose stones, dusty edges, moss cracks, transparent background, 8 directional transition pieces on one sprite sheet, each piece isolated with padding, no grid lines, no UI.
```

---

## World Decal Sheet

### 8. Meadow Small Decals
```text
Original high-detail modern isometric pixel art fantasy meadow decal sprite sheet, transparent background, 32 isolated small ground decals: flower clusters, tiny blue flowers, white flowers, yellow flowers, clover patches, weeds, short grass clumps, moss spots, small leaves, each decal 16x16 to 32x24 pixels, crisp readable pixels, no shadows baked too large.
```

### 9. Dirt And Road Small Decals
```text
Original high-detail modern isometric pixel art fantasy path decal sprite sheet, transparent background, 32 isolated small ground decals: pebble clusters, cracked dirt, loose cobbles, muddy patches, straw bits, tiny roots, wheel ruts, dry grass at edges, each decal 16x16 to 40x28 pixels, crisp readable pixels.
```

### 10. Forest Floor Decals
```text
Original high-detail modern isometric pixel art fantasy forest decal sprite sheet, transparent background, 32 isolated small decals: mushrooms, fern sprouts, fallen leaves, exposed roots, moss pads, tiny dark flowers, pine needles, small branches, each decal 16x16 to 48x32 pixels, cool shadow palette with warm highlights.
```

---

## World Prop Sheet

### 11. Rocks And Boulders
```text
Original high-detail modern isometric pixel art fantasy rocks and boulders sprite sheet, transparent background, 16 isolated props, gray-blue stone with warm beige highlights, moss patches, strong bottom contact shadow, varied sizes from small stone to medium boulder, bottom-center pivot friendly, no background, no UI.
```

### 12. Tall Grass And Shrubs
```text
Original high-detail modern isometric pixel art fantasy vegetation prop sprite sheet, transparent background, 20 isolated props, tall grass clumps, shrubs, reeds, flowering bushes, red-purple accent plants, layered leaves, strong silhouettes, cool shadow bases, bottom-center pivot friendly.
```

### 13. Forest Tree Cluster Props
```text
Original high-detail modern isometric pixel art fantasy forest tree cluster sprite sheet, transparent background, 12 isolated props, dense layered canopies, pine and broadleaf variants, dark teal shadow masses, bright mossy highlights, visible trunks at base, irregular silhouettes, bottom-center pivot friendly, sizes from 64x96 to 160x180.
```

### 14. Cliff And Mountain Edge Props
```text
Original high-detail modern isometric pixel art fantasy cliff and mountain props, transparent background, 12 isolated rocky wall segments, jagged gray-blue stone, snow or pale highlights on sharp planes, dark crevices, moss at base, tall silhouettes, bottom-center pivot friendly, no background.
```

### 15. Torch And Light Source Props
```text
Original high-detail modern isometric pixel art fantasy torch props sprite sheet, transparent background, 8 isolated standing torches and braziers, bright golden flame core, orange glow pixels, dark metal or wood supports, readable at small size, include separate flame frames for 4-frame idle animation, bottom-center pivot friendly.
```

### 16. Treasure And Interactable Props
```text
Original high-detail modern isometric pixel art fantasy strategy map interactable props sprite sheet, transparent background, 16 isolated props: treasure chests, resource crates, glowing shrine stones, signposts, banners, wells, small ruins, campfires, magic obelisk, strong silhouettes, warm/cool lighting accents, bottom-center pivot friendly.
```

---

## World Structure Kit

### 17. Small Medieval House
```text
Original high-detail modern isometric pixel art fantasy medieval house prop, transparent background, three-quarter isometric view, stone base, timber walls, blue slate roof, warm lit windows, moss and small flowers at base, strong readable silhouette, bottom-center pivot, no UI, no text.
```

### 18. Guard Tower
```text
Original high-detail modern isometric pixel art fantasy guard tower prop, transparent background, three-quarter isometric view, pale stone tower, blue roof, small banner, warm torch lights, crisp pixel details, strong silhouette, bottom-center pivot, no UI, no text.
```

### 19. Castle Gate Segment
```text
Original high-detail modern isometric pixel art fantasy castle wall and gate segment, transparent background, three-quarter isometric view, pale stone walls, crenellations, wooden gate, torch sconces, warm light, mossy base, strong silhouette, bottom-center pivot, no UI, no text.
```

### 20. Mine Entrance Resource Node
```text
Original high-detail modern isometric pixel art fantasy resource node, transparent background, mine entrance built into rock, timber supports, mine cart, gold ore sparkle, lantern glow, moss and dirt at base, bottom-center pivot, no UI, no text.
```

### 21. Magic Shrine Resource Node
```text
Original high-detail modern isometric pixel art fantasy magic shrine prop, transparent background, ancient stone pedestal with cyan glowing rune, small candles, broken stones, moss and flowers, cool magical light plus warm candle highlights, bottom-center pivot, no UI, no text.
```

---

## World Hero And Army Visuals

### 22. World Hero Idle Sprite
```text
Original high-detail modern isometric pixel art fantasy strategy hero sprite, transparent background, full body standing on invisible ground plane, readable at map scale, heroic cloak, small banner pole, metal armor with blue and gold accents, warm rim light, cool shadow side, feet visible for anchor, 4 idle frames on one horizontal sprite sheet, no UI, no text.
```

### 23. World Hero Walk Sprite
```text
Original high-detail modern isometric pixel art fantasy strategy hero walk cycle, transparent background, same hero design, eight directional isometric map movement poses or 4 directional if space limited, readable silhouette, cloak and banner motion, feet visible for anchor, sprite sheet with even frame spacing, no UI, no text.
```

### 24. Selection Ring And Movement Marker
```text
Original high-detail modern isometric pixel art fantasy strategy selection effects sprite sheet, transparent background, glowing gold selection ring in isometric ellipse, blue movement path dots, reachable tile sparkle, invalid red cross marker, soft pixel glow, no text, no UI frame.
```

---

## Battle Arena Kit

### 25. Stone Desert Hex Base
```text
Original high-detail modern tactical fantasy battle arena hex tile sprite sheet, transparent background, sandy stone hexes embedded in terrain, irregular carved edges, small cracks, pebbles, moss tufts, warm sunset highlights, cool shadow sides, 12 variants, each hex isolated with padding, readable hex shape but not sterile UI.
```

### 26. Grass Ruins Hex Base
```text
Original high-detail modern tactical fantasy battle arena hex tile sprite sheet, transparent background, grassy ruined stone hexes, worn cobbles, moss, weeds, cracked slabs, warm light and cool shadows, 12 variants, each hex isolated with padding, readable hex shape but natural terrain surface.
```

### 27. Elevated Hex Blocks
```text
Original high-detail modern tactical fantasy battle arena elevated hex block sprite sheet, transparent background, stone platform hexes with vertical cliff sides, cracked top surface, moss and grass tufts, strong side shadows, 8 height/edge variants, each isolated with padding.
```

### 28. Battle Arena Obstacles
```text
Original high-detail modern tactical fantasy battle arena obstacle sprite sheet, transparent background, 20 isolated props: rock stacks, cactus, shrubs, broken pillars, dead trees, crates, low walls, torch stands, strong silhouettes, bottom-center pivots, readable blocking shapes.
```

### 29. Battle Backdrop Desert Oasis
```text
Original high-detail modern pixel art fantasy battle background, wide 16:9 parallax backdrop, desert oasis at golden hour, palm silhouettes, distant trees, warm sky, cool ground shadows, painterly pixel clusters, no UI, no text, background layer not transparent.
```

---

## Unit Style Prompts

### 30. Human Infantry Unit
```text
Original high-detail modern pixel art fantasy tactical unit sprite, transparent background, human infantry with shield and spear, readable at battle scale, strong silhouette, warm rim highlights, cool shadow side, feet visible for anchor, idle pose, 4-frame idle sprite sheet, no UI, no text.
```

### 31. Human Archer Unit
```text
Original high-detail modern pixel art fantasy tactical unit sprite, transparent background, human archer with cloak and bow, readable at battle scale, strong silhouette, warm rim highlights, cool shadow side, feet visible for anchor, idle pose, 4-frame idle sprite sheet, no UI, no text.
```

### 32. Beast Rider Unit
```text
Original high-detail modern pixel art fantasy tactical unit sprite, transparent background, armored beast rider on lizard-like mount, readable at battle scale, colorful feathers or cloth accents, strong silhouette, warm rim highlights, cool shadow side, feet or mount contact visible for anchor, 4-frame idle sprite sheet, no UI, no text.
```

### 33. Large Brute Unit
```text
Original high-detail modern pixel art fantasy tactical unit sprite, transparent background, large brute creature with heavy weapon, readable at battle scale, hunched powerful silhouette, saturated accent colors, warm rim highlights, cool shadow side, feet visible for anchor, 4-frame idle sprite sheet, no UI, no text.
```

### 34. Spell Impact Effect
```text
Original high-detail modern pixel art fantasy battle effect sprite sheet, transparent background, magical impact burst, bright white-yellow core, cyan and violet sparks, chunky pixel shards, 8 animation frames, no UI, no text, isolated with padding.
```

---

## First Asset Batch Recommendation

Generate in this order so the next implementation step can improve the map quickly:
1. Grass meadow texture.
2. Dirt path texture.
3. Grass-to-dirt transition sprites.
4. Meadow small decals.
5. Rocks and boulders.
6. Tall grass and shrubs.
7. Forest tree cluster props.
8. Torch and light source props.
9. World hero idle sprite.
10. Selection ring and movement marker.

Do not proceed to battle arena assets until the world map art pipeline proves it can match the density and lighting bar.
