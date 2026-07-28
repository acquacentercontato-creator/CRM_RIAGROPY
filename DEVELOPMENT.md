# DEVELOPMENT

## Prerequisites
- Node.js 20+
- npm 10+

## Setup
1. Install dependencies:

```bash
npm install
```

2. Start dev server:

```bash
npm run dev
```

3. Run lint:

```bash
npm run lint
```

4. Build production bundle:

```bash
npm run build
```

5. Run tests:

```bash
npm run test
```

## Code Quality Rules
- Keep UI free of business rules.
- Place business orchestration in services.
- Keep Firebase access in repositories/services.
- Prefer shared abstractions over duplicated logic.
- Keep TypeScript strict and ESLint clean.

## Performance Guidelines
- Use route-level lazy loading.
- Keep query defaults conservative (staleTime/gcTime/retry).
- Use memoization only in proven hotspots.
- Avoid loading heavy data on startup.

## Security Guidelines
- Validate upload files centrally before storage operations.
- Never trust role/email payloads without runtime checks.
- Keep Firebase rules aligned with role model.
- Avoid exposing secrets in frontend source.

## PWA Development Notes
- public/sw.js is the runtime service worker.
- public/manifest.webmanifest drives install metadata.
- src/pwa/registerServiceWorker.ts handles updates/install prompt.
