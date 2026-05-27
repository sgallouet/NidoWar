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
*All future rendering decisions must be recorded here before code is written.*
