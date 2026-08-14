// Client-side Firebase/Firestore setup for the RSVP feature on page 9
// (StayScene.astro). This project builds to fully static HTML (no
// server/adapter -- see astro.config.mjs), so there is no backend to hold
// admin credentials on; RSVP writes go straight from the visitor's browser
// to Firestore, same as any other static-site + Firebase setup, secured
// by Firestore Security Rules (see firestore.rules at the repo root), not
// by hiding this config.
//
// The values below (apiKey, authDomain, etc.) are Firebase's public *web
// app* config -- safe to ship in a client bundle by design (Firebase's own
// docs are explicit about this: https://firebase.google.com/docs/projects/api-keys).
// They are NOT the same thing as a service account key, which must never
// appear here or anywhere in this repo. Real access control lives entirely
// in Firestore's own security rules.
//
// Every value comes from a PUBLIC_-prefixed env var (see .env.example) --
// Astro/Vite only inlines PUBLIC_* variables into client-side code, so this
// module reads cleanly whether it runs at build time or in the browser.
// If any are missing (e.g. a preview build with no Firebase project wired
// up yet), initialization is skipped entirely and getFirestoreDb() returns
// null -- callers (see rsvp.ts) treat that exactly like a failed write and
// degrade to a discreet, non-blocking error instead of throwing.

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
};

function missingConfigKeys(): string[] {
  return Object.entries(firebaseConfig)
    .filter(([, value]) => !(typeof value === 'string' && value.length > 0))
    .map(([key]) => key);
}

/**
 * Diagnostic-only snapshot for the RSVP error path (see rsvp.ts's own
 * catch block) -- projectId (not a secret; it's the public Firebase
 * project identifier, safe to log) plus a present/missing boolean per
 * PUBLIC_FIREBASE_* var, deliberately never the var's own value (even
 * though these particular values are Firebase's own public web config,
 * not secrets -- see this file's own top comment -- this stays
 * conservative and never prints them). Exported so rsvp.ts can log it
 * alongside the real error.code/error.message from a failed write,
 * without duplicating the env var list there.
 */
export function getFirebaseConfigDiagnostics(): { projectId: string | undefined; envVarsPresent: Record<string, boolean> } {
  const envVarsPresent: Record<string, boolean> = {};
  for (const [key, value] of Object.entries(firebaseConfig)) {
    envVarsPresent[key] = typeof value === 'string' && value.length > 0;
  }
  return { projectId: firebaseConfig.projectId, envVarsPresent };
}

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let attempted = false;

/**
 * Lazily initializes Firebase the first time it's actually needed (RSVP
 * page reached, a save attempted) rather than on every page load -- this
 * scene is the only thing in the whole experience that needs it. Returns
 * null (never throws) if the env vars aren't configured or init fails for
 * any other reason, so a missing/broken Firebase project degrades the
 * RSVP feature alone, never the rest of the invitation -- the visitor
 * still only ever sees StayScene's own quiet inline error, never a raw
 * exception. The real cause (which env vars are missing, or what init
 * threw) is logged to the console instead of swallowed outright, so a
 * misconfigured deploy (e.g. the PUBLIC_FIREBASE_* vars not set in
 * Vercel's project settings) is diagnosable from devtools instead of
 * indistinguishable from a genuinely offline/denied write.
 */
export function getFirestoreDb(): Firestore | null {
  if (attempted) return db;
  attempted = true;

  const missing = missingConfigKeys();
  if (missing.length > 0) {
    console.error(
      `[rsvp] Firebase not initialized -- missing env var(s): ${missing.join(', ')}. ` +
        'These must be set at build time (PUBLIC_-prefixed, see .env.example) -- on Vercel, ' +
        'add them under Project Settings -> Environment Variables and redeploy.'
    );
    return null;
  }

  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (error) {
    console.error('[rsvp] Firebase initializeApp/getFirestore failed:', error);
    db = null;
  }

  return db;
}
