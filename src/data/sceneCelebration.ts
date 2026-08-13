/**
 * Single source of truth for the seventh scene's copy ("La celebración",
 * reached from CeremonyScene's own primary CTA). CelebrationScene.astro
 * renders these values; nothing about this text lives in
 * InvitationExperience.astro or any animation script -- same convention
 * as sceneMemory.ts/sceneDestination.ts/sceneJourney.ts/
 * sceneImaginedDays.ts/sceneCeremony.ts.
 *
 * No Guest.addressing dependency here -- all five lines are shared,
 * nothing singles out the guest directly.
 */
export const sceneCelebration = {
  eyebrow: 'La celebración',
  title: 'Después, la alegría.',
  // Five short lines -- each its own DOM node inside .celebration__body
  // (see CelebrationScene.astro) but written to read as one continuous
  // scene.
  body: ['La música', 'La brisa del mar', 'Las luces encendiéndose', 'Todos bailando', 'Todos celebrando'],
  closing: 'Porque después del sí, empieza la fiesta.',
  ctaPrimary: 'Seguir descubriendo',
  backLabel: 'Volver a la ceremonia',
  backVisibleLabel: 'Ceremonia',
};
