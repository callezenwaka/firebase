import { spawn } from 'child_process';
import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import {
  setActive, DATA_DIR, FIREBASE_BIN,
  savePid, clearPid, getPid, isRunning, waitUntilStopped,
} from './utils.mjs';

const projectId = process.argv[2];

if (!projectId) {
  console.error('Usage: npm run use -- <project-id>');
  process.exit(1);
}

const pid = getPid();
if (isRunning(pid)) {
  console.log('Stopping current emulator...');
  process.kill(pid, 'SIGTERM');
  await waitUntilStopped(pid);
  clearPid();
}

setActive(projectId);
console.log(`Active project: ${projectId}`);

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
