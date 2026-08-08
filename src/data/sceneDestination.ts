import type { Guest } from './guests';

/**
 * Single source of truth for the third scene's copy (destination reveal).
 * DestinationScene.astro renders these values; nothing about this text
 * lives in InvitationExperience.astro or any animation script -- same
 * convention as sceneMemory.ts for MemoryScene.
 */
export const sceneDestination = {
  eyebrow: 'El destino',
  title: 'Imbassaí, Bahía',
  date: '8 de junio de 2027',
  body: 'Donde la arena se encuentra con el mar,\ny el tiempo parece ir más despacio.',
  // The closing line depends on Guest.addressing -- see getDestinationFinalLine.
  finalLine: {
    singular: 'Allí queremos celebrar contigo.',
    plural: 'Allí queremos celebrar con ustedes.',
  },
  ctaPrimary: 'Seguir descubriendo',
  ctaSecondary: 'Ver información del viaje',
  backLabel: 'Volver al recuerdo',
  backVisibleLabel: 'Recuerdo',
};

/** Derives DestinationScene's dynamic closing line from Guest.addressing alone. */
export function getDestinationFinalLine(addressing: Guest['addressing']): string {
  return sceneDestination.finalLine[addressing];
}
