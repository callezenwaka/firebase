import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const ROOT = join(__dirname, '..');
export const ACTIVE_FILE = join(ROOT, '.firebase-active');
export const PID_FILE = join(ROOT, '.firebase-pid');
export const DATA_DIR = join(ROOT, 'emulator-data');
export const FIREBASE_BIN = join(ROOT, 'node_modules', '.bin', 'firebase');

export function getActive() {
  if (!existsSync(ACTIVE_FILE)) return null;
  return readFileSync(ACTIVE_FILE, 'utf8').trim() || null;
}

export function setActive(projectId) {
  writeFileSync(ACTIVE_FILE, projectId, 'utf8');
}

export function clearActive() {
  writeFileSync(ACTIVE_FILE, '', 'utf8');
}

export function getPid() {
  if (!existsSync(PID_FILE)) return null;
  const pid = parseInt(readFileSync(PID_FILE, 'utf8').trim(), 10);
  return isNaN(pid) ? null : pid;
}

export function savePid(pid) {
  writeFileSync(PID_FILE, String(pid), 'utf8');
}

export function clearPid() {
  writeFileSync(PID_FILE, '', 'utf8');
}

export function isRunning(pid) {
  if (!pid) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export function listProjects() {
  if (!existsSync(DATA_DIR)) return [];
  return readdirSync(DATA_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);
}

export function waitUntilStopped(pid) {
  return new Promise((resolve) => {
    const check = setInterval(() => {
      if (!isRunning(pid)) {
        clearInterval(check);
        resolve();
      }
    }, 300);
  });
}
