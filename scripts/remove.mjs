import { rmSync, existsSync } from 'fs';
import { join } from 'path';
import {
  getActive, clearActive, DATA_DIR,
  getPid, isRunning, clearPid, waitUntilStopped,
} from './utils.mjs';

const projectId = process.argv[2];

if (!projectId) {
  console.error('Usage: npm run remove -- <project-id>');
  process.exit(1);
}

const dataDir = join(DATA_DIR, projectId);

if (!existsSync(dataDir)) {
  console.error(`Project not found: ${projectId}`);
  process.exit(1);
}

const pid = getPid();
if (getActive() === projectId && isRunning(pid)) {
  console.log('Stopping emulator...');
  process.kill(pid, 'SIGTERM');
  await waitUntilStopped(pid);
  clearPid();
}

if (getActive() === projectId) {
  clearActive();
}

rmSync(dataDir, { recursive: true, force: true });
console.log(`Removed project: ${projectId}`);
