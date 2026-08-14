/**
 * Single source of truth for the "Nuestros recuerdos" placeholder screen
 * -- reached from AboutScene's own third CTA. A clean placeholder only,
 * per spec ("no inventes contenido todavía"): no gallery, no videos yet.
 * MemoriesScene.astro renders these values.
 */
export const sceneMemories = {
  eyebrow: 'Un poco de nosotros',
  title: 'Nuestros recuerdos',
  body: 'Estamos preparando este rincón con cariño: videos y fotografías de antes de la boda y, más adelante, todo el material del día -- listo para guardar. Vuelve pronto.',
  backLabel: 'Volver a un poco de nosotros',
  backVisibleLabel: 'Nosotros',
};
