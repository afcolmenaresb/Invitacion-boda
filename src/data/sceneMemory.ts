import type { Guest } from './guests';

/**
 * Single source of truth for the second scene's copy ("El recuerdo que
 * todavía no existe"). MemoryScene.astro renders these values; nothing
 * about this text lives in InvitationExperience.astro or any animation
 * script -- all of it is centralized here so it stays easy to edit in one
 * place.
 */
export const memoryScene = {
  eyebrow: 'El recuerdo que todavía no existe',
  title: 'Hay recuerdos que empiezan antes de suceder.',
  // Four short, separate lines -- each its own DOM node (so MemoryScene can
  // control their individual appearance/composition) but written to read
  // as a single continuous memory.
  body: [
    'Una tarde tibia en Bahía.',
    'La arena bajo los pies.',
    'Las personas que amamos.',
    'Nosotros diciendo que sí.',
  ],
  // The final line depends on Guest.addressing -- see getMemorySceneFinalLine.
  finalLine: {
    singular: '¿Puedes sentirlo?',
    plural: '¿Pueden sentirlo?',
  },
  cta: 'Descubrir el destino',
  backLabel: 'Volver a la portada',
};

/** Derives MemoryScene's dynamic closing line from Guest.addressing alone. */
export function getMemorySceneFinalLine(addressing: Guest['addressing']): string {
  return memoryScene.finalLine[addressing];
}
