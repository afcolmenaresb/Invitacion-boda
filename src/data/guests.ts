export interface Guest {
  /**
   * Stable, random, non-guessable identifier -- the ONE true identity for
   * this invitation group. Generated once when the guest is added and
   * never regenerated afterwards (a reload, a slug edit, anything) --
   * doing so would invalidate every link already sent and orphan any
   * RSVP already written under it (see rsvp.ts: the Firestore doc id
   * literally *is* this value). Never derived from displayName/slug, never
   * sequential (no guest1/guest2/incrementing ids -- those are guessable
   * and enumerable). Minimum 12 characters of high-entropy
   * alphanumerics, e.g. generated with crypto.randomUUID().replace(/-/g,
   * '').slice(0, 16) or nanoid(16).
   *
   * This is what actually gates access to a guest's personalized page --
   * see src/pages/i/[invite].astro, which only pre-renders the exact
   * `${slug}-${inviteId}` combination for each guest below. A visitor who
   * guesses/mutates the slug half of a URL but not the inviteId half hits
   * a 404, never another guest's invitation.
   */
  inviteId: string;
  /**
   * URL-safe slug, e.g. `stefania-y-matias`. Lowercase, hyphen-separated,
   * no ampersands. Presentation only -- readable, but never used alone as
   * an identifier or a Firestore document id (see inviteId above). Two
   * guests could theoretically share a slug; they can never share an
   * inviteId.
   */
  slug: string;
  /** Guest name(s) as shown on the invitation. Recommended max 32 characters. */
  displayName: string;
  /**
   * How MemoryScene's dynamic closing line addresses this guest --
   * 'singular' ("Y tú, ahí.") for one person, 'plural' ("Y ustedes, ahí.")
   * for a couple, family or group. This is the single explicit, typed
   * source of truth for that choice -- never derive it by inspecting
   * displayName for "y"/spaces/etc., and never hardcode a slug list
   * anywhere else. Every guest below sets it explicitly.
   */
  addressing: 'singular' | 'plural';
  /**
   * Personalized message. Recommended up to 120 visible characters, hard cap
   * MAX_DEDICATION_LENGTH (160 visible characters -- see getVisibleDedicationLength).
   *
   * Write it plainly, in normal Spanish -- Cover.astro automatically runs
   * it through hyphenateSpanishText() (src/lib/spanishHyphenation.ts) at
   * build time, which inserts soft hyphens (U+00AD) at safe, real syllable
   * boundaries wherever a word needs to break across lines. You do not need
   * to hand-annotate long words yourself.
   *
   * Manual override: if you ever need to force (or forbid) a specific break
   * point, insert U+00AD yourself as the `\u00AD` escape -- a word that
   * already contains one is left completely untouched by the automatic
   * hyphenation. Always write it as `\u00AD`, never as a literal invisible
   * character, so it stays visible/greppable in the source.
   * Example: `'incondicional\u00ADmente'`.
   * The automatic hyphenation already skips proper names, surnames, place
   * names (heuristically: capitalized words not at the start of a
   * sentence), acronyms, and URLs on its own -- you shouldn't normally need
   * the override for those.
   */
  dedication: string;
  /**
   * Expected number of people traveling under this invitation -- used
   * only for the RSVP record saved on page 9 (StayScene.astro). Optional:
   * defaults to 1 for 'singular' guests and 2 for 'plural' ones (see
   * getGuestPartySize) when not set explicitly, so existing entries don't
   * need to be filled in immediately.
   */
  partySize?: number;
}

/**
 * Absolute cap on Guest.dedication, counting spaces and punctuation but not
 * soft hyphens (U+00AD) -- see getVisibleDedicationLength. Cover.astro scales
 * the dedication's font-size/line-height continuously up to this length (see
 * computeDedicationTypography there); nothing past it has been designed for
 * or validated to fit safely above .cover__names.
 */
export const MAX_DEDICATION_LENGTH = 160;

/**
 * Dedication length for every visual/timing purpose (typography ramp,
 * writing-animation duration, this max-length check): soft hyphens are
 * invisible unless the browser actually breaks the word there, so they must
 * never count as visible weight -- otherwise an editor adding one or two for
 * better wrapping would unfairly lose real, visible characters off their cap.
 */
export function getVisibleDedicationLength(dedication: string): number {
  return dedication.replace(/\u00AD/g, '').length;
}

