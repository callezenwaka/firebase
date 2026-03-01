# Firebase Dev

Local Firebase emulator infrastructure for the algoboard platform. Keeps emulator config, security rules, and seed scripts out of the application repos.

## What's here

| File / Folder | Purpose |
|---|---|
| `firebase.json` | Emulator port config (Auth: 9099, Firestore: 8083, UI: 4000) |
| `firestore.rules` | Firestore security rules |
| `emulator-data/` | Exported emulator snapshot (auth + Firestore) — auto-updated on exit |
| `seedRoles.ts` | Seeds the `roles` collection with all 14 role records |

## Prerequisites

- Node.js 20+
- Java (required by Firebase emulator): `java -version`
- `npm install`

## Setup

```bash
cp .env.example .env
# Fill in GOOGLE_CLOUD_PROJECT and FIRESTORE_DATABASE for staging/production seeds
```

## Usage

**Start emulator** (loads saved state, saves on exit):
```bash
npm run emulator
```

Emulator UI → http://localhost:4000

**Seed roles** (run against emulator):
```bash
npm run seed:roles
```

**Seed roles** (run against staging Firestore):
```bash
npm run seed:roles:staging
```

## Connecting the API

Add these to `algoboard_api/.env` for local development:

```
GOOGLE_CLOUD_PROJECT=demo-no-project
FIRESTORE_DATABASE=(default)
FIRESTORE_EMULATOR_HOST=localhost:8083
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
```

The API connects to the emulator automatically when these env vars are set — no code changes needed.

## Saving emulator state

`npm run emulator` starts with `--export-on-exit`, so any data changes made during a session are saved back to `emulator-data/` automatically on shutdown (`Ctrl+C`).

To manually export at any time while the emulator is running:
```bash
npx firebase emulators:export ./emulator-data
```
