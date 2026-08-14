/**
 * Single source of truth for the "Un poco de nosotros" landing screen --
 * the entry point of this small, self-contained sub-tree (about ->
 * whoWeAre -> {fatima, andres}, and about -> faq). AboutScene.astro
 * renders these values; nothing about this text lives in
 * InvitationExperience.astro or any animation script -- same convention
 * as every other sceneX.ts file.
 */
export const sceneAbout = {
  eyebrow: 'Antes de seguir',
  title: 'Un poco de nosotros',
  body: 'Una pequeña pausa en el camino -- para que nos conozcas un poco mejor, y para resolver esas preguntas que quizá te estés haciendo.',
  ctaWhoWeAre: '¿Quiénes somos?',
  ctaFaq: 'Preguntas frecuentes',
  // Reached from JourneyScene's own secondary CTA -- back returns there.
  backLabel: 'Volver al viaje',
  backVisibleLabel: 'El viaje',
};
