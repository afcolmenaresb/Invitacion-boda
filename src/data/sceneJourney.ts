import type { Guest } from './guests';

/**
 * Single source of truth for the fourth scene's copy ("el viaje", still
 * inside "Seguir descubriendo"). JourneyScene.astro renders these values;
 * nothing about this text lives in InvitationExperience.astro or any
 * animation script -- same convention as sceneMemory.ts/sceneDestination.ts.
 */
export const sceneJourney = {
  // The first block depends on Guest.addressing too -- see getJourneyIntroLine.
  intro: {
    singular: 'No queremos invitarte solamente a nuestra boda.',
    plural: 'No queremos invitarlos solamente a nuestra boda.',
  },
  // The second block depends on Guest.addressing -- see getJourneyBodyLine.
  body: {
    singular: 'Queremos compartir contigo unos días que merezcan ser recordados.',
    plural: 'Queremos compartir con ustedes unos días que merezcan ser recordados.',
  },
  closing: 'Antes del “sí”, está el viaje.',
  // The primary CTA depends on Guest.addressing too -- see getJourneyCtaPrimary.
  ctaPrimary: {
    singular: 'Imagina esos días',
    plural: 'Imaginen esos días',
  },
  ctaSecondary: 'Un poco de nosotros',
  backLabel: 'Volver al destino',
  backVisibleLabel: 'Destino',
};

/** Derives JourneyScene's dynamic first block from Guest.addressing alone. */
export function getJourneyIntroLine(addressing: Guest['addressing']): string {
  return sceneJourney.intro[addressing];
}

/** Derives JourneyScene's dynamic second block from Guest.addressing alone. */
export function getJourneyBodyLine(addressing: Guest['addressing']): string {
  return sceneJourney.body[addressing];
}

/** Derives JourneyScene's dynamic primary CTA from Guest.addressing alone. */
export function getJourneyCtaPrimary(addressing: Guest['addressing']): string {
  return sceneJourney.ctaPrimary[addressing];
}
