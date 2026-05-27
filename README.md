# NidoWarWeb4X

Isometric turn-based 4X game inspired by Heroes of Might & Magic. Built for phone & tablet first.

**Strict development rules are enforced via the project skill.**

## Getting Started (Dev)

```bash
npm install
npm run dev
```

Open http://localhost:5173 or the LAN address shown by Vite on your phone/tablet.

### Testing on Phone / Tablet
1. Run `npm run dev` in the NidoWar folder.
2. Vite will print a LAN address (example: `http://192.168.1.42:5173`).
3. Open that address on your phone or tablet (same Wi-Fi network).
4. The dev server supports hot reload from any device.

## How We Build This Game

We use a living plan + codex skill so the project stays small, fast, and maintainable for years.

1. **Always work through the skill**: Use `/nido-plan` (or the TUI skills menu) for any task related to this game.
2. The skill will:
   - Read the current `docs/BUILD_PLAN.md`
   - Propose the next tiny, reviewable micro-step
   - Enforce segregation (engine / gameplay / universe), file size limits, performance-first async design, and the art manifest rule
3. We review and approve **one micro-step at a time**. No big bangs.

## Key Documentation (read these via the skill)

- `docs/BUILD_PLAN.md` — current phased plan (DRAFT — awaiting your review)
- `docs/CODE_DESIGN.md` — the non-negotiable architecture rules
- `docs/ART_SPEC.md` — sprite JSON manifest format + art direction
- `docs/GAME_RULES.md` — condensed gameplay rules from the original spec

## Current Status

- Phase 0 bootstrap complete (Vite + TS + git + folder segregation + this skill).
- **Next**: User review of BUILD_PLAN.md + decision on rendering backend (PixiJS recommended vs pure Canvas).

See `/nido-plan "review the build plan"` or just describe what you want to do next.
