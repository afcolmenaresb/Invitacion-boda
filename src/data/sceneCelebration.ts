import type { Guest } from './guests';

/**
 * Single source of truth for the seventh scene's copy ("La celebración",
 * reached from CeremonyScene's own primary CTA). CelebrationScene.astro
 * renders these values; nothing about this text lives in
 * InvitationExperience.astro or any animation script -- same convention
 * as sceneMemory.ts/sceneDestination.ts/sceneJourney.ts/
 * sceneImaginedDays.ts/sceneCeremony.ts.
 *
 * The body's final line depends on Guest.addressing -- see
 * getCelebrationFinalLine. Everything else here is shared.
 */
export const sceneCelebration = {
  eyebrow: 'La celebración',
  title: 'Y después, la alegría.',
  // Three shared lines -- each its own DOM node inside .celebration__body
  // (see CelebrationScene.astro) but written to read as one continuous
  // scene; the final, guest-dependent line is appended after them.
  body: ['La música empezando a envolverlo todo.', 'La brisa del mar.', 'Las luces encendiéndose.'],
  // The final line depends on Guest.addressing -- see getCelebrationFinalLine.
  finalLine: {
    singular: 'Y nosotros celebrando contigo.',
    plural: 'Y nosotros celebrando con ustedes.',
  },
  closing: 'Porque después del sí, empieza la fiesta.',
  ctaPrimary: 'Seguir descubriendo',
  backLabel: 'Volver a la ceremonia',
  backVisibleLabel: 'Ceremonia',
};

/** Derives CelebrationScene's dynamic final line from Guest.addressing alone. */
export function getCelebrationFinalLine(addressing: Guest['addressing']): string {
  return sceneCelebration.finalLine[addressing];
}
