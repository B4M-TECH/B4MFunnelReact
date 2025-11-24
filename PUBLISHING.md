# Publishing Guide (Brief) – b4m-widget-funnel

Minimal workflow to release a new version to npm and update docs/CDN references.

---
## 1. Prerequisites
- Logged in: `npm whoami` returns your user
- Node.js >= 18
- Up-to-date `main`: `git pull origin main`

---
## 2. Quick Pre-flight
1. Build succeeds: `yarn build`
2. Sandbox works: `cd demo/react-sandbox && yarn dev`
3. React import OK: `import { B4MFunnelReact } from 'b4m-widget-funnel/react'`
4. Iframe URL shape OK: `https://funnel.baseformusic.com/<locale>/<partnerId>`
5. Update `CHANGELOG.md`

---
## 3. Version bump
Choose: patch | minor | major.
```bash
npm version patch
```
This updates package.json + creates commit + Git tag.

---
## 4. Build & (Optional) Dry-run
```bash
yarn install
yarn build
npm publish --dry-run
```
Ensure only dist + metadata are included.

---
## 5. Publish
```bash
npm publish --access public
```
Expect: `+ b4m-widget-funnel@X.Y.Z`

---
## 6. Push tags
```bash
git push origin main --follow-tags
```

---
## 7. Update docs
- README CDN examples: replace version `@X.Y.Z`
- HTML demos: update jsDelivr pinned script
- Sandbox: bump dependency if needed

jsDelivr (pinned):
```html
<script src="https://cdn.jsdelivr.net/npm/b4m-widget-funnel@X.Y.Z/dist/baseformusic-widget.umd.js"></script>
```
UNPKG (latest):
```html
<script src="https://unpkg.com/b4m-widget-funnel/dist/baseformusic-widget.umd.js"></script>
```

---
## 8. Breaking changes
- Add MIGRATION section to README + CHANGELOG
- Use minor or major bump accordingly

---
## 9. One-line Script
```bash
npm whoami && npm version patch && yarn install && yarn build && npm publish --access public && git push origin main --follow-tags
```
Manual alternative (if you bumped version manually in package.json):
```bash
git commit -am "chore: release X.Y.Z" && git tag vX.Y.Z && git push origin main --follow-tags
```
Minor auto bump & publish:
```bash
npm run release:minor
```

---
## 10. Common Issues
Last update: 2025-11-24
