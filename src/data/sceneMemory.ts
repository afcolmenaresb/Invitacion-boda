/**
 * Single source of truth for the second scene's copy ("El recuerdo que
 * todavía no existe"). MemoryScene.astro renders these values; nothing
 * about this text lives in the transition script or any other component.
 */
export const memoryScene = {
  eyebrow: 'El recuerdo que todavía no existe',
  title: 'Hay recuerdos que empiezan antes de suceder.',
  body: [
    'Una tarde tibia en Bahía.',
    'La arena bajo los pies.',
    'Las personas que amamos reunidas.',
    'Nosotros diciendo que sí.',
    'Y tú, ahí.',
  ],
  closing: ['Todavía no ha ocurrido.', 'Pero ya empezó a quedarse con nosotros.'],
  cta: 'Descubrir el destino',
  backLabel: 'Volver a la portada',
};
