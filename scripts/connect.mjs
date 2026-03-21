import { getActive } from './utils.mjs';

const projectId = getActive();

if (!projectId) {
  console.error('No active project. Run: npm run use -- <project-id>');
  process.exit(1);
}

console.log(`\n# Add to your app's .env (project: ${projectId})\n`);
console.log(`GOOGLE_CLOUD_PROJECT=${projectId}`);
console.log(`FIRESTORE_DATABASE=(default)`);
console.log(`FIRESTORE_EMULATOR_HOST=localhost:8083`);
console.log(`FIREBASE_AUTH_EMULATOR_HOST=localhost:9099`);
console.log(`PUBSUB_EMULATOR_HOST=localhost:8085`);
console.log('');
