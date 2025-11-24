# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.2] - 2025-11-24
### Changed
- Renamed package from `@b4m-tech/widget-funnel` to unscoped `b4m-widget-funnel` for easier npm publishing.
- Updated React peerDependencies to `>=18`.
- Added CDN examples (jsDelivr & UNPKG) to README.
- Updated vanilla & iframe demos with `title` and `loading="lazy"` for accessibility/performance.

### Added
- `PUBLISHING.md` release workflow guide.
- This `CHANGELOG.md` file.

### Fixed
- Broken React import in sandbox (missing `dist/` when installing from Git tag) solved by npm publication.

### Security
- SRI recommendations (optional integrity hash) added to publishing guide.

## [0.1.1] - 2025-11-24
### Added
- Pre-rename internal version bump.
- Confirmed React export (bundle `react.js`, types, CJS).

### Changed
- Preparation for npm publish (peer deps adjustment).

### Fixed
- Adjusted URL builder to support path format locale/partner ( groundwork ). *Final rename shipped in 0.1.2.*

## [0.1.0] - 2025-11-24
### Added
- First public GitHub version (installable via Git tag).
- Core funnel widget: mount/unmount, auto resize, parameters (partnerId, locale, email, sidebar, minHeight, allow, srcBase).
- React wrapper `<B4MFunnelReact />`.
- UMD bundle `baseformusic-widget.umd.js` including versioned file.
- React sandbox demo.

### Known Issues
- Not published to npm yet / dist sometimes missing via Git tag installs.
- Initial URL used only query params (improved later with path format).

---

## Future
- Add automated tests (Playwright) for iframe integration.
- CI automation to publish on tag push.
- Enrich `CHANGELOG.md` with future contributions.

[0.1.2]: https://github.com/B4M-TECH/B4MFunnelReact/releases/tag/v0.1.2
[0.1.1]: https://github.com/B4M-TECH/B4MFunnelReact/releases/tag/v0.1.1
[0.1.0]: https://github.com/B4M-TECH/B4MFunnelReact/releases/tag/v0.1.0