// Definitive guest list, imported from the EXPORT WEB spreadsheet (source of
// truth for all real invitations). Every inviteId, slug, displayName,
// dedication, partySize and addressing below is copied verbatim from that
// sheet -- none of it is generated or edited here.
export const guests: Guest[] = [
  {
    inviteId: '8ad4137e29014df6a728',
    slug: 'rosa-y-octavio',
    displayName: 'Rosa y Octavio',
    addressing: 'plural',
    dedication: 'Sin el sacrificio de ustedes, hoy no estaría aquí. ¿Nos darían su bendición en este día tan importante?',
    partySize: 2,
  },
  {
    inviteId: '35e0ae7198fb44ceb2ff',
    slug: 'nicolas-y-tatiana',
    displayName: 'Nicolás y Tatiana',
    addressing: 'plural',
    dedication: 'Los hermanos son bendiciones muy grandes, y tengo al mejor. ¿Nos acompañarían el dia de nuestra boda?',
    partySize: 2,
  },
  {
    inviteId: 'facd42a9bd58453f82b1',
    slug: 'carlos-y-antonia',
    displayName: 'Carlos y Antonia',
    addressing: 'plural',
    dedication: 'Dicen que los tíos mayores son como los abuelos... Me gustaría que estén presentes en nuestra boda',
    partySize: 2,
  },
  {
    inviteId: '221b1486fae44b6fae2c',
    slug: 'benicio-y-mercedes',
    displayName: 'Benicio y Mercedes',
    addressing: 'plural',
    dedication: 'Nos encantaría que puedan acompañarnos en este viaje',
    partySize: 2,
  },
  {
    inviteId: '3f36de6dd4b64bd49636',
    slug: 'jose-a-y-martha',
    displayName: 'José A. y Martha',
    addressing: 'plural',
    dedication: 'Hay viajes que no tendrían sentido sin ciertas personas. ¿Nos acompañarían?',
    partySize: 2,
  },
  {
    inviteId: '26186d9e7d8c458fbbf3',
    slug: 'dionel-y-lida',
    displayName: 'Dionel y Lida',
    addressing: 'plural',
    dedication: 'La vida da segundas oportunidades que nos regalan felicidad, acompáñennos y disfrutemos juntos',
    partySize: 2,
  },
  {
    inviteId: '5272e79abfca499d807d',
    slug: 'efren-y-susana',
    displayName: 'Efrén y Susana',
    addressing: 'plural',
    dedication: 'No puedo recordar cuando vestí de marinerito, pero siempre recordaré que nos acompañen en este día',
    partySize: 2,
  },
  {
    inviteId: '1b104f0d92a8449996e2',
    slug: 'leoncio-y-edna',
    displayName: 'Leoncio y Edna',
    addressing: 'plural',
    dedication: 'Un gran viaje, como el que comenzaremos, se celebra con los más importantes',
    partySize: 2,
  },
  {
    inviteId: '825b37b828344479a45f',
    slug: 'hector-yasmin-y-santi',
    displayName: 'Héctor, Yasmín y Santi',
    addressing: 'plural',
    dedication: 'La de ustedes, en San Francisco... La nuestra... ¿Nos acompañarían en esta aventura tan importante?',
    partySize: 3,
  },
  {
    inviteId: 'bf560f940f2d4d5eb459',
    slug: 'luis-h-raquel-y-gota',
    displayName: 'Luis H,. Raquel y Gota',
    addressing: 'plural',
    dedication: 'Parecía el hermano pequeño... Parecía una gota de bebé... No sería lo mismo sin su presencia.',
    partySize: 3,
  },
  {
    inviteId: '9b4f8dc94dea4a5e9420',
    slug: 'leidy-y-rafa',
    displayName: 'Leidy y Rafa',
    addressing: 'plural',
    dedication: '¡Por fin haremos el viaje de nuestras vidas! Nos encantaría que nos acompañen en este momento tan especial.',
    partySize: 2,
  },
  {
    inviteId: 'c4028ba1e4114fc1ae9b',
    slug: 'mauricio-lorena-gaby-y-mariana',
    displayName: 'Mauricio, Lorena, Gaby y Mariana',
    addressing: 'plural',
    dedication: '¡Por fin haremos el viaje de nuestras vidas! Nos encantaría que nos acompañen en este momento tan especial.',
    partySize: 4,
  },
  {
    inviteId: '548eb769bc934d7cbfc3',
    slug: 'dario-katherine-mati-y-vicky',
    displayName: 'Darío, Katherine, Mati y Vicky',
    addressing: 'plural',
    dedication: 'Hay viajes que no tendrían sentido sin ciertas personas. ¿Nos acompañarían?',
    partySize: 4,
  },
  {
    inviteId: 'dd2ec31558314205aba6',
    slug: 'nestor-katherine-y-alejo',
    displayName: 'Néstor, Katherine y Alejo',
    addressing: 'plural',
    dedication: '¡Por fin haremos el viaje de nuestras vidas! Nos encantaría que nos acompañen en este momento tan especial.',
    partySize: 3,
  },
  {
    inviteId: '054b68cade59407fa93d',
    slug: 'diana-y-juan-sebastian',
    displayName: 'Diana y Juan Sebastián',
    addressing: 'plural',
    dedication: '¡Por fin haremos el viaje de nuestras vidas! Nos encantaría que nos acompañen en este momento tan especial.',
    partySize: 2,
  },
  {
    inviteId: 'e7d525051ee244f59859',
    slug: 'jorgito-jeimmy-y-miguelito',
    displayName: 'Jorgito, Jeimmy y Miguelito',
    addressing: 'plural',
    dedication: '¡Por fin haremos el viaje de nuestras vidas! Nos encantaría que nos acompañen en este momento tan especial.',
    partySize: 3,
  },
  {
    inviteId: '69d6d78fcdbf43d5a31e',
    slug: 'rocio-y-luciana',
    displayName: 'Rocío y Luciana',
    addressing: 'plural',
    dedication: 'Tener a una actriz en nuestra boda sería inolvidable',
    partySize: 2,
  },
  {
    inviteId: '9799920db0d846ce985f',
    slug: 'natalia-y-majito',
    displayName: 'Natalia y Majito',
    addressing: 'plural',
    dedication: '¿Podría una celebración ser la misma sin Majito? Lo dudamos',
    partySize: 2,
  },
  {
    inviteId: '300dc81f467943a9a2d8',
    slug: 'cristian-y-angela',
    displayName: 'Cristian y Ángela',
    addressing: 'plural',
    dedication: 'Ingeniero, abogada, acompáñennos en este viaje',
    partySize: 2,
  },
  {
    inviteId: 'c54c13d6d5d74fa0a5b4',
    slug: 'juliana-bohorquez',
    displayName: 'Juliana Bohórquez',
    addressing: 'plural',
    dedication: 'Acompáñanos, prima. Que sea la excusa para disfrutar, celebrar, compartir... Ven con tu novio',
    partySize: 2,
  },
  {
    inviteId: '34a729f33dd64618957e',
    slug: 'lina-y-braian',
    displayName: 'Lina y Braian',
    addressing: 'plural',
    dedication: '6 meses nos separó el nacimiento. Ahora, lo mismo... Acompáñennos y hagámoslo tradición.',
    partySize: 2,
  },
  {
    inviteId: '5b03eb3621634555acf9',
    slug: 'daniela-y-pepe',
    displayName: 'Daniela y Pepe',
    addressing: 'plural',
    dedication: 'No podrá ir, pero podemos tomarnos un Tequila y celebrarlo juntos...',
    partySize: 2,
  },
  {
    inviteId: 'e6983c400353492ab1f5',
    slug: 'bivi-kike-y-oli',
    displayName: 'Bivi, Kike y Oli',
    addressing: 'plural',
    dedication: '¿Qué tanto le gusta la playa a Olivia?',
    partySize: 3,
  },
  {
    inviteId: 'aa9d50cec93c46ffac99',
    slug: 'sofi-bohorquez',
    displayName: 'Sofi Bohórquez',
    addressing: 'plural',
    dedication: 'Acompáñanos, negrita. Que sea la excusa para disfrutar, celebrar, compartir... Ven con tu novio',
    partySize: 2,
  },
  {
    inviteId: 'a6fea2b0cef947a1b07e',
    slug: 'aleja-y-julian',
    displayName: 'Aleja y Julián',
    addressing: 'plural',
    dedication: 'Si pensamos en las personas con quienes queremos celebrar lo bonito de la vida, inevitablemente aparecen ustedes.',
    partySize: 2,
  },
  {
    inviteId: '1bb7bd1f2f72431490b7',
    slug: 'luisa-bohorquez',
    displayName: 'Luisa Bohórquez',
    addressing: 'plural',
    dedication: 'Eras una bebé, ahora toda una productora audiovisual. Trae a tu novio, no se lo contaremos a tus papás...',
    partySize: 2,
  },
  {
    inviteId: 'ecab31cd03204f08a672',
    slug: 'tatiana-bohorquez',
    displayName: 'Tatiana Bohórquez',
    addressing: 'plural',
    dedication: 'Es increíble cómo creciste y ya estás en la U. Ven con tu novio, no se lo diremos a mi tío...',
    partySize: 2,
  },
  {
    inviteId: '6e311c52ae0147968f30',
    slug: 'camilo-y-paula',
    displayName: 'Camilo y Paula',
    addressing: 'plural',
    dedication: 'Hay personas que convierten cualquier encuentro en un buen recuerdo. Por eso queremos que también estén en este.',
    partySize: 2,
  },
  {
    inviteId: 'a8bd63a2c7d046398287',
    slug: 'jessica-bohorquez',
    displayName: 'Jessica Bohórquez',
    addressing: 'singular',
    dedication: 'La vida nos ha llevado por lugares distintos, pero hay personas con las que siempre vale la pena volver a coincidir. Esta vez será junto al mar.',
    partySize: 1,
  },
  {
    inviteId: '5c81b98304404ffebe03',
    slug: 'lucio-y-otilia',
    displayName: 'Lucio y Otilia',
    addressing: 'plural',
    dedication: 'Abuelo, sería un honor poder contar con su presencia en este día tan importante para nosotros',
    partySize: 2,
  },
  {
    inviteId: 'ff954e4570c9490a9a04',
    slug: 'edgar-jineth-y-tomas',
    displayName: 'Edgar, Jineth y Tomás',
    addressing: 'plural',
    dedication: 'Dentro de unos años lo recordaremos todo. Nos encanta pensar que ustedes también estarán en ese recuerdo.',
    partySize: 2,
  },
  {
    inviteId: '642359c2d97145dfa19a',
    slug: 'giovani-claudia-y-samuel',
    displayName: 'Giovani, Claudia y Samuel',
    addressing: 'plural',
    dedication: 'Esta boda reúne muchas cosas que queremos, pero sobre todo, gente que queremos mucho. Ahí entran ustedes.',
    partySize: 3,
  },
  {
    inviteId: '4cd8c59c14224f6791ff',
    slug: 'rodrigo-paola-y-mariana',
    displayName: 'Rodrigo, Paola y Mariana',
    addressing: 'plural',
    dedication: 'No sabemos qué historias saldrán de estos días, pero sí que serán mejores si ustedes están ahí para vivirlas con nosotros',
    partySize: 3,
  },
  {
    inviteId: 'dac46f8954db46f48e34',
    slug: 'nancy-deivy-y-nahia',
    displayName: 'Nancy, Deivy y Nahia',
    addressing: 'plural',
    dedication: 'Tía, que sea una excusa para comenzar de nuevo. Les esperamos',
    partySize: 3,
  },
  {
    inviteId: '13d4b0bb0168468ca1c9',
    slug: 'paola-y-camilo',
    displayName: 'Paola y Camilo',
    addressing: 'plural',
    dedication: '¡Por fin haremos el viaje de nuestras vidas! Nos encantaría que nos acompañen en este momento tan especial.',
    partySize: 2,
  },
  {
    inviteId: '137c9efe387a4b90aa3c',
    slug: 'laura-tatan-y-abril',
    displayName: 'Laura, Tatan y Abril',
    addressing: 'plural',
    dedication: '¿Puede una celebración ser la misma sin las travesuras de Abril?',
    partySize: 3,
  },
  {
    inviteId: 'c7c5b7a947134b12b88a',
    slug: 'maria-arias',
    displayName: 'María Arias',
    addressing: 'singular',
    dedication: 'Abuela, nos encantaría que nos acompañes en este viaje tan importante',
    partySize: 1,
  },
  {
    inviteId: '292d65a9a7e4470b829d',
    slug: 'bernardino-y-bety',
    displayName: 'Bernardino y Bety',
    addressing: 'plural',
    dedication: 'Hay viajes que no tendrían sentido sin ciertas personas. ¿Nos acompañarían?',
    partySize: 2,
  },
  {
    inviteId: 'a8193d89788443259f71',
    slug: 'maira-gabriel-y-emi',
    displayName: 'Maira, Gabriel y Emi',
    addressing: 'plural',
    dedication: '¿Cómo podría iniciar este viaje sin la presencia de mi mejor amigo?',
    partySize: 3,
  },
  {
    inviteId: '7f34caf072a04c5b8136',
    slug: 'rosa-y-mac',
    displayName: 'Rosa y MAC',
    addressing: 'plural',
    dedication: 'Todos los hombres deberíamos encontrar una rosa para nuestra vida. Ya encontré la mía. Acompáñennos',
    partySize: 2,
  },
  {
    inviteId: '854722363a3442509fc4',
    slug: 'marti-g-y-tere',
    displayName: 'Marti G. y Tere',
    addressing: 'plural',
    dedication: '¿Quién más que ustedes podrían poner el mejor y más actual reguetón en nuestra celebración?',
    partySize: 2,
  },
  {
    inviteId: '3404f7bbb87342819fc4',
    slug: 'leydy-aleen-y-david-arturo',
    displayName: 'Leydy Aleen y David Arturo',
    addressing: 'plural',
    dedication: 'Viejitos, tortolitos... La familia va mucho más allá de la sangre y las fronteras',
    partySize: 2,
  },
  {
    inviteId: '3fd6a8cd46bd4996905f',
    slug: 'jason-y-lucia',
    displayName: 'Jason y Lucía',
    addressing: 'plural',
    dedication: 'Que sea una excusa para recomenzar',
    partySize: 2,
  },
  {
    inviteId: '5b7f779330a44caf971b',
    slug: 'lopez',
    displayName: 'López',
    addressing: 'singular',
    dedication: 'No habrá necesidad de que viajes en el barco, esta vez puede ser en avión',
    partySize: 1,
  },
  {
    inviteId: '79f90dc36ccb41dda79a',
    slug: 'male-y-arleth',
    displayName: 'Male y Arleth',
    addressing: 'plural',
    dedication: 'Hay personas que aparecen en distintos capítulos de la vida y, aun así, siempre se sienten cerca.',
    partySize: 2,
  },
  {
    inviteId: '333a1d30ae9c4920935d',
    slug: 'adelina-y-feliciano',
    displayName: 'Adelina y Feliciano',
    addressing: 'plural',
    dedication: 'Mami y papi, siempre me han acompañado en cada paso, esperamos tenerlos allí en este que es muy importante para nosotros dos',
    partySize: 2,
  },
  {
    inviteId: '91a6f86123754bcca835',
    slug: 'jenny-martin-y-fernando',
    displayName: 'Jenny, Martín y Fernando',
    addressing: 'plural',
    dedication: 'Hermana, siempre contamos la una con la otra. Deseamos de corazón que ustedes viajen a celebrar este momento con nosotros.',
    partySize: 3,
  },
  {
    inviteId: '1b6ce6927c2d4605bd0a',
    slug: 'stefania-y-matias',
    displayName: 'Stefanía y Matías',
    addressing: 'singular',
    dedication: 'Hermanita, nos hace muchísima ilusión que los dos puedan viajar a compartir este momento tan importante con nosotros.',
    partySize: 1,
  },
  {
    inviteId: '1b9ec50ae95b4fe59c56',
    slug: 'familia-elizeche-canete',
    displayName: 'Familia Elizeche Cañete',
    addressing: 'plural',
    dedication: 'Primadriher, nos hace muchísima ilusión que los tres puedan viajar a compartir esto con nosotros.',
    partySize: 3,
  },
  {
    inviteId: 'ad30e693020a42c79b2f',
    slug: 'miguelina-gonzalez',
    displayName: 'Miguelina Gonzalez',
    addressing: 'singular',
    dedication: 'Tía, nos encantaría que puedas acompañarnos en este viaje.',
    partySize: 1,
  },
  {
    inviteId: '6041463d60214b759b3d',
    slug: 'familia-canete-rolon',
    displayName: 'Familia Cañete Rolón',
    addressing: 'plural',
    dedication: 'Así como fui testigo de su gran día, hoy nos hace muchísima ilusión que viajen a celebrar nuestro inicio.',
    partySize: 2,
  },
  {
    inviteId: 'ee4c682f7a6a4b2487b4',
    slug: 'herminia-gonzalez',
    displayName: 'Herminia Gonzalez',
    addressing: 'singular',
    dedication: 'Tía, nos encantaría que puedas acompañarnos en este viaje.',
    partySize: 1,
  },
  {
    inviteId: 'cfa49aab928b42e78914',
    slug: 'sofia',
    displayName: 'Sofía',
    addressing: 'plural',
    dedication: 'Pri, celebrar en familia importante para nosotros. Nos encantaría que puedas acompañarnos en este viaje.',
    partySize: 2,
  },
  {
    inviteId: 'ff68c5890c4d414985f9',
    slug: 'nancy-gonzalez',
    displayName: 'Nancy Gonzalez',
    addressing: 'singular',
    dedication: 'Tía, nos encantaría que puedas acompañarnos en este viaje.',
    partySize: 1,
  },
  {
    inviteId: 'd0fbdd295c4743908987',
    slug: 'arami-benitez',
    displayName: 'Aramí Benitez',
    addressing: 'singular',
    dedication: 'Pri, celebrar en familia importante para nosotros. Nos encantaría que puedas acompañarnos en este viaje.',
    partySize: 1,
  },
  {
    inviteId: '5a96a6e297a247c7ade1',
    slug: 'taurino-y-perla',
    displayName: 'Taurino y Perla',
    addressing: 'plural',
    dedication: 'Tíos, nos encantaría que puedan acompañarnos en este viaje.',
    partySize: 2,
  },
  {
    inviteId: 'e683b6cf7dd54eec9f8a',
    slug: 'cristian-gonzalez',
    displayName: 'Cristian González',
    addressing: 'singular',
    dedication: 'Pri, celebrar en familia importante para nosotros. Nos encantaría que puedas acompañarnos en este viaje.',
    partySize: 1,
  },
  {
    inviteId: 'e7d0aee785554dedb288',
    slug: 'carlos-gonzalez',
    displayName: 'Carlos González',
    addressing: 'singular',
    dedication: 'Pri, celebrar en familia importante para nosotros. Nos encantaría que puedas acompañarnos en este viaje.',
    partySize: 1,
  },
  {
    inviteId: '53686006085045d1b7f8',
    slug: 'juan-angel-y-yohana',
    displayName: 'Juan Angel y Yohana',
    addressing: 'plural',
    dedication: 'Tíos, nos encantaría que puedan acompañarnos en este viaje.',
    partySize: 2,
  },
  {
    inviteId: '518679ba05b0460390b3',
    slug: 'isidro-y-rebecca',
    displayName: 'Isidro y Rebecca',
    addressing: 'plural',
    dedication: 'Tíos, nos encantaría que puedan acompañarnos en este viaje.',
    partySize: 2,
  },
  {
    inviteId: '97d3da7882df4bb19528',
    slug: 'lorenzo-y-patricia',
    displayName: 'Lorenzo y Patricia',
    addressing: 'plural',
    dedication: 'Tíos, nos encantaría que puedan acompañarnos en este viaje.',
    partySize: 2,
  },
  {
    inviteId: '820aaa6595434391927b',
    slug: 'casto-y-alda',
    displayName: 'Casto y Alda',
    addressing: 'plural',
    dedication: 'Tíos, nos encantaría que puedan acompañarnos en este viaje.',
    partySize: 2,
  },
  {
    inviteId: '423964c0d9f3451aa005',
    slug: 'efren-y-epifania',
    displayName: 'Efrén y Epifania',
    addressing: 'plural',
    dedication: 'Tío, nos encantaría que puedan acompañarnos en este viaje.s',
    partySize: 2,
  },
  {
    inviteId: 'd8870576fd504eabb5f2',
    slug: 'ercilia-y-cesar',
    displayName: 'Ercilia y Cesar',
    addressing: 'plural',
    dedication: 'Tíos, nos encantaría que puedan acompañarnos en este viaje.',
    partySize: 2,
  },
  {
    inviteId: '24e64b85e64e49b2a3a7',
    slug: 'fabian-lovatti',
    displayName: 'Fabián Lovatti',
    addressing: 'singular',
    dedication: 'Pri, celebrar en familia importante para nosotros. Nos encantaría que puedas acompañarnos en este viaje.',
    partySize: 1,
  },
  {
    inviteId: '7b0fa9ed08d7454bbd61',
    slug: 'fabiana-lovatti',
    displayName: 'Fabiana Lovatti',
    addressing: 'singular',
    dedication: 'Pri, celebrar en familia importante para nosotros. Nos encantaría que puedas acompañarnos en este viaje.',
    partySize: 1,
  },
  {
    inviteId: 'fc36dacf5ff74d95b621',
    slug: 'ercilia-y-manuel',
    displayName: 'Ercilia y Manuel',
    addressing: 'plural',
    dedication: 'Primos, celebrar en familia importante para nosotros. Nos encantaría que puedan acompañarnos en este viaje.',
    partySize: 2,
  },
  {
    inviteId: '8c81afa749544f8388f8',
    slug: 'david-lovatti',
    displayName: 'David Lovatti',
    addressing: 'singular',
    dedication: 'Pri, celebrar en familia importante para nosotros. Nos encantaría que puedas acompañarnos en este viaje.',
    partySize: 1,
  },
  {
    inviteId: '1937a5767920426194ae',
    slug: 'adrian-gonzalez',
    displayName: 'Adrian Gonzalez',
    addressing: 'singular',
    dedication: 'Tío, nos encantaría que puedas acompañarnos en este viaje.',
    partySize: 1,
  },
  {
    inviteId: '6fee008288f94fe58dbc',
    slug: 'ever-gonzalez',
    displayName: 'Ever Gonzalez',
    addressing: 'singular',
    dedication: 'Tío, nos encantaría que puedas acompañarnos en este viaje.',
    partySize: 1,
  },
  {
    inviteId: 'ded29fa6bf5f4a3dbf66',
    slug: 'liria-y-domiciano',
    displayName: 'Liria y Domiciano',
    addressing: 'plural',
    dedication: 'Tía, nos encantaría que puedan acompañarnos en este viaje.',
    partySize: 2,
  },
  {
    inviteId: '54979b18830049f7852d',
    slug: 'arsenio-y-leila',
    displayName: 'Arsenio y Leila',
    addressing: 'plural',
    dedication: 'Tíos, nos encantaría que puedan acompañarnos en este viaje.',
    partySize: 2,
  },
  {
    inviteId: '04996c461d36438b8cc3',
    slug: 'nelida-curis',
    displayName: 'Nélida Curis',
    addressing: 'singular',
    dedication: 'Pri, celebrar en familia importante para nosotros. Nos encantaría que puedas acompañarnos en este viaje.',
    partySize: 1,
  },
  {
    inviteId: 'fc9a5820dd0947c6b536',
    slug: 'felipe-curis',
    displayName: 'Felipe Curis',
    addressing: 'singular',
    dedication: 'Pri, celebrar en familia importante para nosotros. Nos encantaría que puedas acompañarnos en este viaje.',
    partySize: 1,
  },
  {
    inviteId: 'fdf73be7a4af405fac0e',
    slug: 'griselda-curis',
    displayName: 'Griselda Curis',
    addressing: 'singular',
    dedication: 'Pri, celebrar en familia importante para nosotros. Nos encantaría que puedas acompañarnos en este viaje.',
    partySize: 1,
  },
  {
    inviteId: '0fa3b6e93621469193c7',
    slug: 'ana-laura',
    displayName: 'Ana Laura',
    addressing: 'singular',
    dedication: '¡Por fin haremos "el viaje de nuestras vidas"! Nos encantaría que nos acompañes en este momento tan especial.',
    partySize: 1,
  },
  {
    inviteId: '5bda09c4134445209e4f',
    slug: 'alicia-y-rodrigo',
    displayName: 'Alicia y Rodrigo',
    addressing: 'plural',
    dedication: '¡Por fin haremos "el viaje de nuestras vidas"! Nos encantaría que nos acompañen en este momento tan especial.',
    partySize: 2,
  },
  {
    inviteId: 'fdb41f9560bc4de2b4e5',
    slug: 'adriana-y-manuel',
    displayName: 'Adriana y Manuel',
    addressing: 'plural',
    dedication: '¡Por fin haremos "el viaje de nuestras vidas"! Nos encantaría que nos acompañen en este momento tan especial.',
    partySize: 2,
  },
  {
    inviteId: '8b3338425aed42378842',
    slug: 'lorena-angel-y-hector',
    displayName: 'Lorena, Angel y Hector',
    addressing: 'plural',
    dedication: '¡Por fin haremos "el viaje de nuestras vidas"! Nos encantaría que nos acompañen en este momento tan especial.',
    partySize: 3,
  },
  {
    inviteId: 'd2180a8edcf74405bf91',
    slug: 'laura-beatriz',
    displayName: 'Laura Beatriz',
    addressing: 'singular',
    dedication: '¡Por fin haremos "el viaje de nuestras vidas"! Nos encantaría que nos acompañes en este momento tan especial.',
    partySize: 1,
  },
  {
    inviteId: '09ff27a864fb4e879e3f',
    slug: 'patricia-macarena',
    displayName: 'Patricia Macarena',
    addressing: 'singular',
    dedication: '¡Por fin haremos "el viaje de nuestras vidas"! Nos encantaría que nos acompañes en este momento tan especial.',
    partySize: 1,
  },
  {
    inviteId: '0b7ccdc33f11471c9037',
    slug: 'maria-lourdes',
    displayName: 'María Lourdes',
    addressing: 'singular',
    dedication: '¡Por fin haremos "el viaje de nuestras vidas"! Nos encantaría que nos acompañes en este momento tan especial.',
    partySize: 1,
  },
  {
    inviteId: '1c8871981b114fd2a6c5',
    slug: 'jessica-y-victor',
    displayName: 'Jéssica y Victor',
    addressing: 'plural',
    dedication: '¡Por fin haremos "el viaje de nuestras vidas"! Nos encantaría que nos acompañen en este momento tan especial.',
    partySize: 2,
  },
  {
    inviteId: 'f7d3ced57e144475b278',
    slug: 'natalia-y-michael',
    displayName: 'Natalia y Michael',
    addressing: 'plural',
    dedication: 'Fue hermoso ser parte de su gran día; ahora nos hace muchísima ilusión que ustedes dos viajen a nuestro momento especial.',
    partySize: 2,
  },
  {
    inviteId: '6854fc35cfa94144b051',
    slug: 'rodney-daniel',
    displayName: 'Rodney Daniel',
    addressing: 'singular',
    dedication: 'Amigo, prepara las maletas. Nos encantaría que viajes a acompañarnos en este paso tan importante para nosotros dos.',
    partySize: 1,
  },
  {
    inviteId: 'ff77d7967cf141ca9832',
    slug: 'sonia-y-derlis',
    displayName: 'Sonia y Derlis',
    addressing: 'plural',
    dedication: 'Nos haría muy felices que ambos compartan con nosotros este viaje romántico lleno de magia y amor.',
    partySize: 2,
  },
  {
    inviteId: 'fd0247b411da4c6cb0b9',
    slug: 'dahiana-y-raul',
    displayName: 'Dahiana y Raul',
    addressing: 'plural',
    dedication: 'Nos hace ilusión que sean parte de esta aventura: un viaje romántico lleno de magia y amor.',
    partySize: 3,
  },
  {
    inviteId: '273283db628f40a18db1',
    slug: 'maria-jose',
    displayName: 'Maria José',
    addressing: 'singular',
    dedication: 'Amiga, prepara las maletas. Me encantaría que viajes a acompañarnos en este paso tan importante para nosotros dos.',
    partySize: 1,
  },
  {
    inviteId: 'd6b138c93caf4ac0943f',
    slug: 'fatima-lezcano',
    displayName: 'Fátima Lezcano',
    addressing: 'singular',
    dedication: 'Para que nuestra boda sea perfecta, la noche debe estar estrellada. ¡Hacé maletas y cumplinos el deseo!',
    partySize: 1,
  },
  {
    inviteId: 'ff2e4cdd85ff47e3a1ad',
    slug: 'cristina-fernandez',
    displayName: 'Cristina Fernández',
    addressing: 'singular',
    dedication: 'Para que nuestra boda sea perfecta, la noche debe estar estrellada. ¡Hacé maletas y cumplinos el deseo!',
    partySize: 1,
  },
  {
    inviteId: 'd31c8cc8f4c143f19be3',
    slug: 'saidy-saifilin',
    displayName: 'Saidy Saifilin',
    addressing: 'singular',
    dedication: 'Para que nuestra boda sea perfecta, la noche debe estar estrellada. ¡Hacé maletas y cumplinos el deseo!',
    partySize: 1,
  },
  {
    inviteId: 'b1b6d4fcdd504b6fb90d',
    slug: 'camila-figueredo',
    displayName: 'Camila Figueredo',
    addressing: 'singular',
    dedication: 'Para que nuestra boda sea perfecta, la noche debe estar estrellada. ¡Hacé maletas y cumplinos el deseo!',
    partySize: 1,
  },
  {
    inviteId: '4ef79df46c3542cfb8b3',
    slug: 'ana-lia-silgueiro',
    displayName: 'Ana Lía Silgueiro',
    addressing: 'singular',
    dedication: 'Para que nuestra boda sea perfecta, la noche debe estar estrellada. ¡Hacé maletas y cumplinos el deseo!',
    partySize: 1,
  },
  {
    inviteId: '55a785f0ccbb476bb356',
    slug: 'yessica-duarte',
    displayName: 'Yessica Duarte',
    addressing: 'singular',
    dedication: 'Para que nuestra boda sea perfecta, la noche debe estar estrellada. ¡Hacé maletas y cumplinos el deseo!',
    partySize: 1,
  },
  {
    inviteId: '37a60aeb19774b46b3c0',
    slug: 'vanina-moran',
    displayName: 'Vanina Moran',
    addressing: 'singular',
    dedication: 'Para que nuestra boda sea perfecta, la noche debe estar estrellada. ¡Hacé maletas y cumplinos el deseo!',
    partySize: 1,
  },
  {
    inviteId: 'aded3e377abe4a2e8f92',
    slug: 'ana-insaurralde',
    displayName: 'Ana Insaurralde',
    addressing: 'singular',
    dedication: 'Para que nuestra boda sea perfecta, la noche debe estar estrellada. ¡Hacé maletas y cumplinos el deseo!',
    partySize: 1,
  },
  {
    inviteId: '003fe3605968452ea5ea',
    slug: 'federico-franco',
    displayName: 'Federico Franco',
    addressing: 'singular',
    dedication: 'Para que nuestra boda sea perfecta, la noche debe estar estrellada. ¡Hacé maletas y cumplinos el deseo!',
    partySize: 1,
  },
  {
    inviteId: 'a69a4235fab54d748c2c',
    slug: 'nathalia-gimenez',
    displayName: 'Nathalia Gimenez',
    addressing: 'singular',
    dedication: 'Para que nuestra boda sea perfecta, la noche debe estar estrellada. ¡Hacé maletas y cumplinos el deseo!',
    partySize: 1,
  },
  {
    inviteId: '3151e4a7c8234b6b9b03',
    slug: 'cesar-aguirre',
    displayName: 'César Aguirre',
    addressing: 'singular',
    dedication: 'Para que nuestra boda sea perfecta, la noche debe estar estrellada. ¡Hacé maletas y cumplinos el deseo!',
    partySize: 1,
  },
  {
    inviteId: '2f5fb7b355b84a858313',
    slug: 'guillermo-acosta',
    displayName: 'Guillermo Acosta',
    addressing: 'singular',
    dedication: 'Para que nuestra boda sea perfecta, la noche debe estar estrellada. ¡Hacé maletas y cumplinos el deseo!',
    partySize: 1,
  },
  {
    inviteId: '995fa8d26d814e8ca20a',
    slug: 'cecilia-garcia',
    displayName: 'Cecilia Garcia',
    addressing: 'singular',
    dedication: 'Para que nuestra boda sea perfecta, la noche debe estar estrellada. ¡Hacé maletas y cumplinos el deseo!',
    partySize: 1,
  },
  {
    inviteId: '2bae6cd6d3a04e208f4b',
    slug: 'fabiana-rojas',
    displayName: 'Fabiana Rojas',
    addressing: 'singular',
    dedication: 'Para que nuestra boda sea perfecta, la noche debe estar estrellada. ¡Hacé maletas y cumplinos el deseo!',
    partySize: 1,
  },
  {
    inviteId: '2595f12b486e499983bd',
    slug: 'bethania-maneglia',
    displayName: 'Bethania Maneglia',
    addressing: 'singular',
    dedication: 'Para que nuestra boda sea perfecta, la noche debe estar estrellada. ¡Hacé maletas y cumplinos el deseo!',
    partySize: 1,
  },
  {
    inviteId: 'c59403712a2840838925',
    slug: 'paz-ocampos',
    displayName: 'Paz Ocampos',
    addressing: 'singular',
    dedication: 'Para que nuestra boda sea perfecta, la noche debe estar estrellada. ¡Hacé maletas y cumplinos el deseo!',
    partySize: 1,
  },
  {
    inviteId: '20d93900292c40f8a292',
    slug: 'romina-paez',
    displayName: 'Romina Paez',
    addressing: 'singular',
    dedication: 'Para que nuestra boda sea perfecta, la noche debe estar estrellada. ¡Hacé maletas y cumplinos el deseo!',
    partySize: 1,
  },
  {
    inviteId: '6d687585571b4ecf96ea',
    slug: 'andrea-esquivel',
    displayName: 'Andrea Esquivel',
    addressing: 'singular',
    dedication: 'Para que nuestra boda sea perfecta, la noche debe estar estrellada. ¡Hacé maletas y cumplinos el deseo!',
    partySize: 1,
  },
  {
    inviteId: 'e9c3ba8138f944689250',
    slug: 'antonella-cristaldo',
    displayName: 'Antonella Cristaldo',
    addressing: 'singular',
    dedication: 'Para que nuestra boda sea perfecta, la noche debe estar estrellada. ¡Hacé maletas y cumplinos el deseo!',
    partySize: 1,
  },
  {
    inviteId: '00845bf989e044a8b8a7',
    slug: 'camila-gonzalez',
    displayName: 'Camila Gonzalez',
    addressing: 'singular',
    dedication: 'Para que nuestra boda sea perfecta, la noche debe estar estrellada. ¡Hacé maletas y cumplinos el deseo!',
    partySize: 1,
  },
  {
    inviteId: '2de56407ff8d42c59971',
    slug: 'ilusion-peralta',
    displayName: 'Ilusión Peralta',
    addressing: 'singular',
    dedication: 'Para que nuestra boda sea perfecta, la noche debe estar estrellada. ¡Hacé maletas y cumplinos el deseo!',
    partySize: 1,
  },
  {
    inviteId: 'ad20a80888b44eb6bc5e',
    slug: 'katerin-aranda',
    displayName: 'Katerin Aranda',
    addressing: 'singular',
    dedication: 'Para que nuestra boda sea perfecta, la noche debe estar estrellada. ¡Hacé maletas y cumplinos el deseo!',
    partySize: 1,
  },
  {
    inviteId: 'e3bcac5d394f4545b006',
    slug: 'nieves-azuaga',
    displayName: 'Nieves Azuaga',
    addressing: 'singular',
    dedication: 'Para que nuestra boda sea perfecta, la noche debe estar estrellada. ¡Hacé maletas y cumplinos el deseo!',
    partySize: 1,
  },
  {
    inviteId: 'd003663b130b4c289592',
    slug: 'viviana-benitez',
    displayName: 'Viviana Benitez',
    addressing: 'singular',
    dedication: 'Para que nuestra boda sea perfecta, la noche debe estar estrellada. ¡Hacé maletas y cumplinos el deseo!',
    partySize: 1,
  },
  {
    inviteId: '0e1c2327f4274f288913',
    slug: 'perla-y-jose',
    displayName: 'Perla y José',
    addressing: 'plural',
    dedication: 'Preparen las maletas. Nos encantaría que viajen a acompañarnos en este paso tan importante para nosotros dos.',
    partySize: 2,
  },
  {
    inviteId: '4cd6ac0156704c62b232',
    slug: 'edson',
    displayName: 'Edson',
    addressing: 'singular',
    dedication: 'Prepara las maletas. Nos encantaría que viajes a acompañarnos en este paso tan importante para nosotros dos.',
    partySize: 1,
  },
  {
    inviteId: 'f2effe38b0934bb4b35f',
    slug: 'ana-y-manuel',
    displayName: 'Ana y Manuel',
    addressing: 'plural',
    dedication: 'Fue hermoso ser parte de su gran día; ahora nos encantaría que ustedes dos viajen a nuestro momento especial.',
    partySize: 2,
  },
  {
    inviteId: 'b2530c87cc7c410ba942',
    slug: 'ever-pereira',
    displayName: 'Ever Pereira',
    addressing: 'singular',
    dedication: 'Ningún modelo macroeconómico predijo un viaje tan genial. Deja los datos un rato y acompañanos a celebrar.',
    partySize: 1,
  },
  {
    inviteId: 'acbd33aadff2452e81ca',
    slug: 'micaela-espinola',
    displayName: 'Micaela Espinola',
    addressing: 'singular',
    dedication: 'Ningún modelo macroeconómico predijo un viaje tan genial. Deja los datos un rato y acompañanos a celebrar.',
    partySize: 1,
  },
  {
    inviteId: 'c5481a09960b49eea761',
    slug: 'rebecca-ortiz',
    displayName: 'Rebecca Ortiz',
    addressing: 'singular',
    dedication: 'Ningún modelo macroeconómico predijo un viaje tan genial. Deja los datos un rato y acompañanos a celebrar.',
    partySize: 1,
  },
  {
    inviteId: 'f4ab14e316e44561836b',
    slug: 'mario-vera',
    displayName: 'Mario Vera',
    addressing: 'singular',
    dedication: 'Ningún modelo macroeconómico predijo un viaje tan genial. Deja los datos un rato y acompañanos a celebrar.',
    partySize: 1,
  },
  {
    inviteId: '36e1dada8f364165af3c',
    slug: 'elisa-vera',
    displayName: 'Elisa Vera',
    addressing: 'singular',
    dedication: 'Ningún modelo macroeconómico predijo un viaje tan genial. Deja los datos un rato y acompañanos a celebrar.',
    partySize: 1,
  },
  {
    inviteId: '91d691e987cf4582b80c',
    slug: 'carina-rios',
    displayName: 'Carina Rios',
    addressing: 'singular',
    dedication: 'Ningún modelo macroeconómico predijo un viaje tan genial. Deja los datos un rato y acompañanos a celebrar.',
    partySize: 1,
  },
  {
    inviteId: '93bd8fdf5e3f4a1d90f9',
    slug: 'cristhian-trinidad',
    displayName: 'Cristhian Trinidad',
    addressing: 'singular',
    dedication: 'Ningún modelo macroeconómico predijo un viaje tan genial. Deja los datos un rato y acompañanos a celebrar.',
    partySize: 1,
  },
  {
    inviteId: 'cdafb7edff80460abbf8',
    slug: 'andrea-roman',
    displayName: 'Andrea Román',
    addressing: 'singular',
    dedication: 'Ningún modelo macroeconómico predijo un viaje tan genial. Deja los datos un rato y acompañanos a celebrar.',
    partySize: 1,
  },
  {
    inviteId: '4a7ba56c03a74bfd8a95',
    slug: 'miguel-vega',
    displayName: 'Miguel Vega',
    addressing: 'singular',
    dedication: 'Ningún modelo macroeconómico predijo un viaje tan genial. Deja los datos un rato y acompañanos a celebrar.',
    partySize: 1,
  },
  {
    inviteId: '5712296b0f5e46c181b4',
    slug: 'luis-benitez',
    displayName: 'Luis Benitez',
    addressing: 'singular',
    dedication: 'Ningún modelo macroeconómico predijo un viaje tan genial. Deja los datos un rato y acompañanos a celebrar.',
    partySize: 1,
  },
  {
    inviteId: 'c7b8f423f3dc4a06aa11',
    slug: 'marcelo-rodriguez',
    displayName: 'Marcelo Rodriguez',
    addressing: 'singular',
    dedication: 'Ningún modelo macroeconómico predijo un viaje tan genial. Deja los datos un rato y acompañanos a celebrar.',
    partySize: 1,
  },];

