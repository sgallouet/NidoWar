# NidoWarWeb4X - Build Plan

**Status**: Phase 0 Complete (2026-04). Phase 1 Complete (2026-05). Next: Phase 2 hero/army visual foundations.

**Guiding Principles** (from CODE_DESIGN.md + user instructions)
- Every change must stay inside the strict segregation (engine / gameplay / universe/*).
- Every file must stay comfortably under 800 lines. Refactor immediately if approaching limit.
- Performance work (async, culling, off-main) starts early, not bolted on later.
- Art always goes through JSON manifest (ART_SPEC.md). No hard-coded sprite coords.
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

**Phase 1 Complete** (2026-05)
- `npm run build` passes.
- Browser QA passed on desktop and mobile-sized viewport.
- Pixi path renders the manifest grass sprite over a 50x50 isometric map.
- Drag pan and wheel/pinch zoom keep tile registration continuous.
- Rendering remains in engine/, tile data/view ownership remains in universe/tiles/, and gameplay rules are still absent.

**Exit criteria**: Smooth panning + zooming on a 50x50 tile map on phone. Frame time < 8ms on mid-range Android. All drawing code lives in engine/ or universe/tiles/. Zero gameplay rules.

**Performance note**: If we choose pure Canvas here, we must build a minimal sprite batcher + texture atlas packer inside engine/. If PixiJS, the batching/culling is mostly free and our engine/ code stays < 300 lines for the renderer wrapper.

---

## Phase 2: Heroes, Armies & Basic Movement

1. Hero entity (universe/heroes/) — visual only at first.
2. Army composition model (universe/armies/) — hero + hidden unit stack. Map only shows hero sprite.
3. Movement points per turn + simple pathfinding (A* on tiles, async in Web Worker).
4. "Move hero" command from input → gameplay/movement/ system.
5. End-of-turn deduction of movement points. Limited actions.

**Exit**: Player can move a hero around the map with visible movement budget. Pathing feels good. No economy or fog yet.

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

- Detect "hero moves onto enemy hero tile" → switch to battle view.
- Minimal  tactical grid (reuse some isometric tech or new ortho grid?).
- Two units, one hero, attack/move on grid.
- Return to world map after "battle" resolves.
- (Full HoMM battle rules come much later or in parallel vertical slice.)

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
