/**
 * Single source of truth for Fátima's individual "¿Quiénes somos?" page --
 * reached from WhoWeAreScene's own duck/Fátima control. PersonScene.astro
 * renders these values (shared with sceneAndres.ts's own shape). Body
 * copy is verbatim, unedited, per spec ("no reescribas ni resumas nada") --
 * each line here is exactly one line as given, each its own paragraph.
 */
export const sceneFatima = {
  title: 'Fátima',
  body: [
    'Es el tipo de persona que se ríe de absolutamente todo y que, cuando algo le emociona, te lo cuenta en velocidad x2.',
    'Si te subes a su auto, prepárate: cualquier trayecto puede convertirse inesperadamente en una misión secreta. Hace casi todo con intensidad, incluyendo defender su racha de Duolingo como si hubiera un título mundial en juego.',
    'Tiene una facilidad especial para convertir lo cotidiano en una historia que después vale la pena contar.',
    'Y para ella, esta boda es mucho más que dar el "sí".',
    'Es la excusa perfecta para abrazar a sus personas favoritas, celebrar la vida y hacer que, por unos días, todos formemos parte de la misma aventura.',
  ],
  backLabel: 'Volver a quiénes somos',
  backVisibleLabel: 'Quiénes somos',
};
