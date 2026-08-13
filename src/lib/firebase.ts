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

function hasCompleteConfig(): boolean {
  return Object.values(firebaseConfig).every((value) => typeof value === 'string' && value.length > 0);
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
 * RSVP feature alone, never the rest of the invitation.
 */
export function getFirestoreDb(): Firestore | null {
  if (attempted) return db;
  attempted = true;

  if (!hasCompleteConfig()) {
    return null;
  }

  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch {
    db = null;
  }

  return db;
}
