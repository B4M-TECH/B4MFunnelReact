# B4M Funnel React Sandbox
Small Vite application used to exercise the `b4m-widget-funnel/react` component in isolation. Helpful for validating changes to the core widget without touching a host project.
## Prerequisites
- Node.js 18+ (or any version supported by Vite)
- npm **or** Yarn
## Install & run
From the repository root:
```bash
cd demo/react-sandbox
npm install          # or: yarn install
npm run dev          # or: yarn dev
```
The dev server defaults to <http://localhost:5173/> with hot module reload enabled. Stop it with `Ctrl+C`.
## Customising the demo
- Update `src/App.tsx` to tweak the props passed to `<B4MFunnelReact />` (e.g. `partnerId`, `locale`, `minHeight`).
- When testing script auto-init instead, add `<script>` tags to `index.html` or import the UMD bundle inside `main.tsx`.
- Run `npm run dev` / `yarn dev` after each change to rebuild automatically.
## Additional scripts
```bash
npm run lint    # or: yarn lint    -> ESLint over the sandbox project
npm run build   # or: yarn build   -> Type-checks then builds a production bundle
npm run preview # or: yarn preview -> Serves the production build locally
```
## Using a local widget build
While developing the widget itself, rebuild the root package (`npm run build` at repo root). The sandbox now consumes the published npm package; to point it at your local build, temporarily replace the dependency in `package.json` with `file:../../` and reinstall. To return to npm: `npm install b4m-widget-funnel@latest`.
