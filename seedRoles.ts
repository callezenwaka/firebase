/**
 * seedRoles.ts — single-run script
 *
 * Seeds the Firestore `roles` collection with all 14 role records.
 *
 * New fields:
 *   isFeatureRole  — true for reviewer, editor, creator
 *   deletable      — false for the 5 identity types
 *   compatibleWith — UserTypes that can hold this role (from old ROLE_COMPATIBILITY matrix)
 *   description    — moved from old ROLE_DESCRIPTIONS constant
 *
 * Idempotent: queries by `name`, updates existing docs, creates new ones.
 *
 * Usage:
 *   NODE_ENV=development npx tsx seedRoles.ts   ← emulator
 *   NODE_ENV=staging     npx tsx seedRoles.ts   ← staging Firestore
 */

import 'dotenv/config';
import { initializeApp, applicationDefault, getApps } from 'firebase-admin/app';
import { Firestore } from '@google-cloud/firestore';

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

const isDev = process.env.NODE_ENV === 'development';

if (isDev) {
  process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8083';
}

if (getApps().length === 0) {
  initializeApp({
    ...(!isDev && { credential: applicationDefault() }),
    projectId: isDev ? 'demo-no-project' : process.env.GOOGLE_CLOUD_PROJECT,
  });
}

const firestore = new Firestore(
  isDev
    ? { projectId: 'demo-no-project', database: process.env.FIRESTORE_DATABASE, host: 'localhost', port: 8083, ssl: false }
    : { projectId: process.env.GOOGLE_CLOUD_PROJECT, database: process.env.FIRESTORE_DATABASE }
);

// ---------------------------------------------------------------------------
// Seed data
// compatibleWith derived by inverting old ROLE_COMPATIBILITY:
//   owner   had: ["owner", "admin", "editor", "creator", "reviewer", "user"]
//   admin   had: ["admin", "access", "auditor", "instructor", "moderator",
//                 "examiner", "staff", "editor", "creator", "reviewer", "user"]
//   vendor / support: standalone
//   user    had: ["user", "editor", "creator", "reviewer"]
// ---------------------------------------------------------------------------

interface RoleSeedRecord {
  name: string;
  description: string;
  isFeatureRole: boolean;
  deletable: boolean;
  compatibleWith: string[];
}

const ROLES_SEED: RoleSeedRecord[] = [
  // Identity types — non-deletable
  { name: 'owner',    description: 'Organization owner (acquired only during registration)',  isFeatureRole: false, deletable: false, compatibleWith: ['owner'] },
  { name: 'vendor',   description: 'Vendor account (acquired only during registration)',      isFeatureRole: false, deletable: false, compatibleWith: ['vendor'] },
  { name: 'support',  description: 'Platform support role with service capabilities',         isFeatureRole: false, deletable: false, compatibleWith: ['support'] },
  { name: 'admin',    description: 'Administrator with broad permissions',                    isFeatureRole: false, deletable: false, compatibleWith: ['owner', 'admin'] },
  { name: 'user',     description: 'Basic user with standard permissions',                    isFeatureRole: false, deletable: false, compatibleWith: ['owner', 'admin', 'user'] },

  // Functional roles — admin-only
  { name: 'staff',      description: 'Staff with content and user management capabilities', isFeatureRole: false, deletable: true, compatibleWith: ['admin'] },
  { name: 'instructor', description: 'Educational role with teaching capabilities',         isFeatureRole: false, deletable: true, compatibleWith: ['admin'] },
  { name: 'moderator',  description: 'Content and user moderation capabilities',            isFeatureRole: false, deletable: true, compatibleWith: ['admin'] },
  { name: 'examiner',   description: 'Assessment role with examination capabilities',       isFeatureRole: false, deletable: true, compatibleWith: ['admin'] },
  { name: 'auditor',    description: 'Auditor with content review capabilities',            isFeatureRole: false, deletable: true, compatibleWith: ['admin'] },
  { name: 'access',     description: 'Provisioning and de-provisioning role',               isFeatureRole: false, deletable: true, compatibleWith: ['admin'] },

  // Feature roles — universally compatible
  { name: 'reviewer', description: 'Content reviewer with approval rights',    isFeatureRole: true, deletable: true, compatibleWith: ['owner', 'admin', 'user'] },
  { name: 'editor',   description: 'Content editor with modification rights',  isFeatureRole: true, deletable: true, compatibleWith: ['owner', 'admin', 'user'] },
  { name: 'creator',  description: 'Content creator with publishing abilities', isFeatureRole: true, deletable: true, compatibleWith: ['owner', 'admin', 'user'] },
];

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

async function seedRoles(): Promise<void> {
  const collection = firestore.collection('roles');
  const now = Date.now();
  const env = isDev ? 'EMULATOR' : (process.env.NODE_ENV ?? 'unknown').toUpperCase();

  console.log(`\nSeeding ${ROLES_SEED.length} roles → Firestore [${env}]\n`);

  for (const role of ROLES_SEED) {
    const snapshot = await collection.where('name', '==', role.name).limit(1).get();

    if (!snapshot.empty) {
      await snapshot.docs[0]!.ref.update({
        description: role.description,
        isFeatureRole: role.isFeatureRole,
        deletable: role.deletable,
        compatibleWith: role.compatibleWith,
        updatedAt: now,
      });
      console.log(`  updated  ${role.name}`);
    } else {
      await collection.doc(role.name).set({
        name: role.name,
        description: role.description,
        isFeatureRole: role.isFeatureRole,
        deletable: role.deletable,
        compatibleWith: role.compatibleWith,
        createdAt: now,
        updatedAt: now,
      });
      console.log(`  created  ${role.name}`);
    }
  }

  console.log('\nDone.\n');
}

seedRoles().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
