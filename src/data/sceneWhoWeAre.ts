/**
 * Single source of truth for the "¿Quiénes somos?" selector screen --
 * reached from AboutScene's own primary CTA. WhoWeAreScene.astro renders
 * these values; nothing about this text lives in InvitationExperience.astro
 * or any animation script -- same convention as every other sceneX.ts file.
 */
export const sceneWhoWeAre = {
  title: '¿Quiénes somos?',
  body: 'Toca un nombre para conocer un poco más.',
  fatimaLabel: 'Fátima',
  andresLabel: 'Andrés',
  backLabel: 'Volver',
  backVisibleLabel: 'Atrás',
};
