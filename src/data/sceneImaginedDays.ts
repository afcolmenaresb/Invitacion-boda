/**
 * Single source of truth for the fifth scene's copy ("imagina esos días",
 * reached from JourneyScene's own primary CTA). ImaginedDaysScene.astro
 * renders these values; nothing about this text lives in
 * InvitationExperience.astro or any animation script -- same convention as
 * sceneMemory.ts/sceneDestination.ts/sceneJourney.ts.
 *
 * No Guest.addressing dependency here -- unlike the previous three scenes,
 * none of this copy singles out the guest directly (it's all imagined,
 * shared moments), so there is no singular/plural variant to derive.
 */
export const sceneImaginedDays = {
  eyebrow: 'Imagina esos días',
  // Shown one at a time, each fading in, holding, then fading out again --
  // never all three at once (see ImaginedDaysScene's own [data-imagined-
  // memory] keyframe animations). A '\n' inside an entry is a deliberate,
  // fixed line break within that one phrase (not a new phrase).
  memories: [
    'Aquella mañana en que nadie puso alarma.',
    'Ese almuerzo que terminó casi al atardecer.',
    'La conversación que empezó en la playa\ny siguió hasta la noche.',
  ],
  // The closing statement -- stays on screen (never fades back out like
  // the memories above) and carries more visual weight, per spec.
  closing: 'Todavía no ha pasado.\nPero ya podemos imaginarlo.',
  ctaPrimary: 'Y entonces, el “sí”',
  backLabel: 'Volver al viaje',
  backVisibleLabel: 'Viaje',
};
