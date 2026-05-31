# NidoWar Technical Decisions

## 2026-04 — Rendering Backend: PixiJS v8

**Decision**: Use PixiJS v8 (via `pixi.js` package) for the rendering layer.

**Rationale**:
- Directly implements the Unity/UE4-style 2D optimizations the project requires (automatic sprite batching, frustum culling, texture atlases, WebGL rendering, object pooling patterns, dirty rectangles).
- Allows the custom engine/ layer to stay extremely small and focused on game-specific concerns (isometric projection, async job scheduling, manifest-driven sprites, camera).
- Excellent mobile performance (60 fps target on mid-range phones/tablets) with minimal code on our side.
- Pixi v8 is modular; we only pull what we use.
- Pure Canvas 2D alternative would require us to build and maintain our own batcher + culler inside engine/, risking larger files and more maintenance — violating the "small code is best" rule.

**Constraints enforced**:
- All Pixi usage is encapsulated behind a thin adapter in `src/engine/renderer/`.
- No Pixi types or direct imports are allowed outside engine/.
- Art continues to be loaded exclusively through JSON manifests (see ART_SPEC.md).
- Main thread remains free for gameplay logic.

**Status**: Approved. Implementation of the thin adapter begins in Phase 1 (after Phase 0 hello-world proof).

**Revisit trigger**: If bundle size or startup time on low-end devices becomes unacceptable, re-evaluate a custom lightweight Canvas path.

---

## 2026-05 - Phase 1 Render Layer Hardening

**Decision**: Keep the Pixi adapter behind the small renderer contract, require persistent render layers and pooled sprites for map rendering, and treat Pixi as the only supported runtime renderer.

**Rationale**:
- The terrain visual prototype added decals, props, torches, and lighting. Destroying and recreating Pixi display objects every render would create avoidable GC pressure during camera pan/zoom.
- Persistent layers (`terrain`, `decal`, `prop`, `unit`, `lighting`) make Phase 2 hero/army rendering explicit instead of adding more one-off loops to the viewport.
- `window.__NIDOWAR_PHASE1_STATS__` provides a lightweight phase-gate signal without adding a testing framework yet.

**Constraints enforced**:
- Renderer implementations must expose draw-call and object-pool stats.
- New visual categories should target an explicit render layer.
- Phase 1 cannot be closed until the stats are recorded in the build plan for desktop and mobile-sized viewport QA.
- Do not maintain a Canvas fallback path. Simpler code that works in the active renderer is preferred over parallel renderer behavior.

**Status**: Approved for the Phase 1 hardening branch. Updated 2026-05-31 to remove the Canvas fallback.

---

## 2026-05-30 - Original High-Detail Isometric Pixel Art Direction

**Decision**: Make NidoWar's art direction an explicit phase gate before Phase 2 gameplay work. The target is original high-detail modern isometric pixel fantasy strategy art with dense authored terrain, readable unit silhouettes, layered world props, and dramatic warm/cool lighting.

**Rationale**:
- Phase 1 proved the renderer, but the prototype map does not meet the desired visual quality bar.
- Movement, heroes, armies, and battle mode will expose much more art, so visual direction must be locked before adding those systems.
- A repeatable prompt deck and manifest pipeline reduce the risk of inconsistent generated assets.

**Constraints enforced**:
- Commercial game screenshots may be used as density, lighting, and quality references only.
- NidoWar assets must be original and must not copy exact sprites, buildings, UI, faction marks, map layouts, or distinctive compositions from reference games.
- `docs/ART_DIRECTION.md` defines the visual target.
- `docs/ASSET_PROMPTS.md` is the source of truth for generated asset prompts.
- Phase 2 starts with terrain/prop/lighting art pipeline work before gameplay-heavy movement.

**Status**: Approved as the Phase 2 planning baseline.

---

## 2026-05-31 - Brush-Based Terrain Integration

**Decision**: Do not rely on generated custom transition art for terrain integration. NidoWar terrain integration is built from reusable brush components plus runtime controls: composition masks, alpha, tint, scale, density, placement, contact shadows, and separate decals/props.

**Rationale**:
- Generated transition art that tries to connect one exact terrain material to another exact terrain material is brittle and usually fails to match both sides.
- The desired reference quality comes from authored composition, painterly pixel detail, soft overlap, clustered props, and controlled lighting, not from perfect directional transition pieces.
- Reusable brush components give the renderer more control over item size, color, shadowing, placement density, and in-game iteration speed.

**Constraints enforced**:
- Do not request new art prompts for grass-to-dirt, dirt-to-stone, shore-to-grass, or similar exact material transition sheets.
- Generate single-purpose components instead: dirt wear, grass bite marks, loose stones, weeds, moss, cracks, roots, wall/fence pieces, prop bases, and shadow/contact elements.
- Runtime code should integrate those components through mask-driven placement, alpha, tint, scale, layering, and contact shadows.
- Reference games can inform the target quality and composition density, but prompts must describe the concrete NidoWar traits directly rather than naming a game style.

**Status**: Approved as the revised Phase 2 reset strategy.

---

## 2026-05-31 - Forest-Framed Base Art Gate

**Decision**: The first Phase 2 reset gate is no longer a bare meadow-only comparison. It must include target-like macro composition: a calm readable clearing framed by forest-border massing, clustered rocks, restrained shrubs, subtle dirt wear, contact shadows, and directional shadows. Roads, walls, landmarks, torches, water, mountains, and night lighting remain later layers.

**Rationale**:
- The target reference reads well because of its macro hierarchy: quiet center, dense forest edges, clustered rocks, and physical shadows. Removing trees entirely makes the comparison unfair and pushes the implementation toward noisy ground texture instead of authored composition.
- A 4X world map needs readable open areas for units, roads, settlements, markers, and UI, but it also needs strong terrain masses to define regions and movement context.
- Forests should establish border mass and depth early. Roads and walls should then be composed into that accepted base instead of trying to compensate for weak terrain composition.

**Constraints enforced**:
- Do not scatter trees uniformly. Forests in the base gate are edge masses, clumps, and sparse accents.
- Do not fill the clearing with high-contrast grass noise. The center must be calmer than the borders.
- Dirt wear must be subtle and blended; large orange cracked blobs are not accepted for the base gate.
- Rocks should cluster near forest edges, dirt wear, and future structure/road anchors rather than appearing evenly sprinkled.
- The map edge/void must not be visible in acceptance screenshots.

**Status**: Approved as the updated 2.R2-2.R4 direction.

---
*All future rendering decisions must be recorded here before code is written.*
