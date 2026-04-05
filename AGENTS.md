# Repository Guidelines

## Project Structure & Module Organization
`src/` contains the application code. `main.ts` boots the app, `editor.ts` manages editor state and shortcuts, `render.ts` handles Markdown and diagram rendering, `export.ts` prepares WeChat-friendly HTML, `themes.ts` owns theme logic, and `ui.ts` contains shared UI helpers. `styles.css` holds global styling. `index.html` is the Vite entry shell. `dist/` is generated output; do not edit it by hand. `openspec/` stores change proposals and design notes. `public/` is available for static assets, though it is currently empty.

## Build, Test, and Development Commands
Use `npm install` to install dependencies. `npm run dev` starts the local Vite server for interactive development. `npm run build` runs `tsc && vite build`, so it is the current type-check and production build gate. `npm run preview` serves the built app from `dist/` for a final smoke test.

## Coding Style & Naming Conventions
Match the existing TypeScript style: 2-space indentation, single quotes, semicolons, and ES module imports. Prefer small focused modules under `src/` rather than growing `main.ts`. Use `camelCase` for functions and variables, `PascalCase` for types/classes, and `UPPER_SNAKE_CASE` for module-level constants such as `STORAGE_KEY`. Keep filenames lowercase and descriptive, for example `render.ts` or `themes.ts`.

## Testing Guidelines
There is no committed automated test runner yet. Until one is added, treat `npm run build` as mandatory before submitting changes and manually verify key flows in `npm run dev`: Markdown editing, preview updates, theme switching, diagram rendering, and export/copy behavior. When adding tests later, place them next to the module or under a dedicated `tests/` directory using `*.test.ts` naming.

## Commit & Pull Request Guidelines
Git history is not available in this workspace, so no local convention can be derived from prior commits. Use short imperative commit messages and prefer Conventional Commit prefixes such as `feat:`, `fix:`, `docs:`, or `refactor:`. Pull requests should explain the user-visible change, list manual verification steps, and include screenshots or exported HTML samples for UI or rendering changes. Link the related OpenSpec change when the work came from `openspec/changes/`.
