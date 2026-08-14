// RSVP persistence for page 9 (StayScene.astro) -- Cloud Firestore only,
// storing exactly the five fields the spec calls for, nothing else.
//
// Collection name: "rsvp". Document id: the guest's own slug (guestId),
// so re-submitting (changing your mind) overwrites the same document
// instead of piling up duplicates -- "permitir modificarla después" is
// just calling saveRsvpResponse again.

import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { getFirestoreDb, getFirebaseConfigDiagnostics } from './firebase';

export type AttendanceStatus = 'attending' | 'maybe' | 'not_attending';

const RSVP_COLLECTION = 'rsvp';

export interface SaveRsvpInput {
  guestId: string;
  guestName: string;
  attendanceStatus: AttendanceStatus;
  partySize: number;
}

/**
 * TEMPORARY runtime diagnostic hook -- RSVP saves are still failing in
 * production and DevTools isn't reachable on the main mobile/tablet
 * experience, so this records exactly which stage of the save a failure
 * happened at (see the `stage` values inline below) plus the real runtime
 * values involved, for StayScene.astro to render on-screen. Holds only
 * the most recent failed attempt's diagnostics, cleared on the next
 * successful save. Remove this, its call sites, and the on-screen block
 * in StayScene.astro once the underlying save error is understood/fixed.
 */
export interface RsvpRuntimeDiagnostics {
  stage: 'before-document-reference' | 'document-reference-created' | 'before-setDoc' | 'setDoc-failed';
  code: string;
  message: string;
  guestId: string;
  guestIdType: string;
  guestIdLength: number | null;
  guestName: string;
  attendanceStatus: string;
  partySize: number;
  intendedPath: string;
  documentPath: string | null;
  projectId: string | undefined;
  envVarsPresent: Record<string, boolean>;
}

let lastRsvpDiagnostics: RsvpRuntimeDiagnostics | null = null;

export function getLastRsvpDiagnostics(): RsvpRuntimeDiagnostics | null {
  return lastRsvpDiagnostics;
}

/**
 * Writes (or overwrites) this guest's RSVP document. Never throws --
 * returns false on any failure (missing/broken Firebase config, offline,
 * denied by security rules, etc.) so the calling UI can show a quiet
 * inline error and let the visitor try again, instead of the RSVP block
 * -- or the rest of the page -- breaking.
 */
