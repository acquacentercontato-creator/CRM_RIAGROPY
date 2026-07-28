# ARCHITECTURE

## Overview
RIAGRO CRM V3 follows a layered frontend architecture with domain modules and shared platform services.

- UI Layer: pages and reusable components.
- Application Layer: hooks + orchestrators.
- Domain Layer: business services per module.
- Infrastructure Layer: repositories, Firebase integrations and storage.

## Module Layout
Each module is structured to support long-term maintainability:

- Page
- Components
- Hooks
- Services
- Repository
- Types
- Validators
- Utils

## Cross-Cutting
Shared domain utilities are centralized in src/shared:

- Workflow engine and workflow services
- Audit, revision, timeline and notifications
- Base repository and base service abstractions
- Validators and utility helpers

## Routing and Runtime Loading
Routes are split using lazy imports and Suspense fallback.

- Reduces initial JS payload
- Defers module loading until route activation
- Supports progressive startup and better time-to-interactive

## Data Access
Pages do not access Firebase directly.
All persistence goes through service + repository boundaries.

- Repositories: CRUD and collection-level behavior
- Services: business rules, workflow updates, notifications, timeline

## Security Boundaries
- Auth session persisted in local storage with payload validation
- Upload pipeline validates file size/type/name before storage call
- Firestore and Storage rules prepared for role-based enforcement

## PWA Architecture
- manifest.webmanifest defines install metadata and splash descriptor
- Service worker provides network-first cache with offline fallback
- Auto-update flow uses skipWaiting + controllerchange reload

## Test Baseline (RC1)
Initial automated tests cover:

- Services
- Repositories
- Workflow engine and validators
- Shared validators and upload policy
