# NidoWarWeb4X - Build Plan

**Status**: Phase 0 Complete (2026-04). Phase 1 Code Complete (2026-05-30). Phase 2 visual reset extension required before gameplay movement continues.

**Guiding Principles** (from CODE_DESIGN.md + user instructions)
- Every change must stay inside the strict segregation (engine / gameplay / universe/*).
- Every file must stay comfortably under 800 lines. Refactor immediately if approaching limit.
- Performance work (async, culling, off-main) starts early, not bolted on later.
- Art always goes through JSON manifest (ART_SPEC.md). No hard-coded sprite coords.
- Art direction is now gated by `docs/ART_DIRECTION.md`: original high-detail modern isometric pixel fantasy strategy art, not flat prototype terrain.
- Asset generation prompts live in `docs/ASSET_PROMPTS.md` and must avoid copying named commercial games while matching the requested quality bar.
- Phase completion requires evidence: build result, visual QA, and relevant performance/debug stats.
- We only proceed to the next step after the current step is reviewed and accepted.
- Use the project skill (/nido-plan) to keep this document updated and to generate the next micro-step details.

---

## Phase 0: Project Bootstrap & Codex (Current)

**Goal**: Reproducible dev environment + living documentation + skill that enforces rules.

**Completed in this setup session**:
- Folder + git + Vite + TS skeleton.
- Segregated directory tree (src/engine, src/gameplay, src/universe/*).
- docs/ with GAME_RULES.md, ART_SPEC.md, CODE_DESIGN.md.
- .grok/skills/nido-plan/SKILL.md (the codex).

**Next micro-steps (0.x) — still bootstrap, no gameplay code**:
- ~~0.1~~ **DONE** — PixiJS v8 chosen (see docs/DECISIONS.md).
- ~~0.2~~ **DONE** — Tooling kept minimal by design (see docs/DEV_NOTES.md).
- ~~0.3~~ **DONE** — Segregation proof complete. One tile drawn via engine/renderer (IRenderer + Canvas2DRenderer) + universe/tiles (TileData + TileView). Path aliases + build verified.

**Exit criteria for Phase 0**: `npm run dev` shows a working canvas. User can open on phone/tablet on local network. No game logic yet.

**0.1 Status**: Completed 2026-04. PixiJS added to dependencies. Decision record created.
**0.2 Status**: Completed 2026-04. Tooling philosophy recorded. Project stays deliberately light.
**0.3 Status**: Completed 2026-04. First cross-boundary render proof working. `npm run build` passes cleanly.

**Phase 0 Complete** (2026-04)
- All bootstrap + codex + segregation proof goals achieved.
- `npm run dev` works and is reachable from phone/tablet on LAN.
- Strict engine / gameplay / universe separation proven at the smallest scale.
- No game logic exists. All decisions documented.
- Ready for Phase 1 (Isometric World Rendering Core).

---

## Phase 1: Isometric World Rendering Core (Highest Risk / Highest Value)

**Goal**: Fast, culling-aware, manifest-driven isometric renderer that can handle hundreds of tiles + sprites on phone without dropping frames. Main thread stays free.

**Key challenges** (address in plan):
- Isometric projection math + tile sorting (Y-depth).
- Texture atlas / sprite sheet loading via JSON manifests.
- Viewport culling + frustum + occlusion (forests, etc.).
- Camera controls (drag, pinch zoom on touch) that feel good on tablet.
- Dirty-region / minimal redraw strategy.

**Suggested slice order** (each slice < 1-2 days work, reviewable):
- ~~1.1~~ **DONE** — Isometric math library (pure functions in src/engine/isometric.ts). worldToScreen, screenToWorld, tile bounds.
- ~~1.2~~ **DONE** — Asset loader + JSON manifest parser (src/engine/assets/). Types + async loadSpriteManifest with cache and validation. No texture loading yet.
- ~~1.3~~ **DONE** — First drawing integration proof. IsometricRenderer + manifest data flowing into world-space positioned tiles. Still using placeholder shapes.
- ~~1.4~~ **DONE** — First Pixi thin adapter (PixiRenderer implements IRenderer). Toggle in main.ts to switch between Canvas and Pixi paths. Abstraction holds.
- ~~1.5~~ **DONE** — Minimal Camera + PointerInput for panning. Drag to move the world-space view. Still placeholder tiles.
- ~~1.6~~ **DONE** — Small TileGrid (12x10) + basic camera-based culling in draw loop. Many more tiles visible when panned.
- ~~1.7~~ **DONE** — Real JSON manifest loaded via loadSpriteManifest and used to drive placeholder tile drawing.
- **Cleanup (post-1.7)** — Major hygiene: moved all accumulated proof logic out of main.ts into a proper technical module `src/engine/viewport/IsometricViewport.ts`. main.ts is now a true thin bootstrap (imports + one call). This rule is now explicitly reinforced in the codex skill.
- ~~1.8~~ **DONE (2026-05)** — Grid now renders real grass_tile.png using the exact grass_tile.json manifest (frame rect, center, scale, anchor). AssetLoader gained loadImage. Visual correction removed checkerboard proof terrain and centered a continuous manifest-sized grass field.
- ~~1.8b~~ **DONE (2026-05)** — IRenderer + IsometricRenderer now support manifest-driven drawSprite. Sprite registration moved out of IsometricViewport. TileView owns tile drawing and no temporary bias/sort hacks remain.
- ~~1.9~~ **DONE (2026-05)** — PixiJS path is the active default. Canvas comparison path was later removed on 2026-05-31 to keep one supported renderer.
- ~~1.10~~ **DONE (2026-05)** — Camera/viewport uses responsive canvas sizing, map centering, zoom-aware projection, and screen-space tile culling with a small border.
- ~~1.11~~ **DONE (2026-05)** — PointerInput supports drag pan, wheel zoom, pinch zoom, and tap selection callbacks. Selection has no gameplay meaning yet.
- ~~1.12~~ **DONE (2026-05)** — Added universe/tiles/MapModel.ts and renders a 50x50 map with culling through TileGrid + TileView.

**Phase 1 Visual Prototype Additions** (2026-05)
- Terrain branch explored a blended terrain-surface renderer instead of per-tile base sprites.
- Added clustered decals, sparse terrain props, and night torch lighting.
- These additions are accepted as visual prototypes on top of Phase 1, not as gameplay scope.

**Phase 1 Hardening (required before final close)**
- ~~1.13~~ **DONE (2026-05)** - Terrain texture art access moved behind JSON manifests.
- ~~1.14~~ **DONE (2026-05)** - Pixi renderer now uses persistent render layers and pooled sprites instead of destroying/recreating all display objects every frame.
- ~~1.15~~ **DONE (2026-05)** - Phase-gate render stats exposed at `window.__NIDOWAR_PHASE1_STATS__`; `?debug` logs a periodic console table; the latest sample is also mirrored to `document.documentElement.dataset.nidowarPhase1Stats` for browser QA tooling.
- ~~1.16~~ **DONE (2026-05)** - Map visual generation split out of `MapModel` into focused terrain, decoration, light-source, and random helper modules.
- ~~1.17~~ **DONE (2026-05-30)** - Recorded desktop + mobile-sized viewport QA evidence, including frame-time samples, visible counts, draw calls, pool size, and stage children.

**Phase 1 Gate Evidence (2026-05-30)**
- Build: `npm run build` passed.
- Desktop browser QA: 12 drag samples, p95 render work 1.70ms, max 1.70ms. Last sample: 709 visible tiles, 19 decals, 15 props, 6 torches, 48 draw calls, 47 visible sprites, 74 pooled sprites, 5 stage children. Screenshot: `docs/qa/phase1-desktop.png`.
- Mobile-sized browser QA (390x844): 12 drag samples, p95 render work 1.40ms, max 1.40ms. Last sample: 530 visible tiles, 18 decals, 10 props, 6 torches, 42 draw calls, 41 visible sprites, 52 pooled sprites, 5 stage children. Screenshot: `docs/qa/phase1-mobile.png`.
- Physical mid-range Android device QA remains the final optional acceptance check before relying on the 8ms target as a real-device number.

**Phase 1 Close Checklist**
- ~~`npm run build` passes.~~
- ~~Desktop browser QA captures screenshots after interaction.~~
- ~~Mobile-sized viewport QA captures screenshots after interaction.~~
- ~~`window.__NIDOWAR_PHASE1_STATS__` is recorded for desktop and mobile-sized viewport.~~
- ~~Browser p95 render work is under 8ms during panning.~~ Physical mid-range Android device QA is still optional pending device access.
- ~~Pixi path renders a 50x50 isometric map with terrain, decals, props, and torch lighting without tile registration drift.~~
- ~~Drag pan and wheel/pinch zoom keep terrain, decals, props, and lights registered together.~~
- ~~Rendering remains in engine/ and universe/tiles/. Gameplay rules remain absent.~~

**Exit criteria**: Smooth panning + zooming on a 50x50 tile map on phone. Frame time < 8ms on mid-range Android. All drawing code lives in engine/ or universe/tiles/. Zero gameplay rules.

**Performance note**: PixiJS is the only supported renderer. It provides batching, culling-friendly layers, texture atlases, and WebGL performance while keeping engine code small.

---

## Phase 2: Art Direction Reset, World Map Kit, Heroes & Basic Movement

**Goal**: Replace the Phase 1 prototype look with the real NidoWar visual pipeline before adding movement depth. The map must move toward a dense, authored, high-detail modern isometric pixel fantasy strategy look: layered terrain materials, irregular paths, tall forests/cliffs/props, landmarks, warm/cool lighting, readable heroes, and manifest-driven asset packs.

**2026-05-31 Reset Decision**
- The current Phase 2 implementation proves useful rendering technology, but it does not yet hit the visual target. The gap is not asset count; it is authored composition.
- Do not continue to 2.8 hero movement yet.
- Do not destructively delete current work. Keep the renderer, manifests, chunk cache, lighting code, and onboarded assets as reusable experiments.
- Temporarily roll back the presentation by adding visual modes/layer toggles that can hide roads, landmarks, torches, lighting, and scattered props while we rebuild the world map from the ground up.
- New acceptance ladder:
  1. Authored daylight meadow composition, no mountains, no water, no roads as a focus, no walls/fences as a focus, no lighting overlay, no landmarks. Start with a calm readable clearing framed by forest-border massing, clustered rocks, shrubs, subtle dirt wear, and contact/directional shadows.
  2. Roads and walls are the next grammar layer and must be built from reusable brush components plus runtime control: alpha, tint, scale, density masks, contact shadows, and composition placement. Do not generate art whose purpose is to transition from one exact material into another exact material.
  3. Add larger structures, stronger lighting, water, and mountain borders only after the meadow/forest and road/wall compositions read well in game.

**Non-negotiable visual bar**:
- The game must not continue with flat terrain plus sparse decals.
- World map, hero sprites, future units, battle arenas, and UI-adjacent icons must follow `docs/ART_DIRECTION.md`.
- Prompts and asset batches must come from `docs/ASSET_PROMPTS.md` or be added there before use.
- Reference screenshots are quality and density references only. Do not clone their exact sprites, UI, buildings, map layouts, or faction identities.
- Each art slice requires in-game screenshot QA before the slice is accepted.

**Suggested slice order**:
- ~~2.0~~ **DONE (2026-05-30)** - Art bible target accepted for implementation: `ART_DIRECTION.md` + `ASSET_PROMPTS.md` are the Phase 2 visual source of truth.
- ~~2.1~~ **DONE (2026-05-30)** - First asset pipeline upgrade: terrain materials now load through manifest-backed material ids (`grass`, `dirt`, `cobblestone`, `forest`, `water`) instead of a hardcoded grass/dust pair.
- ~~2.2~~ **DONE (2026-05-30)** - Placeholder terrain material kit added for grass meadow, reddish dirt path, cobblestone road, forest floor, and shallow water. These are deliberately temporary PNGs that can be replaced by generated art without source changes.
- ~~2.3~~ **DONE (2026-05-30)** - Added a mask-driven terrain transition resolver that sharpens material borders and adds terrain-specific edge accents so roads, forest floor, water, and dirt patches no longer rely on pure soft blending.
- ~~2.4~~ **DONE (2026-05-30)** - World decal and prop atlas v1 integrated: separate manifest-backed meadow, path, forest, and prop atlases with terrain-aware placement.
- ~~2.5~~ **DONE (2026-05-30)** - Tall occluder/depth pass: added separate occluder data generation, depth sorting, contact shadows, and placeholder forest/cliff silhouettes using current tree and rock atlases until final cliff/building art exists.
- ~~2.6~~ **DONE (2026-05-31)** - Lighting and color grade pass: replaced the blunt night-only overlay with renderer-level scene lighting profiles, warm torch cores, soft falloff, cool ambient shadows, day color grade, and directional occluder shadows.
- ~~2.7~~ **DONE (2026-05-31)** - World landmark kit v1: onboarded the first original structure sheet as `world_landmarks`, placed landmark occluders near buildable road/dirt spots, and onboarded the latest unit sprite assets with manifests for later hero/army/battle slices.
- ~~2.R0~~ **DONE (2026-05-31)** - Visual rollback controls added. URL modes `?visual=terrain-only`, `?visual=roads`, and `?visual=lit-final` gate roads, scattered props, landmarks, torches, and lighting without deleting code or assets.
- ~~2.R1~~ **DONE (2026-05-31)** - Authored composition mask model added. `WorldComposition` now owns deterministic meadow clearings, dirt wear, road spines, wall/fence lines, rock clusters, vegetation clusters, and disabled future forest/water masks for the first road/wall slice.
- **2.R2 Target comparison diagnosis** - Reframe the first gate from "bare meadow" to "target-like meadow/forest composition." The target wins because it has calm open center, dense forest borders, clustered rocks, lower-contrast grass detail, subtle dirt wear, strong shadows, and clear macro hierarchy. The current screenshot loses because it has uniform micro-noise, orange dirt islands, random rock scatter, weak shadows, and a visible map-edge void.
- **2.R3 Meadow and forest massing pass** - Build the first accepted daylight screenshot for comparison against the target image: a readable open meadow/clearing framed by forest-edge occluder masses, with clustered rocks near edges, restrained shrubs, subtle dirt wear, lower grass contrast, contact shadows, and directional tree/rock shadows. No roads as a focus, no walls/fences as a focus, no mountains, no water, no landmarks, no torches, no night/lighting overlay.
- **2.R4 Base art match gate** - Freeze 2.R1-2.R3 only when desktop and mobile screenshots prove the map reads as an authored forest-framed strategy clearing. Acceptance requires user confirmation that macro composition, palette, detail hierarchy, shadow integration, and 4X readability are moving toward the target reference. If it fails, iterate masks/density/palette before roads.
- **2.R5 Road and wall grammar pass** - Make roads narrow, broken, and authored: dirt brush underpaint, irregular pale stone components, missing stones, forks, grass bite marks, and small edge vegetation. Add low wall/fence segments that follow composition lines and create map structure without needing mountains or water.
- **2.R6 Road/wall composition gate** - Freeze roads/walls only when screenshots prove they improve the accepted meadow/forest composition without overwhelming the calm center. Performance target stays under 8ms p95 after warmup on browser QA.
- **2.R7 Lighting and shadow reintroduction** - Re-enable day grade, directional tree/building shadows, torch/window glow, and localized warm/cool contrast only after base composition passes. Lighting must add depth without washing out grass detail or hiding weak composition.
- **2.R8 Landmark and asset cluster pass** - Reintroduce structures, torches, resources, ruins, and interactables as authored points of interest tied to roads, walls, and clearings. Each landmark needs local terrain dressing: fence/stone edge, dirt wear, vegetation, small props, and contact shadows.
- **2.R9 Water and mountain border pass** - Add shorelines, lakes, cliffs, and mountain borders only after the simpler authored composition is accepted. Treat these as later environment features, not the foundation of the reset.
- **2.R10 Final Phase 2 visual gate** - Record checkpoint screenshots: road/wall base, forest/base, lit/assets, and final water/mountain variant if enabled. Include desktop/mobile stats, draw calls, visible counts, and a written visual review. Only then resume 2.8 hero map sprite work.
- **2.8 Hero map sprite v1 (DEFERRED until 2.R9)** - Add `universe/heroes/` with visual-only hero model/view, idle sprite, selection ring, banner, and manifest-driven anchor.
- **2.9 Army visual shell (DEFERRED)** - Add `universe/armies/` model with hero + hidden unit stack. The world map still shows only the hero/army leader sprite.
- **2.10 Movement preview visuals (DEFERRED)** - Add movement path dots, reachable markers, invalid marker, and selection state before rules-heavy pathfinding.
- **2.11 Async pathfinding and movement (DEFERRED)** - Add simple A* in an engine worker/job path, then gameplay movement command in `gameplay/movement/`.
- **2.12 Movement budget (DEFERRED)** - Add movement points per turn and end-of-turn deduction. Keep economy/fog out of scope.
- **2.13 Phase 2 visual/perf gate (REPLACED by 2.R9)** - Record desktop and mobile screenshots, render stats, draw calls, visible object counts, and side-by-side visual review notes against the art direction.
<!-- Previous 2.8-2.13 movement sequence is intentionally frozen by the visual reset extension above. -->
<!--
- **2.8 Hero map sprite v1** - Add `universe/heroes/` with visual-only hero model/view, idle sprite, selection ring, banner, and manifest-driven anchor.
- **2.9 Army visual shell** - Add `universe/armies/` model with hero + hidden unit stack. The world map still shows only the hero/army leader sprite.
- **2.10 Movement preview visuals** - Add movement path dots, reachable markers, invalid marker, and selection state before rules-heavy pathfinding.
- **2.11 Async pathfinding and movement** - Add simple A* in an engine worker/job path, then gameplay movement command in `gameplay/movement/`.
- **2.12 Movement budget** - Add movement points per turn and end-of-turn deduction. Keep economy/fog out of scope.
- **2.13 Phase 2 visual/perf gate** - Record desktop and mobile screenshots, render stats, draw calls, visible object counts, and side-by-side visual review notes against the art direction.
-->

**Exit**: The player can move a hero around a visually credible NidoWar world map with visible movement budget. The map no longer reads as prototype art. It demonstrates the final asset pipeline: dense terrain materials, alpha-blended composition overlays, clustered props, tall occluders, landmarks, lighting, and readable hero sprites. No economy or fog yet.

**Phase 2 Working Notes**
- 2026-05-30: `npm run build` passed after adding the placeholder terrain material pack.
- 2026-05-30: Browser stat sample after reload: initial cached terrain surface bake 603.2ms, then panning max 2.0ms across 4 drag samples. Last pan sample: 1036 visible tiles, 35 decals, 21 props, 6 torches, 70 draw calls, 69 visible sprites, 74 pooled sprites, 5 stage children.
- 2026-05-30: Screenshot capture through the in-app browser timed out and should be retried after the next visual slice.
- Follow-up performance note: the one-time terrain surface bake should move off the main thread or into an idle/preload job before Phase 2 close.
- 2026-05-30: After the 2.3 transition resolver, `npm run build` passed. Browser stat sample: initial cached terrain surface bake 771.2ms, then panning max 3.7ms across 4 drag samples. Last pan sample: 1036 visible tiles, 35 decals, 21 props, 6 torches, 70 draw calls, 69 visible sprites, 74 pooled sprites, 5 stage children.
- 2026-05-30: First generated grass meadow material accepted as a better visual fit and wired into `terrain_grass_meadow.json`. Browser check passed with no warnings/errors: initial terrain bake 678.9ms, panning max 2.2ms across 6 drag samples. Watch for visible tiling; if seams show up, regenerate as an explicitly seamless 1024x1024 or 512x512 material.
- 2026-05-30: 2.4 world atlas v1 added placeholder meadow/path/forest decal atlases and a mixed world prop atlas. `npm run build` passed. Browser QA at `?debug&phase2=world-atlas-v1`: no warnings/errors, initial terrain bake 570.1ms, panning max 2.2ms across 6 drag samples. Last pan sample: 869 visible tiles, 65 decals, 39 props, 6 torches, 118 draw calls, 117 visible sprites, 164 pooled sprites, 5 stage children. Screenshot: `docs/qa/phase2-2.4-world-atlas-v1.png`. Art is placeholder-quality; final generated atlases should replace these manifests without code changes.
- 2026-05-30: User-provided dirt material wired into `terrain_dirt_path.json`; grass/dirt transition sheet registered as `grass_dirt_transitions.json` and used lightly on dirt-edge decals. Daylight is now the default scene so art can be judged clearly; `?night` opts back into the night lighting overlay. `npm run build` passed. Browser QA at `?debug&phase2=daylight-dirt-transition`: no warnings/errors, initial terrain bake 660.0ms, panning max 2.1ms across 6 drag samples. Last pan sample: 856 visible tiles, 73 decals, 38 props, 6 torches, 118 draw calls, 118 visible sprites, 175 pooled sprites, 5 stage children. Browser screenshot capture still timed out on the WebGL canvas.
- 2026-05-30: User-provided meadow decal, grass/dirt transition, and rock prop sheets integrated. The placeholder world prop sheet was removed from placement after Browser QA showed it weakened the scene. `npm run build` passed. Browser QA at `?debug&phase2=prop-art-review-clean`: no warnings/errors, initial terrain bake 556.1ms, panning max 2.0ms across 6 drag samples. Last pan sample: 849 visible tiles, 73 decals, 38 rock props, 6 torches, 118 draw calls, 118 visible sprites, 178 pooled sprites, 5 stage children. Screenshot: `docs/qa/phase2-prop-art-review-clean.png`.
- 2026-05-30: User-provided forest cluster, shrub/plant, and torch sheets integrated through new/updated manifests: `world_tree_clusters`, `world_shrub_props`, and `torch`. Prop generation now supports tree, shrub, and rock atlases with terrain-aware selection; grass/dirt transition overlays were reduced after Browser QA showed the supplied transition art reads as stamped terrain swatches at runtime. `docs/ASSET_PROMPTS.md` was updated with generator-specific lessons for fixed sheet grids, bottom pivots, runtime torch sizing, transition edge bands, and authored forest massing. `npm run build` passed. Browser QA at `?debug&phase2=trees-torches-shrubs-v8`: no warnings/errors, initial terrain bake 554.0ms, after pan 1.5ms, visible sample 1039 tiles, 80 decals, 221 props, 6 torches, 109 draw calls, 109 visible sprites, 109 pooled sprites, 5 stage children. Screenshot: `docs/qa/phase2-trees-torches-shrubs.png`.
- Visual review note: the newest rocks, shrubs, trees, and torches are closer to the target asset fidelity, but the map still falls short of the Phase 2 visual bar because composition is still procedural scatter. The next art implementation should move toward authored biome/road chunks, stronger forest silhouettes, less grid-like cobblestone, landmark clusters, and lighting/shadow grouping rather than simply adding more decals.
- 2026-05-30: 2.5 tall occluder/depth pass added `OccluderGenerator`, `TileOccluderData`, `TileGrid.getOccluders()`, depth-keyed prop/occluder drawing, and soft contact shadows under tall sprites. Current implementation reuses `world_tree_clusters` and `world_rock_props` as placeholder tall forest/cliff silhouettes until dedicated cliff/building atlases arrive. `npm run build` passed. Browser QA at `?debug&phase2=tall-occluders-v1`: no warnings/errors; initial sample 1039 visible tiles, 80 decals, 221 props, 147 occluders, 6 torches, 602 draw calls, 602 visible sprites, 5 stage children, 3.0ms render work. Pan QA across 4 drags: max 3.4ms, max 575 draw calls. Browser screenshot capture timed out on the WebGL canvas, so visual acceptance should be rechecked manually in the running app.
- 2026-05-31: User-provided individual tree sheet and knight idle art onboarded as `world_tree_singles` and `world_knight_idle`. Forest rendering now builds groves from individual tree sprites in `OccluderGenerator` instead of relying on pre-baked tree cluster frames; ground prop generation no longer emits tree clumps, keeping tall trees in the occluder/depth/shadow path. `npm run build` passed. Browser QA at `?debug&phase2=tree-singles-v1`: no warnings/errors, visible sample 1039 tiles, 80 decals, 221 props, 194 occluders, 6 torches, 696 draw calls, 696 visible sprites, 5 stage children, 3.1ms render work. WebGL screenshot capture timed out in Browser, so final visual acceptance should be checked in the live app.
- 2026-05-31: 2.6 lighting pass added `SceneLightingDrawOptions`, day/night lighting profiles, torch light cores, screen-space grade overlays, and directional occluder shadows. Day is still the default; `?night` uses the stronger cool ambient profile. `npm run build` passed. Browser QA at `?debug&phase2=lighting-grade-v1` and `?debug&phase2=lighting-grade-v1&night`: no warnings/errors. Initial samples remained dominated by the full-resolution terrain bake at ~3.9s. Night pan QA across 4 drags: max 4.2ms, min 2.2ms, visible samples around 989-1052 tiles, 71-80 decals, 167-214 props, 152-204 occluders, 6 torches, and 715-904 draw calls. Browser WebGL screenshot capture timed out again, so visual acceptance should be checked in the live app.
- 2026-05-31: World map size increased from 50x50 to 90x90. Terrain rendering now bakes/caches 256px screen-space chunks instead of one full-map terrain canvas, keeping crisp material sampling while avoiding a 90x90 whole-world bake. `npm run build` passed. Browser QA at `?debug&phase2=large-map-prewarm-v1`: no warnings/errors; initial visible terrain chunk bake ~3.9s instead of the previous 90x90 full-map bake at ~21.4s. Pan samples after chunks/sprite pools are warm returned to ~1.8-2.8ms, but the first drag into a dense uncached area can still hitch while new terrain chunks and sprite pools are prepared. Follow-up optimization: spatial indexes for decals/props/occluders and renderer pool prewarming before Phase 2 gate.
- 2026-05-31: User-provided 1254x1254 cobblestone road material replaced the 128x128 placeholder through `terrain_cobblestone_road.json`. `npm run build` passed. Browser QA at `?debug&phase2=cobble-road-v1`: no warnings/errors; initial visible terrain chunk bake ~4.1s. Pan QA across 4 drags: max 4.9ms, min 2.2ms, visible samples around 1020-1038 tiles, 27-35 decals, 22-58 props, 19-59 occluders, 6 torches, and 151-320 draw calls.
- 2026-05-30: Ground material sampling scale increased after manual visual review showed grass and dirt details were too large. Grass now samples at 3.7x, dirt at 3.4x, forest at 3.2x, water at 2.4x, and cobblestone at 2.15x. `ASSET_PROMPTS.md` and `ART_SPEC.md` now specify flat `#ff00ff` chroma-key source sheets for sprites because direct alpha generation produced black-matted tree edges; checked-in runtime assets must still be alpha PNGs after local key removal. `npm run build` passed. Browser QA at `?debug&phase2=finer-terrain-scale`: no warnings/errors; initial terrain bake 840.6ms, pan QA max 2.8ms across 4 drags.
- 2026-05-31: 2.7 landmark kit v1 added `world_landmarks` from the first structure sheet and a focused `LandmarkGenerator` that places depth-sorted structures on nearby buildable road/dirt ground while avoiding water and dense forest. Twelve new unit/army art assets were also copied into runtime sprites with sidecar manifests for upcoming hero/army/battle slices; they are not rendered yet. `npm run build` passed. Browser QA at `?debug&phase2=landmarks-v1`: no warnings/errors, initial visible sample 1039 tiles, 22 decals, 22 props, 17 occluders, 6 torches, 140 draw calls, 138 visible sprites, and 2627.1ms while first chunks warmed. Pan QA across 4 drags: max 5.2ms, visible samples around 1020-1054 tiles, 16-99 occluders, 17-90 props, 134-482 draw calls. Screenshot: `docs/qa/phase2-landmarks-v1.png`.
- 2026-05-31: 2.R0 visual rollback controls added in `IsometricViewport` and `TerrainTextureView`. `?visual=terrain-only` suppresses cobblestone road terrain, road decals, scattered ground props, landmarks, torches, and lighting while keeping terrain and non-landmark occluders visible for forest/cliff mass review. `?visual=roads` restores roads and natural dressing while keeping landmarks, torches, and lighting off. `?visual=lit-final` is the current full presentation. `npm run build` passed.
- 2026-05-31: Visual reset strategy revised. Do not lead with transition art, mountains, water, landmarks, or roads/walls as the first focus. The next accepted slice should use authored composition masks plus reusable brush components for a calm meadow clearing, forest-border massing, clustered rocks, restrained shrubs, subtle dirt wear, and shadows. Runtime controls handle integration: alpha, tint, scale, density, contact shadows, and placement. Roads/walls follow after this base reads well; mountain/cliff and shoreline assets are deferred until meadow/forest and road/wall composition work.
- 2026-05-31: Hard rule added: no more generated custom art whose purpose is to transition from one exact terrain material into another exact terrain material. The target remains original high-detail painterly isometric pixel fantasy strategy art with dense authored terrain, readable silhouettes, warm light, cool shadows, and crisp chunky pixel clusters.
- 2026-05-31: First code pass for the hard rule landed. Runtime no longer loads or emits the `grass_dirt_transitions` atlas. Edge dressing now uses existing reusable `path_decals` and `meadow_decals` as brush components with per-decal alpha, tint, and scale controls. Renderer contracts now carry optional sprite/image `alpha` and `tint`; Pixi applies both, Canvas applies alpha for fallback. `npm run build` passed.
- 2026-05-31: Renderer path simplified. The Canvas fallback and `usePixi` switch were removed; Pixi is the only supported renderer. This keeps brush rendering features focused on the active code path instead of maintaining parallel behavior. `npm run build` passed.
- 2026-05-31: 2.R1 composition model implemented in `WorldComposition`. `TerrainGenerator` now reads shared composition masks for dirt wear, roads, forest, and water; water and forest masks intentionally return disabled values for the first road/wall acceptance slice. `DecorationGenerator` uses the same composition for wall/rock placeholder placement and edge brush dressing. `npm run build` passed. HTTP smoke check at `?debug&visual=roads` returned 200. In-app browser automation still fails with `windows sandbox failed: spawn setup refresh`, so screenshot/stat QA remains pending.
- 2026-05-31: 2.R2 was revised into the first base art match gate before road/wall grammar. Added `?visual=base-art`, which suppresses road masks in terrain sampling and hides roads, occluders, landmarks, torches, and lighting while keeping base decals and props visible. `npm run build` passed. HTTP smoke check at `?debug&visual=base-art` returned 200.
- 2026-05-31: Fixed the black vertical mark reported in `?visual=base-art`. The mark was a tall reed/cattail shrub frame reading as a random black line at gameplay scale, so base prop placement now uses only ground shrub frames until water/shore/reed grammar is intentionally added. Also hardened Pixi terrain chunk drawing against real seams: terrain canvas sprites keep fractional positions, opt out of pixel rounding, force updated nearest sampling, use a tiny terrain-only overdraw, and terrain chunks include a 2px deterministic overlap. `npm run build` passed. Browser QA at `?debug&visual=base-art`: visible sample 1039 tiles, 71 decals, 51 props, no occluders/torches/lighting, 147 draw calls. Screenshot: `docs/qa/base-art-black-line-fixed.png`.
- 2026-05-31: 2.R3 implementation started. `base-art` now shows non-landmark occluders so the first gate can include forest massing and shadows. `WorldComposition` now has a central meadow core, forest-border mask, forest-edge mask, quieter base dirt wear, and rock/vegetation masks biased toward forest edges. `OccluderGenerator` uses the shared composition, places tree clusters plus tree singles along forest borders, and keeps landmarks/torches/water/mountains/roads hidden in `base-art`. The renderer/page clear color changed from black to deep forest green so map-edge voids no longer dominate review screenshots. `npm run build` passed. Browser stats at `?debug&visual=base-art`: 1039 visible tiles, 50 decals, 67 props, 40 occluders, 0 torches, 262 draw calls after first-load terrain warmup. Browser screenshot capture timed out on the WebGL canvas, so visual acceptance requires the live in-app browser check.
- 2026-05-31: 2.R3 second pass added a true forest ring around the authored meadow core and starts the camera on that composition instead of the old map origin. Meadow-core masks now suppress random props/decals in the center. First density attempt overshot badly at 238 props, 325 occluders, and 1267 draw calls, so forest/prop probabilities were pruned. Current browser stats at `?debug&visual=base-art`: 344 visible tiles, 42 decals, 58 props, 136 occluders, 0 torches, 520 draw calls, with the first frame still dominated by terrain chunk warmup. `npm run build` passed.
- 2026-05-31: User comparison clarified the core miss: the target is not many tree/rock stamps around a field; it is large continuous canopy mass framing a quiet playable clearing. Third 2.R3 pass shifted occluder selection toward larger `tree_clusters`, reduced `tree_singles`, removed placeholder wall-rock props from the base-art pass, reduced shrub/rock prop probability, and softened/brightened grass terrain grading. Browser stats at `?debug&visual=base-art`: 344 visible tiles, 42 decals, 27 props, 98 occluders, 0 torches, 375 draw calls. `npm run build` passed.
- 2026-05-31: Base-art gate reset after user rejected the tree/rock direction as the wrong first checkpoint. `?visual=base-art` is now lawn-only: no roads, decals, props, occluders, landmarks, torches, or lighting. It blends the three provided 1254px lawn references as terrain textures (`terrain_lawn_a/b/c`) so the next review is strictly about grass color, texture density, and broad lawn readability before adding any tall objects back. Camera origin now centers the current world camera in the viewport so the lawn fills portrait browser checks instead of sitting at the top with dark void underneath. `npm run build` passed. Browser QA at `?debug&visual=base-art`: 1005 visible tiles, 0 decals, 0 props, 0 occluders, 0 torches, 20 draw calls. WebGL screenshot capture timed out after the reframing check, so visual acceptance should be done in the live in-app browser.

---

## Phase 3: Turn System & Time of Day

- 5 discrete turns per day (6am → 1am cycle).
- Turn resolution pipeline (gameplay/turns/TurnScheduler.ts).
- "End Turn" button / gesture.
- Time-of-day visual filter (optional, low priority).

---

## Phase 4: Fog of War & Exploration

- Per-army / per-empire visibility mask.
- Fog rendering (dark overlay + "seen but not visible" state).
- Reveal on hero movement.
- Performance: fog must be updated async, rendered efficiently (not per-tile every frame).

---

## Phase 5: Resources, Merchants & Economy (First Real 4X Feel)

- Resource nodes (mine, market...) in universe/resources/.
- Capture on move-into.
- Pay-turn merchant spawn logic (gameplay/economy/MerchantSystem.ts).
- Merchant pathing to nearest friendly town/castle (async).
- Stationing army on resource = protection + merchant escort.
- Enemy can intercept merchant (ownership transfer + reroute).

**This phase will heavily exercise the async job system and universe segregation.**

---

## Phase 6: Towns & Population

- Town model + population points.
- Weekly pop growth.
- Army enters town → growth at end of turn based on pop points.
- Simple recruitment stub.

---

## Phase 7: Castles, Capture & Production

- Castle capture rule (defeat + occupy 3 days).
- Building prerequisites for unit production.
- Production queue (very simple at first).

---

## Phase 8: Battle Mode Entry + Tactical Stub

- Detect "hero moves onto enemy hero tile" and switch to battle view.
- Battle arena must follow the same `ART_DIRECTION.md` target as the world map: high-detail modern pixel fantasy, embedded terrain hexes, warm/cool lighting, foreground silhouettes, midground obstacles, and distant backdrop layers.
- Build a manifest-driven battle arena kit before battle rules: hex base variants, elevated hex blocks, obstacles, torch/light props, contact shadows, and backdrop.
- Add first unit sprites from `docs/ASSET_PROMPTS.md`: idle sheets, strong silhouettes, feet anchors, and readable status markers.
- Minimal tactical grid can reuse engine rendering pieces, but it must not look like a sterile prototype board.
- Two units, one hero, attack/move on grid.
- Return to world map after "battle" resolves.
- Full battle rules come later; the art pipeline and unit readability must be proven in this phase.

---

## Phase 9: Defensive Structures & Terrain Rules

- Forest movement penalty + hide + archer penalty.
- Buildable towers/walls/doors that join fights.

---

## Later Phases (High Level)

- Hero skills / leveling
- Multiple empires + basic AI
- Save / load (indexedDB or JSON)
- Sound & music
- Polish, balance, tutorial, menus (minimal text)
- Multiplayer (optional, very late)

---

## How We Will Work (Process)

1. User reviews this plan (or proposes changes).
2. We pick the **next single micro-step** (e.g. "1.3").
3. The nido-plan skill generates a precise task breakdown + acceptance tests + which files are allowed to change (never more than ~3-4 small files per step).
4. We implement **only** that step.
5. We run the check/review skill (or manual) against CODE_DESIGN.md + ART_SPEC.md.
6. Only after user says "approved, next" do we move to the following micro-step.
7. The BUILD_PLAN.md is updated after every step with actual vs planned.

This process guarantees the project never becomes an unmaintainable ball of mud even after 2-3 years of new features.

---

**Current implementation decision**:
- PixiJS is the only supported renderer. Do not maintain a parallel Canvas fallback.
- Continue with the Phase 2 visual reset: reusable brush components, authored composition masks, runtime alpha/tint/scale/shadow control, and no custom material-transition art.