export async function saveRsvpResponse(input: SaveRsvpInput): Promise<boolean> {
  const db = getFirestoreDb();
  if (!db) return false;

  const guestIdType = typeof input.guestId;
  const guestIdLength = typeof input.guestId === 'string' ? input.guestId.length : null;
  const intendedPath = `rsvp/${input.guestId}`;

  // stage 1: before-document-reference -- logs the exact runtime values
  // this attempt is about to build a reference from, before anything
  // Firestore-specific runs.
  console.log('[rsvp] stage: before-document-reference', {
    guestId: input.guestId,
    guestIdType,
    guestIdLength,
    intendedPath,
  });

  // A blank guestId would reach doc() below as doc(db, "rsvp", ""), which
  // Firestore normalizes down to the single segment "rsvp" -- a
  // collection path, not a document path -- and rejects with
  // invalid-argument ("Document references must have an even number of
  // segments, but rsvp has 1"). Caught here instead, before ever building
  // an invalid reference -- kept as-is from the prior fix, only the
  // diagnostics recording around it is new.
  if (!input.guestId) {
    const { projectId, envVarsPresent } = getFirebaseConfigDiagnostics();
    lastRsvpDiagnostics = {
      stage: 'before-document-reference',
      code: 'missing-guestId',
      message: 'guestId is empty -- cannot build a valid rsvp/{guestId} reference.',
      guestId: input.guestId,
      guestIdType,
      guestIdLength,
      guestName: input.guestName,
      attendanceStatus: input.attendanceStatus,
      partySize: input.partySize,
      intendedPath,
      documentPath: null,
      projectId,
      envVarsPresent,
    };
    console.error('[rsvp] saveRsvpResponse failed -- stage: before-document-reference, code: missing-guestId, missing guestId, cannot build a valid rsvp/{guestId} reference.');
    return false;
  }

  let rsvpDocRef;
  try {
    // doc(collection(db, "rsvp"), guestId) always resolves to the
    // document path rsvp/{guestId} -- two segments, collection then
    // document id -- never the bare "rsvp" collection reference itself.
    rsvpDocRef = doc(collection(db, RSVP_COLLECTION), input.guestId);
  } catch (error) {
    const code = (error as { code?: string })?.code ?? 'unknown';
    const message = error instanceof Error ? error.message : String(error);
    const { projectId, envVarsPresent } = getFirebaseConfigDiagnostics();
    lastRsvpDiagnostics = {
      stage: 'before-document-reference',
      code,
      message,
      guestId: input.guestId,
      guestIdType,
      guestIdLength,
      guestName: input.guestName,
      attendanceStatus: input.attendanceStatus,
      partySize: input.partySize,
      intendedPath,
      documentPath: null,
      projectId,
      envVarsPresent,
    };
    console.error(`[rsvp] saveRsvpResponse failed -- stage: before-document-reference, code: ${code}, message: ${message}`);
    console.error('[rsvp] full error object:', error);
    return false;
  }

  // stage 2: document-reference-created -- the reference itself built
  // without throwing; its own .path is what Firestore actually resolved,
  // which should read exactly "rsvp/{guestId}".
  console.log('[rsvp] stage: document-reference-created', { path: rsvpDocRef.path });

  try {
    // stage 3: before-setDoc
    console.log('[rsvp] stage: before-setDoc');
    await setDoc(rsvpDocRef, {
      guestId: input.guestId,
      guestName: input.guestName,
      attendanceStatus: input.attendanceStatus,
      partySize: input.partySize,
      respondedAt: serverTimestamp(),
    });
    lastRsvpDiagnostics = null;
    return true;
  } catch (error) {
    // stage 4: setDoc-failed -- logged, not swallowed. e.g. a rules
    // mismatch (permission-denied) or an invalid-argument from a
    // malformed write shows up here with its real Firestore error
    // code/message instead of being indistinguishable from "offline".
    // StayScene's own UI still only ever shows its quiet inline error
    // either way (plus, temporarily, this diagnostic block).
    const code = (error as { code?: string })?.code ?? 'unknown';
    const message = error instanceof Error ? error.message : String(error);
    const { projectId, envVarsPresent } = getFirebaseConfigDiagnostics();
    lastRsvpDiagnostics = {
      stage: 'setDoc-failed',
      code,
      message,
      guestId: input.guestId,
      guestIdType,
      guestIdLength,
      guestName: input.guestName,
      attendanceStatus: input.attendanceStatus,
      partySize: input.partySize,
      intendedPath,
      documentPath: rsvpDocRef.path,
      projectId,
      envVarsPresent,
    };
    console.error(
      `[rsvp] saveRsvpResponse failed -- stage: setDoc-failed, code: ${code}, message: ${message}, projectId: ${projectId ?? '(not set)'}`
    );
    console.error('[rsvp] PUBLIC_FIREBASE_* env var presence (booleans only, no values):', envVarsPresent);
    // permission-denied almost always means firestore.rules (see that
    // file at the repo root) was never actually deployed to this
    // Firebase project -- it is NOT applied automatically by this repo,
    // only via the Firebase console or `firebase deploy --only
    // firestore:rules` (see that file's own top comment). A missing
    // PUBLIC_FIREBASE_* var would already have been caught earlier, in
    // getFirestoreDb() itself (see firebase.ts), and never reach here.
    if (code === 'permission-denied') {
      console.error(
        '[rsvp] code is permission-denied: the currently published Firestore Rules for this project are the most likely cause -- verify firestore.rules has actually been deployed (Firebase console > Firestore Database > Rules, or `firebase deploy --only firestore:rules`), not just present in this repo.'
      );
    }
    console.error('[rsvp] full error object:', error);
    return false;
  }
}
