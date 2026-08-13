/**
 * Central playlist for the invitation's persistent background music.
 * InvitationExperience.astro's own script reads this list, shuffles it
 * once per visit, and plays through it on loop -- add, remove or reorder
 * tracks here and nothing else needs to change.
 *
 * Paths are relative to /public/audio (so a bare filename here is enough
 * -- InvitationExperience.astro prefixes each with `${base}/audio/`
 * itself, the same convention every other static asset in this project
 * already follows).
 */
export const musicPlaylist: string[] = ['01-until-i-found-you-instrumental.m4a'];
