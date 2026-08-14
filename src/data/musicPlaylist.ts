/**
 * Central playlist for the invitation's persistent background music.
 * InvitationExperience.astro's own script reads this list, shuffles it
 * once per visit, and plays through it on loop.
 *
 * The list itself is discovered automatically from every audio-compatible
 * file in /public/audio at build time -- drop a file in there (any
 * extension in SUPPORTED_EXTENSIONS below) and it's in the rotation on
 * the next build, no manual entry needed here. This module only ever
 * runs in Node (Astro frontmatter, at build time), never shipped to the
 * browser, so using `node:fs` directly here is safe.
 *
 * Paths are relative to /public/audio (so a bare filename here is enough
 * -- InvitationExperience.astro prefixes each with `${base}/audio/`
 * itself, the same convention every other static asset in this project
 * already follows).
 */
import { readdirSync } from 'node:fs';
import { extname, join } from 'node:path';

// Resolved from the project root (Astro always runs `astro build`/`astro
// dev` from there) rather than import.meta.url -- this file is only ever
// evaluated at build time via Astro's own frontmatter/SSR module
// pipeline, which does not reliably preserve import.meta.url as this
// file's real on-disk location.
const AUDIO_DIR = join(process.cwd(), 'public', 'audio');

// Broad but explicit -- covers every format a plain <audio> element can
// play, including the odd-but-real case already in this project of an
// audio-only track saved with a .mp4 extension.
const SUPPORTED_EXTENSIONS = new Set(['.m4a', '.mp3', '.mp4', '.aac', '.wav', '.ogg', '.oga', '.opus', '.weba', '.flac']);

function discoverPlaylist(): string[] {
  try {
    return readdirSync(AUDIO_DIR)
      .filter((name) => SUPPORTED_EXTENSIONS.has(extname(name).toLowerCase()))
      .sort();
  } catch {
    // Missing/unreadable public/audio -- degrade to no music rather than
    // failing the build (same "never breaks the rest of the site"
    // principle as getFirestoreDb's own missing-config fallback).
    return [];
  }
}

export const musicPlaylist: string[] = discoverPlaylist();
