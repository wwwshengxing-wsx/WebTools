# Repository Guidelines

## Project Structure & Module Organization
- The app is expected to run on Vite + React; `src/main.tsx` bootstraps providers and should stay minimal.
- House reusable UI in `src/components/` (e.g., `src/components/CounterCard.tsx`) and colocate styles with the component file.
- Keep stateful logic inside `src/hooks/` or `src/state/`; expose a `useCounter` hook rather than passing prop drills.
- Static assets live in `public/`; versioned icons or JSON fixtures belong in `public/assets/` so Vite serves them correctly.
- Mirror component names in `src/__tests__/` (for example, `src/__tests__/CounterCard.test.tsx`) so coverage maps back cleanly.

## Build, Test, and Development Commands
- `npm install` — install dependencies, including Vite, TypeScript, ESLint, and Vitest.
- `npm run dev` — start the hot-reloading dev server at `http://localhost:5173`.
- `npm run build` — produce the optimized production bundle in `dist/`.
- `npm run preview` — serve the built assets locally for smoke-testing production output.
- `npm run test` — execute unit tests headlessly; add `--ui` when you need the Vitest watcher.

## Coding Style & Naming Conventions
- Use TypeScript everywhere; prefer `.tsx` for React components and `.ts` for pure utilities.
- Apply 2-space indentation, single quotes, and trailing commas; run `npm run lint` followed by `npm run format` (Prettier) before pushing.
- Name components and hooks in PascalCase (`CounterPanel.tsx`) and helper functions in camelCase (`formatDelta`).
- Keep modules under 200 lines; extract shared pieces into `src/lib/` with focused exports.
- In `src/pages/TextReplacement/hooks/`, ensure no single file exceeds 500 lines—split large hooks (for example `useTextReplacementEntries`) into smaller focused modules when needed.

## Testing Guidelines
- Write unit tests with Vitest and React Testing Library; ensure every new component has render + interaction coverage.
- Follow the `ComponentName.test.tsx` pattern and describe behaviours (`it('increments on click')`).
- Aim for 90% line coverage on `src/components/` and `src/hooks/`; inspect `coverage/` after `npm run test -- --coverage`.
- For complex state changes, prefer testing through the public UI instead of internal implementation details.

## Commit & Pull Request Guidelines
- Adopt Conventional Commits (`feat: add reset button`, `fix: debounce increment`) to keep the history searchable.
- Limit PRs to a single feature or fix, include a concise summary, screenshots/GIFs for UI changes, and reference any related issues.
- Confirm `npm run lint`, `npm run test`, and `npm run build` succeed before requesting review.
- Highlight follow-up work in a "Next Steps" list so reviewers understand outstanding items.

## Security & Configuration Tips
- Store runtime configuration in `.env.local`; expose variables with the `VITE_` prefix so the client build can access them.
- Never commit secrets—keep a sanitized template in `.env.example` and document any required keys in the README.
- Update dependencies promptly when `npm audit` flags high-severity issues, and note security fixes in the release notes.
