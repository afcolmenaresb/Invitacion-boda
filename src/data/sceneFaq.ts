/**
 * Single source of truth for the "Preguntas frecuentes" page -- reached
 * from AboutScene's own secondary CTA. FaqScene.astro renders these
 * values. Question/answer copy is verbatim, unedited, per spec ("no
 * reescribas ni resumas nada") -- each answer line here is exactly one
 * line as given, each its own paragraph within that answer.
 */
export const sceneFaq = {
  title: 'FAQ',
  backLabel: 'Volver a un poco de nosotros',
  backVisibleLabel: 'Nosotros',
  items: [
    {
      question: '¿Cómo nos conocimos?',
      answer: [
        'La versión oficial dice que simplemente coincidimos en el momento perfecto.',
        'La versión desclasificada involucra una operación encubierta, nombres en código y un intento de obtener información sensible sobre la economía paraguaya.',
        'Hasta hoy, ninguna de las partes ha reconocido formalmente los hechos.',
      ],
    },
    {
      question: '¿Cómo se resuelven los debates importantes?',
      answer: [
        'Primero, argumentos estructurados.',
        'Después, una lista de pros y contras.',
        'Si la situación escala, aparece una hoja de cálculo.',
        'Y cuando la diplomacia fracasa definitivamente: piedra, papel o tijera.',
      ],
    },
    {
      question: '¿Quién es el cazador oficial de insectos de la casa?',
      answer: [
        'Al principio, ambos corremos en direcciones opuestas.',
        'Después de una breve evaluación de riesgos, Andrés regresa armado con una zapatilla y una cantidad considerable de valentía fingida.',
      ],
    },
    {
      question: '¿Quién sobreviviría más tiempo en una isla desierta?',
      answer: [
        'Fátima, porque probablemente ya tenga un plan estratégico de supervivencia. Andrés intentaría hacerse amigo de los cocos.',
      ],
    },
    {
      question: '¿Quién tiene el monopolio del control remoto?',
      answer: [
        'Fátima.',
        'Aunque el poder es principalmente simbólico, porque Andrés suele quedarse dormido antes de que termine la primera media hora de la película.',
      ],
    },
    {
      question: '¿Quién comete "traición de series"?',
      answer: [
        'Fátima.',
        'No siempre consigue esperar al siguiente capítulo y, ocasionalmente, avanza sin autorización.',
        'Lo verdaderamente impresionante es verla fingir sorpresa cuando después lo vemos juntos.',
      ],
    },
    {
      question: '¿Quién tarda más en arreglarse para salir?',
      answer: [
        'Andrés empieza dos horas antes.',
        'Fátima empieza veinte minutos antes.',
        'Por razones que la ciencia todavía no consigue explicar, ella termina esperando en la puerta.',
      ],
    },
    {
      question: '¿Cómo se dividen las tareas de la cocina?',
      answer: [
        'Andrés cocina como si estuviera participando en un programa donde debe improvisar con lo que encuentre en la heladera.',
        'Fátima dirige la barra, prueba los resultados y ostenta el título indiscutible de campeona mundial de lavar platos.',
      ],
    },
    {
      question: '¿Quién dijo "te amo" primero?',
      answer: [
        'Andrés lo dijo primero.',
        'Fátima sostiene que ella lo había pensado mucho antes y que simplemente estaba esperando "el momento perfecto".',
        'El tribunal todavía no ha determinado si pensar cuenta.',
      ],
    },
    {
      question: '¿Quién es el más mimado de los dos?',
      answer: [
        'Oficialmente, es un empate técnico.',
        'Extraoficialmente, si se rompe un vaso, el día sale mal o el universo se pone ligeramente hostil, Fátima activa inmediatamente el protocolo de abrazos de emergencia.',
      ],
    },
    {
      question: '¿Quién duerme más?',
      answer: [
        'Andrés. Sin discusión.',
        'Entre salir muy temprano a trabajar y volver de noche, Fátima prácticamente ha convertido ocho horas de sueño en una leyenda urbana.',
        'De hecho, existen sospechas de que este viaje entero sea parte de un elaborado plan suyo para conseguir, por fin, una siesta.',
      ],
    },
  ],
};
