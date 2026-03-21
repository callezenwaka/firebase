import { spawn } from 'child_process';
import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { getActive, DATA_DIR, FIREBASE_BIN, savePid, clearPid, getPid, isRunning } from './utils.mjs';

const projectId = getActive();

if (!projectId) {
  console.error('No active project. Run: npm run use -- <project-id>');
  process.exit(1);
}

const pid = getPid();
if (isRunning(pid)) {
  console.error(`Emulator already running (pid ${pid}) for project: ${projectId}`);
  process.exit(1);
}

const dataDir = join(DATA_DIR, projectId);
mkdirSync(dataDir, { recursive: true });

const hasSnapshot = existsSync(join(dataDir, 'firebase-export-metadata.json'));

const args = [
  'emulators:start',
  '--project', projectId,
  ...(hasSnapshot ? [`--import=${dataDir}`] : []),
  `--export-on-exit=${dataDir}`,
];

console.log(`Starting Firebase emulator for project: ${projectId}`);

const child = spawn(FIREBASE_BIN, args, { stdio: 'inherit' });

savePid(child.pid);

child.on('exit', (code) => {
  clearPid();
  process.exit(code ?? 0);
});
