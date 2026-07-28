# CHANGELOG

## 3.0.0-rc1 - 2026-07-27

### Quality Hardening
- Removed obsolete non-executable test plan files.
- Removed unused public/icons.svg asset.
- Reduced duplicated dashboard chart entry.

### Performance
- Implemented lazy loading for route pages.
- Added route splitting through dynamic imports.
- Tuned React Query defaults for staleTime/gcTime/retry.
- Added manual chunking strategy in Vite build.
- Added memoized widget lookup in Dashboard page.

### Security
- Hardened AuthContext with payload validation and persisted session handling.
- Added centralized upload validation policy (size/type/safe filename).
- Applied upload policy to shared and RIEGO upload services.
- Added baseline Firestore and Storage rules for role-based control.

### PWA
- Added manifest.webmanifest with install metadata.
- Added service worker with offline fallback and auto-update handoff.
- Added install prompt wiring and controller-based reload.
- Added offline page and PWA icon/splash assets.

### Testing
- Configured Vitest + coverage.
- Added automated tests for services, repositories, workflow and validators.

### Documentation
- Added ARCHITECTURE.md
- Added DEVELOPMENT.md
- Added DEPLOY.md
- Added CHANGELOG.md