/**
 * The real identity lookup -- resolves a guest by its stable inviteId,
 * never by slug/displayName (see Guest.inviteId's own doc comment for
 * why). This is what src/pages/i/[invite].astro's props are built from.
 */
export function getGuestByInviteId(inviteId: string): Guest | undefined {
  return guests.find((guest) => guest.inviteId === inviteId);
}

/**
 * Builds the `${slug}-${inviteId}` route param used under /i/ (see
 * src/pages/i/[invite].astro). The slug half is presentation only; the
 * inviteId half -- always this function's last 12+ characters, always
 * after the final guest-authored hyphen boundary of the slug -- is what
 * actually resolves the page.
 */
export function getInviteParam(guest: Guest): string {
  return `${guest.slug}-${guest.inviteId}`;
}

/** Resolves Guest.partySize, falling back by addressing when unset. */
export function getGuestPartySize(guest: Guest): number {
  if (typeof guest.partySize === 'number') return guest.partySize;
  return guest.addressing === 'singular' ? 1 : 2;
}

// Runs at module load, i.e. every `astro dev`/`astro build` -- this module
// only ever executes on the server/build side, never in the browser. Fails
// loudly and early, naming the offending guest and the length found, rather
// than letting an over-length dedication reach Cover.astro's height-fit
// fallback silently.
const MIN_INVITE_ID_LENGTH = 12;
const seenInviteIds = new Set<string>();
for (const guest of guests) {
  const visibleLength = getVisibleDedicationLength(guest.dedication);
  if (visibleLength > MAX_DEDICATION_LENGTH) {
    throw new Error(
      `[guests] La dedicatoria de "${guest.slug}" tiene ${visibleLength} caracteres visibles; ` +
        `el máximo permitido es ${MAX_DEDICATION_LENGTH}.`
    );
  }
  if (guest.inviteId.length < MIN_INVITE_ID_LENGTH) {
    throw new Error(
      `[guests] El inviteId de "${guest.slug}" tiene ${guest.inviteId.length} caracteres; ` +
        `el mínimo requerido es ${MIN_INVITE_ID_LENGTH}.`
    );
  }
  if (seenInviteIds.has(guest.inviteId)) {
    throw new Error(`[guests] inviteId duplicado: "${guest.inviteId}" (slug "${guest.slug}").`);
  }
  seenInviteIds.add(guest.inviteId);
}
