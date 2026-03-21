import { spawn } from 'child_process';
import { config } from 'dotenv';

config();

const projectId = process.env.PROJECT_ID;

if (!projectId) {
  console.error('Error: PROJECT_ID is not set. Add it to your .env file.');
  process.exit(1);
}

console.log(`Starting Firebase emulators for project: ${projectId}`);

const child = spawn(
  'npx',
  ['firebase', 'emulators:start', '--project', projectId, '--import=./emulator-data', '--export-on-exit'],
  { stdio: 'inherit' }
);

child.on('exit', code => process.exit(code ?? 0));
