import { getActive, getPid, isRunning, listProjects } from './utils.mjs';

const active = getActive();
const running = isRunning(getPid());
const projects = listProjects();

if (projects.length === 0) {
  console.log('No projects yet. Run: npm run use -- <project-id>');
  process.exit(0);
}

console.log('');
for (const p of projects) {
  const isActive = p === active;
  const status = isActive && running ? ' (running)' : '';
  const marker = isActive ? '→' : ' ';
  console.log(`  ${marker} ${p}${status}`);
}
console.log('');
