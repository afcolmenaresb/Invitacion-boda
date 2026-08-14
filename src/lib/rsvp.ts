// RSVP persistence for page 9 (StayScene.astro) -- Cloud Firestore only,
// storing exactly the five fields the spec calls for, nothing else.
//
// Collection name: "rsvp". Document id: the guest's own inviteId
// (passed through as guestId -- kept as that field name for
// compatibility with the existing Firestore rules, but its value is
// always Guest.inviteId, never Guest.slug/displayName -- see
// src/data/guests.ts), so re-submitting (changing your mind) overwrites
// the same document instead of piling up duplicates -- "permitir
// modificarla después" is just calling saveRsvpResponse again.

import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { getFirestoreDb, getFirebaseConfigDiagnostics } from './firebase';

export type AttendanceStatus = 'attending' | 'maybe' | 'not_attending';

const RSVP_COLLECTION = 'rsvp';

export interface SaveRsvpInput {
  guestId: string;
  guestName: string;
  attendanceStatus: AttendanceStatus;
  partySize: number;
}

export interface SavedRsvpResponse {
  attendanceStatus: AttendanceStatus;
  partySize: number;
}

const VALID_ATTENDANCE_STATUSES: AttendanceStatus[] = ['attending', 'maybe', 'not_attending'];

/**
 * Reads back this guest's previously saved RSVP document (if any), so
 * StayScene can restore it as the pre-selected option on a later visit
 * -- a `get` on a single known document id, never a query/listing over
 * the collection (see firestore.rules: `allow get: if true; allow list:
 * if false;`). Returns null both when no document exists yet and when
 * the read fails for any reason (missing/broken Firebase config,
 * offline, denied by rules, malformed data) -- callers treat "nothing to
 * restore" and "couldn't check" identically, leaving the RSVP UI simply
 * unselected. Never throws.
 */
export async function getRsvpResponse(guestId: string): Promise<SavedRsvpResponse | null> {
  if (!guestId) return null;

  const db = getFirestoreDb();
  if (!db) return null;

  try {
    const snapshot = await getDoc(doc(db, RSVP_COLLECTION, guestId));
    if (!snapshot.exists()) return null;

    const data = snapshot.data();
    const attendanceStatus = data.attendanceStatus;
    const partySize = data.partySize;

    if (!VALID_ATTENDANCE_STATUSES.includes(attendanceStatus)) return null;
    if (typeof partySize !== 'number' || partySize <= 0) return null;

    return { attendanceStatus, partySize };
  } catch (error) {
    // Same non-blocking philosophy as saveRsvpResponse's own catch below
    // -- logged for diagnosability, never surfaced to the visitor. A
    // failed restore just leaves the RSVP block unselected, exactly like
    // a first-time visit.
    const code = (error as { code?: string })?.code ?? 'unknown';
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[rsvp] getRsvpResponse failed -- code: ${code}, message: ${message}`);
    return null;
  }
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

  try {
    await setDoc(doc(db, RSVP_COLLECTION, input.guestId), {
      guestId: input.guestId,
      guestName: input.guestName,
      attendanceStatus: input.attendanceStatus,
      partySize: input.partySize,
      respondedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    // Logged, not swallowed -- e.g. a rules mismatch (permission-denied)
    // or an invalid-argument from a malformed write shows up here with
    // its real Firestore error code/message instead of being
    // indistinguishable from "offline". StayScene's own UI still only
    // ever shows its quiet inline error either way.
    const code = (error as { code?: string })?.code ?? 'unknown';
    const message = error instanceof Error ? error.message : String(error);
    const { projectId, envVarsPresent } = getFirebaseConfigDiagnostics();
    console.error(
      `[rsvp] saveRsvpResponse failed -- code: ${code}, message: ${message}, projectId: ${projectId ?? '(not set)'}`
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
