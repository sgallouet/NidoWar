# NidoWar Code Design (Strict Codex - Enforce Always)

## Primary Goals (in order)
1. **Performance first** — main thread almost always free.
   - Anything that can be delayed even 2-3 frames → off main thread (Web Worker, requestIdleCallback, async queue).
   - AI thinking, pathfinding, economy simulation, fog updates, turn resolution: async.
   - Only render what is visible on screen right now (frustum + occlusion culling).
   - Mimic Unity/UE 2D optimizations: minimize draw calls (batching), texture atlases, object pooling, spatial partitioning, dirty rectangles.

2. **Small is best** — hard limit ~800-1000 lines per file.
   - Any file approaching 800 lines = immediate refactor signal.
   - index.html, main.ts, entry points must stay tiny (imports only).

3. **Segregation** (non-negotiable)
   - Three top-level domains:
     - `engine/` : pure tech (render loop, async job system, asset loader + manifest parser, camera, input abstraction, culling, audio, save/load primitives).
     - `gameplay/` : rules, systems, state machines (turn scheduler, movement rules, resource economy, merchant AI, fog of war, battle entry, town growth, capture logic).
     - `universe/` : data + view for concrete entities. One subfolder per major domain:
       - tiles/, heroes/, armies/, resources/, towns/, castles/, structures/
       - Inside each: model.ts (or data.ts), view.ts (or renderer.ts), controller.ts if needed, and a small `index.ts` barrel.
   - Never mix concerns across these boundaries.

4. **No melting pots**
   - No god files, no "utils.ts" that grows forever.
   - Each folder owns its drawing + interfaces.
   - Prefer many tiny, well-named files over fewer large ones.

5. **Long-term maintainability**
   - Code must remain easy to understand and change after years of additions.
   - When adding a new unit type, building, or terrain: it should only require changes inside its own universe/ subfolder + minimal registration.
   - Every new feature must come with a plan update first.
   - Every phase closure must include evidence, not assertion: build result, visual QA, and relevant performance/debug stats.

## Implementation Rules
- TypeScript strict.
- Prefer composition over deep inheritance.
- All async entry points clearly marked.
- Rendering never blocks gameplay logic.
- When in doubt: make the file smaller and more focused.

## Art Integration Rule
- All art access goes through JSON manifests (see ART_SPEC.md).
- Never bake pixel coordinates from a specific sprite into gameplay or engine core.
- Art direction is a first-class architecture concern: world map, battle arena, unit sprites, lighting, and UI-adjacent icons must follow `docs/ART_DIRECTION.md`.
- Generated asset prompts must come from or be added back to `docs/ASSET_PROMPTS.md` so the visual system remains repeatable.
- Commercial screenshots may define quality expectations, density, and lighting goals, but NidoWar assets must be original and cannot copy protected sprites, layouts, UI, or faction designs.

## Phase Gate Rule
- A phase cannot be marked complete until its exit criteria have recorded evidence in `docs/BUILD_PLAN.md`.
- For rendering phases, evidence must include frame timing, draw calls, visible object counts, and viewport/device context.

Violations of the above are to be treated as bugs during review.
