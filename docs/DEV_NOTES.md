# NidoWar Dev Notes

## Tooling Philosophy (Phase 0.2)

We deliberately run with **minimal tooling**:

- No ESLint, Prettier, Biome, or any linter/formatter
- No Husky, lint-staged, or git hooks
- No additional config files for style enforcement

**Rationale** (directly from CODE_DESIGN.md "small is best" + "no bloat"):
- These tools almost always grow into melting-pot configuration that fights the <800-line rule and long-term maintainability.
- TypeScript `strict: true` + the `nido-plan` skill (which enforces segregation and file size on every invocation) + human review provide stronger and lighter guardrails.
- Vite's built-in HMR + `npm run build` (tsc) are the only automated checks needed right now.

Current state:
- `npm run dev` — fast refresh works
- `npm run build` — type checking + production bundle
- `.vscode/launch.json` — F5 (or Run → "Start Dev Server") runs `npm run dev` and auto-opens the browser when Vite is ready

**Justification for launch.json**: Pure ergonomic wrapper around the already-approved `npm run dev` script. Uses only built-in VSCode `node-terminal` type + `serverReadyAction` (no new dependencies, extensions, or config bloat). Improves daily iteration speed for the existing Vite dev workflow while fully complying with the "minimal tooling" rule. Recorded here per policy.

Any future proposal to add tooling **must** be justified against the codex, recorded here first, and kept to the absolute minimum.

**Revisit trigger**: Real friction appears in daily work that the skill + manual review cannot solve.
