import type { Guest } from './guests';

/**
 * Single source of truth for the ninth scene's copy ("Tu estadía",
 * reached from KeepsakeScene's own primary CTA). StayScene.astro renders
 * these values; nothing about this text lives in InvitationExperience.astro
 * or any animation script -- same convention as sceneMemory.ts/.../
 * sceneKeepsake.ts.
 *
 * The RSVP question/options/confirmations all depend on Guest.addressing
 * -- see the getStay* helpers below.
 */
export const sceneStay = {
  eyebrow: 'Tu estadía',
  // Singular/plural title -- see getStayTitle below. Also reused as-is by
  // the page-3 shortcut (TravelInfo, #informacion-viaje), which renders
  // this same StayScene component with its own guest's addressing.
  title: {
    singular: 'Quédate donde todo sucede',
    plural: 'Quédense donde todo sucede',
  },
  body: [
    'Entre el mar y la reserva natural.',
    'Todo incluido.',
    'Días para descansar, comer bien y seguir celebrando juntos.',
  ],
  highlights: ['Todo incluido', 'Playa & naturaleza', 'Días para compartir'],
  ctaGoTravel: 'Hablar con GoTravel',
  rsvpQuestion: {
    singular: '¿Crees que podrás acompañarnos?',
    plural: '¿Creen que podrán acompañarnos?',
  },
  rsvpOptions: {
    singular: {
      attending: 'Sí, quiero estar ahí',
      maybe: 'Todavía no lo sé',
      not_attending: 'No podré acompañarlos',
    },
    plural: {
      attending: 'Sí, queremos estar ahí',
      maybe: 'Todavía no lo sabemos',
      not_attending: 'No podremos acompañarlos',
    },
  },
  // Shown right after a successful save -- "confirmación breve y
  // elegante", never a modal/alert, just a quiet inline line next to the
  // options (see StayScene's own script).
  rsvpConfirmation: {
    singular: {
      attending: 'Qué alegría -- ya sabemos que estarás ahí.',
      maybe: 'Gracias por avisarnos. Puedes cambiar tu respuesta cuando quieras.',
      not_attending: 'Gracias por avisarnos -- te vamos a extrañar.',
    },
    plural: {
      attending: 'Qué alegría -- ya sabemos que estarán ahí.',
      maybe: 'Gracias por avisarnos. Pueden cambiar su respuesta cuando quieran.',
      not_attending: 'Gracias por avisarnos -- los vamos a extrañar.',
    },
  },
  rsvpError: 'No pudimos guardar tu respuesta. Intenta de nuevo en un momento.',
  backLabel: 'Volver al recuerdo',
  backVisibleLabel: 'Recuerdo',
};

/** Derives StayScene's RSVP question from Guest.addressing alone. */
/** Derives StayScene's title from Guest.addressing alone. */
export function getStayTitle(addressing: Guest['addressing']): string {
  return sceneStay.title[addressing];
}

export function getStayRsvpQuestion(addressing: Guest['addressing']): string {
  return sceneStay.rsvpQuestion[addressing];
}

/** Derives StayScene's three RSVP option labels from Guest.addressing alone. */
export function getStayRsvpOptions(addressing: Guest['addressing']) {
  return sceneStay.rsvpOptions[addressing];
}

/** Derives StayScene's post-save confirmation copy from Guest.addressing alone. */
export function getStayRsvpConfirmations(addressing: Guest['addressing']) {
  return sceneStay.rsvpConfirmation[addressing];
}
