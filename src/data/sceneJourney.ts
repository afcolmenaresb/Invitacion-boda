import type { Guest } from './guests';

/**
 * Single source of truth for the fourth scene's copy ("el viaje", still
 * inside "Seguir descubriendo"). JourneyScene.astro renders these values;
 * nothing about this text lives in InvitationExperience.astro or any
 * animation script -- same convention as sceneMemory.ts/sceneDestination.ts.
 */
export const sceneJourney = {
  intro: 'No queremos invitarte solamente a nuestra boda.',
  // The second block depends on Guest.addressing -- see getJourneyBodyLine.
  body: {
    singular: 'Queremos compartir contigo unos días que merezcan ser recordados.',
    plural: 'Queremos compartir con ustedes unos días que merezcan ser recordados.',
  },
  closing: 'Antes del “sí”, está el viaje.',
  ctaPrimary: 'Imagina esos días',
  ctaSecondary: 'Un poco de nosotros',
  backLabel: 'Volver al destino',
  backVisibleLabel: 'Destino',
};

/** Derives JourneyScene's dynamic second block from Guest.addressing alone. */
export function getJourneyBodyLine(addressing: Guest['addressing']): string {
  return sceneJourney.body[addressing];
}
