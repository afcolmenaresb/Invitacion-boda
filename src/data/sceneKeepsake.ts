import type { Guest } from './guests';

/**
 * Single source of truth for the eighth scene's copy ("El recuerdo",
 * reached from CelebrationScene's own primary CTA). KeepsakeScene.astro
 * renders these values; nothing about this text lives in
 * InvitationExperience.astro or any animation script -- same convention
 * as sceneMemory.ts/sceneDestination.ts/.../sceneCelebration.ts.
 *
 * The final line depends on Guest.addressing -- see getKeepsakeFinalLine.
 * Everything else here is shared.
 */
export const sceneKeepsake = {
  eyebrow: 'El recuerdo',
  title: 'Y después, lo inolvidable.',
  // Three shared lines -- each its own DOM node inside .keepsake__body
  // (see KeepsakeScene.astro) but written to read as one continuous
  // thought; the final, guest-dependent line is appended after them.
  body: ['No será solo una boda.', 'Será un recuerdo compartido.', 'De esos que se quedan a vivir en uno.'],
  // The final line depends on Guest.addressing -- see getKeepsakeFinalLine.
  finalLine: {
    singular: 'Y nos emociona imaginarlo contigo.',
    plural: 'Y nos emociona imaginarlo con ustedes.',
  },
  ctaPrimary: 'Ver información del viaje',
  backLabel: 'Volver a la celebración',
  backVisibleLabel: 'Celebración',
};

/** Derives KeepsakeScene's dynamic final line from Guest.addressing alone. */
export function getKeepsakeFinalLine(addressing: Guest['addressing']): string {
  return sceneKeepsake.finalLine[addressing];
}
