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

**Decision**: Keep the Pixi adapter behind `IRenderer`, but require persistent render layers and pooled sprites for map rendering.

**Rationale**:
- The terrain visual prototype added decals, props, torches, and lighting. Destroying and recreating Pixi display objects every render would create avoidable GC pressure during camera pan/zoom.
- Persistent layers (`terrain`, `decal`, `prop`, `unit`, `lighting`) make Phase 2 hero/army rendering explicit instead of adding more one-off loops to the viewport.
- `window.__NIDOWAR_PHASE1_STATS__` provides a lightweight phase-gate signal without adding a testing framework yet.

**Constraints enforced**:
- Renderer implementations must expose draw-call and object-pool stats.
- New visual categories should target an explicit render layer.
- Phase 1 cannot be closed until the stats are recorded in the build plan for desktop and mobile-sized viewport QA.

**Status**: Approved for the Phase 1 hardening branch.

---
*All future rendering decisions must be recorded here before code is written.*
