import { getPid, isRunning, clearPid } from './utils.mjs';

const pid = getPid();

if (!pid || !isRunning(pid)) {
  console.log('No emulator is running.');
  process.exit(0);
}

console.log(`Stopping emulator (pid ${pid})...`);
process.kill(pid, 'SIGTERM');
clearPid();
