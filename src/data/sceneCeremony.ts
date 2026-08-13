/**
 * Single source of truth for the sixth scene's copy ("Y entonces, el
 * 'sí'", reached from ImaginedDaysScene's own primary CTA).
 * CeremonyScene.astro renders these values; nothing about this text
 * lives in InvitationExperience.astro or any animation script -- same
 * convention as sceneMemory.ts/sceneDestination.ts/sceneJourney.ts/
 * sceneImaginedDays.ts.
 *
 * No Guest.addressing dependency here -- like sceneImaginedDays.ts,
 * nothing in this copy singles out the guest directly, so there is no
 * singular/plural variant to derive.
 */
export const sceneCeremony = {
  heading: 'Y entonces, el “sí”.',
  // Three short, separate lines -- each its own DOM node (so
  // CeremonyScene can stagger their individual appearance) but written
  // to read as one continuous scene.
  lines: ['Frente al mar.', 'Al caer la tarde.', 'Rodeados de quienes amamos.'],
  // Rendered uppercase via CSS (text-transform), same convention as
  // every other small/label-style text in this project (see .imagined__
  // eyebrow, .journey__cta, etc.) -- stored here in natural case.
  date: '8 · junio · 2027',
  cta: 'Celebremos',
  backLabel: 'Volver a imagina esos días',
  backVisibleLabel: 'Imagina esos días',
};
