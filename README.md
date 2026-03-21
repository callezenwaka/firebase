# Firebase Dev

Portable local Firebase emulator infrastructure. Keeps emulator config, security rules, and seed scripts out of application repos.

Register a project ID and get an isolated emulator environment — no config files to edit.

## What's here

| File / Folder | Purpose |
|---|---|
| `firebase.json` | Emulator port config (Auth: 9099, Firestore: 8083, PubSub: 8085, UI: 4000) |
| `firestore.rules` | Firestore security rules |
| `scripts/` | CLI scripts — one per command |
| `emulator-data/<project-id>/` | Isolated snapshot per project — auto-saved on exit |

## Prerequisites

- Node.js 20+
- Java (required by Firebase emulator): `java -version`
- `npm install`

## Usage

**Register a project and start the emulator:**
```bash
npm run use -- algoboardapp
```

This sets `algoboardapp` as the active project and starts the emulator. Data is saved to `emulator-data/algoboardapp/` and restored automatically on next start.

**Switch to a different project:**
```bash
npm run use -- algoforms
```

Stops the current emulator (saving its state), then starts a fresh one for `algoforms`.

**Start / stop the active project:**
```bash
npm start      # start emulator for active project
npm stop       # stop emulator (state is saved automatically)
```

**List all projects:**
```bash
npm run list
```

```
  → algoboardapp (running)
    algoforms
```

**Get connection env vars for your app:**
```bash
npm run connect
```

```
# Add to your app's .env (project: algoboardapp)

GOOGLE_CLOUD_PROJECT=algoboardapp
FIRESTORE_DATABASE=(default)
FIRESTORE_EMULATOR_HOST=localhost:8083
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
PUBSUB_EMULATOR_HOST=localhost:8085
```

**Remove a project and its data:**
```bash
npm run remove -- algoforms
```

Emulator UI → http://localhost:4000

## Connecting an API or app

Copy the output of `npm run connect` into your app's `.env`. The Firebase Admin SDK connects to the emulator automatically when those env vars are set — no code changes needed.

## Emulator ports

| Service | Port |
|---|---|
| Auth | 9099 |
| Firestore | 8083 |
| PubSub | 8085 |
| Emulator UI | 4000 |

## Emulator state

Each project's data lives in `emulator-data/<project-id>/`. State is saved automatically on `Ctrl+C` or `npm stop` via `--export-on-exit`.

To export manually while the emulator is running:
```bash
npx firebase emulators:export ./emulator-data/<project-id>
```

## Firestore security rules

`firestore.rules` defaults to allow all reads and writes — suitable for local development. Production rules live in each application repo.

## Known limitations

### Auth emulator — multi-tenant custom tokens

The Auth emulator's `customTokenToIdToken` endpoint does not correctly forward `tenantId`. The resulting ID token has no tenant, which breaks tenant-scoped rules and tenant-aware middleware.

**Workaround:** pass `tenantId` explicitly in the custom token's additional claims:

```js
// Without this, tenantId is stripped by the emulator
await auth.createCustomToken(uid, { tenantId: 'your-tenant-id' })
```

This is a backend fix — the emulator has no configuration to address it.
