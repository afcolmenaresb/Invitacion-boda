/**
 * Single source of truth for the "Hablar con GoTravel" CTA on page 9
 * (StayScene.astro) -- edit the phone number or the message template here,
 * nothing else needs to change.
 *
 * The number must be in international format, digits only (no "+", no
 * spaces, no dashes) -- that's what wa.me expects.
 */
export const GOTRAVEL_WHATSAPP_NUMBER = '595971570172';

/**
 * Builds the pre-filled WhatsApp message, personalized with the guest's
 * own display name. Kept as a function (not a static string) so the
 * greeting always matches whoever is actually looking at the page.
 */
export function getGoTravelWhatsAppMessage(guestName: string): string {
  return `Hola, soy ${guestName}. Estoy viendo la invitación de la boda de Fátima y Andrés y me gustaría conocer las opciones para hospedarme en el Grand Palladium Imbassaí y organizar el viaje con ustedes. ¿Podrían ayudarme? Muchas gracias.`;
}

/** Full wa.me URL, ready to use as an <a href>. */
export function getGoTravelWhatsAppUrl(guestName: string): string {
  const message = getGoTravelWhatsAppMessage(guestName);
  return `https://wa.me/${GOTRAVEL_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
