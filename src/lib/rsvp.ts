// RSVP persistence for page 9 (StayScene.astro) -- Cloud Firestore only,
// storing exactly the five fields the spec calls for, nothing else.
//
// Collection name: "rsvp". Document id: the guest's own slug (guestId),
// so re-submitting (changing your mind) overwrites the same document
// instead of piling up duplicates -- "permitir modificarla después" is
// just calling saveRsvpResponse again.

import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { getFirestoreDb } from './firebase';

export type AttendanceStatus = 'attending' | 'maybe' | 'not_attending';

const RSVP_COLLECTION = 'rsvp';

export interface SaveRsvpInput {
  guestId: string;
  guestName: string;
  attendanceStatus: AttendanceStatus;
  partySize: number;
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
  } catch {
    return false;
  }
}
