# NidoWarWeb4X - Build Plan

**Status**: Phase 0 Complete (2026-04). Phase 1 Code Complete (2026-05-30). Phase 2 world map art pipeline started with placeholder material assets.

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
- ~~1.9~~ **DONE (2026-05)** — PixiJS path is the active default. Canvas remains behind the same IRenderer contract for fallback/dev comparison.
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

**Performance note**: If we choose pure Canvas here, we must build a minimal sprite batcher + texture atlas packer inside engine/. If PixiJS, the batching/culling is mostly free and our engine/ code stays < 300 lines for the renderer wrapper.

---

## Phase 2: Art Direction Reset, World Map Kit, Heroes & Basic Movement

**Goal**: Replace the Phase 1 prototype look with the real NidoWar visual pipeline before adding movement depth. The map must move toward a dense, authored, high-detail modern isometric pixel fantasy strategy look: layered terrain materials, irregular paths, tall forests/cliffs/props, landmarks, warm/cool lighting, readable heroes, and manifest-driven asset packs.

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
- **2.5 Tall occluder/depth pass** - Add layered forests, cliff/mountain edges, and building-height props with correct depth sorting, contact shadows, and optional occlusion rules.
- **2.6 Lighting and color grade pass** - Replace the current blunt night overlay with a richer lighting model: warm torch/window cores, soft falloff, cool ambient shadows, directional day shadows, and biome-specific grading.
- **2.7 World landmark kit v1** - Add original NidoWar structures: small house, guard tower, castle gate segment, mine entrance, magic shrine, campfire, and resource nodes.
- **2.8 Hero map sprite v1** - Add `universe/heroes/` with visual-only hero model/view, idle sprite, selection ring, banner, and manifest-driven anchor.
- **2.9 Army visual shell** - Add `universe/armies/` model with hero + hidden unit stack. The world map still shows only the hero/army leader sprite.
- **2.10 Movement preview visuals** - Add movement path dots, reachable markers, invalid marker, and selection state before rules-heavy pathfinding.
- **2.11 Async pathfinding and movement** - Add simple A* in an engine worker/job path, then gameplay movement command in `gameplay/movement/`.
- **2.12 Movement budget** - Add movement points per turn and end-of-turn deduction. Keep economy/fog out of scope.
- **2.13 Phase 2 visual/perf gate** - Record desktop and mobile screenshots, render stats, draw calls, visible object counts, and side-by-side visual review notes against the art direction.

**Exit**: The player can move a hero around a visually credible NidoWar world map with visible movement budget. The map no longer reads as prototype art. It demonstrates the final asset pipeline: dense terrain materials, transitions, clustered props, tall occluders, landmarks, lighting, and readable hero sprites. No economy or fog yet.

**Phase 2 Working Notes**
- 2026-05-30: `npm run build` passed after adding the placeholder terrain material pack.
- 2026-05-30: Browser stat sample after reload: initial cached terrain surface bake 603.2ms, then panning max 2.0ms across 4 drag samples. Last pan sample: 1036 visible tiles, 35 decals, 21 props, 6 torches, 70 draw calls, 69 visible sprites, 74 pooled sprites, 5 stage children.
- 2026-05-30: Screenshot capture through the in-app browser timed out and should be retried after the next visual slice.
- Follow-up performance note: the one-time terrain surface bake should move off the main thread or into an idle/preload job before Phase 2 close.
- 2026-05-30: After the 2.3 transition resolver, `npm run build` passed. Browser stat sample: initial cached terrain surface bake 771.2ms, then panning max 3.7ms across 4 drag samples. Last pan sample: 1036 visible tiles, 35 decals, 21 props, 6 torches, 70 draw calls, 69 visible sprites, 74 pooled sprites, 5 stage children.
- 2026-05-30: First generated grass meadow material accepted as a better visual fit and wired into `terrain_grass_meadow.json`. Browser check passed with no warnings/errors: initial terrain bake 678.9ms, panning max 2.2ms across 6 drag samples. Watch for visible tiling; if seams show up, regenerate as an explicitly seamless 1024x1024 or 512x512 material.
- 2026-05-30: 2.4 world atlas v1 added placeholder meadow/path/forest decal atlases and a mixed world prop atlas. `npm run build` passed. Browser QA at `?debug&phase2=world-atlas-v1`: no warnings/errors, initial terrain bake 570.1ms, panning max 2.2ms across 6 drag samples. Last pan sample: 869 visible tiles, 65 decals, 39 props, 6 torches, 118 draw calls, 117 visible sprites, 164 pooled sprites, 5 stage children. Screenshot: `docs/qa/phase2-2.4-world-atlas-v1.png`. Art is placeholder-quality; final generated atlases should replace these manifests without code changes.
- 2026-05-30: User-provided dirt material wired into `terrain_dirt_path.json`; grass/dirt transition sheet registered as `grass_dirt_transitions.json` and used lightly on dirt-edge decals. Daylight is now the default scene so art can be judged clearly; `?night` opts back into the night lighting overlay. `npm run build` passed. Browser QA at `?debug&phase2=daylight-dirt-transition`: no warnings/errors, initial terrain bake 660.0ms, panning max 2.1ms across 6 drag samples. Last pan sample: 856 visible tiles, 73 decals, 38 props, 6 torches, 118 draw calls, 118 visible sprites, 175 pooled sprites, 5 stage children. Browser screenshot capture still timed out on the WebGL canvas.

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

**Current recommendation (for user decision)**:
- Proceed with **PixiJS** for the rendering layer in Phase 1. It directly solves the "Unity/UE 2D optimizations" the user asked us to think about (batching, culling, atlas, WebGL). Our own code stays tiny and we get production perf on day one.
- If user prefers pure Canvas for maximum "small dependency" purity, we will implement a minimal custom batcher + culler (still possible but more work in engine/).

Please review the entire plan and reply with:
- Approval to proceed (with or without changes)
- Any phases/steps you want reordered, expanded, or removed
- Your decision on PixiJS vs pure Canvas
