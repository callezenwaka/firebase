# Firebase Dev

Portable local Firebase emulator infrastructure. Keeps emulator config, security rules, and seed scripts out of application repos. Designed as a **lift-and-shift** setup — drop it into any project and only change `.env`.

## What's here

| File / Folder | Purpose |
|---|---|
| `firebase.json` | Emulator port config (Auth: 9099, Firestore: 8083, PubSub: 8085, UI: 4000) |
| `firestore.rules` | Firestore security rules |
| `scripts/emulator.mjs` | Reads `PROJECT_ID` from `.env` and starts the emulator |
| `emulator-data/` | Exported emulator snapshot (auth + Firestore) — auto-updated on exit |
| `.env.example` | Template — copy to `.env` and fill in your project values |

## Prerequisites

- Node.js 20+
- Java (required by Firebase emulator): `java -version`
- `npm install`

## Setup

```bash
cp .env.example .env
```

Edit `.env` with your project values:

```env
PROJECT_ID=your-project-id
GOOGLE_CLOUD_PROJECT=your-project-id
FIRESTORE_DATABASE=(default)
```

`PROJECT_ID` is the only required field to change when switching projects. It is passed directly to `firebase emulators:start --project`.

## Usage

**Start emulator** (loads saved state, saves on exit):
```bash
npm run dev
# or
npm run emulator
```

Emulator UI → http://localhost:4000

## Connecting an API or app

Add these to your app's `.env` for local development:

```env
GOOGLE_CLOUD_PROJECT=your-project-id
FIRESTORE_DATABASE=(default)
FIRESTORE_EMULATOR_HOST=localhost:8083
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
```

The Firebase Admin SDK connects to the emulator automatically when `FIRESTORE_EMULATOR_HOST` and `FIREBASE_AUTH_EMULATOR_HOST` are set — no code changes needed.

## Emulator ports

| Service | Port |
|---|---|
| Auth | 9099 |
| Firestore | 8083 |
| PubSub | 8085 |
| Emulator UI | 4000 |

## Emulator state

`npm run emulator` starts with `--import=./emulator-data --export-on-exit`, so any data changes made during a session are saved back to `emulator-data/` automatically on shutdown (`Ctrl+C`).

To export manually while the emulator is running:
```bash
npx firebase emulators:export ./emulator-data
```

## Firestore security rules

Rules are defined in `firestore.rules` and enforced by the emulator at the same path as production.

| Collection | Rule |
|---|---|
| `chatSessions` | Authenticated users can only read/write their own sessions (`userId` must match `auth.uid`) |
| `chatMessages` | Authenticated users can only read messages from their own sessions; can only create messages in sessions they own |

## Switching projects

This repo is designed to be reused across projects without modification. To target a different Firebase project:

1. Update `PROJECT_ID` (and `GOOGLE_CLOUD_PROJECT`) in `.env`
2. Run `npm run dev`

No other files need to change. The `--project` flag set by `scripts/emulator.mjs` takes precedence over `.firebaserc`.
