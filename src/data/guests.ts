export interface Guest {
  /** URL-safe slug, e.g. /estefi-y-matias. Lowercase, hyphen-separated, no ampersands. */
  slug: string;
  /** Guest name(s) as shown on the invitation. Recommended max 32 characters. */
  displayName: string;
  /** Personalized message. Recommended 55-110 characters, hard cap 130. */
  dedication: string;
}

// Test data only — the definitive guest list is not loaded yet.
export const guests: Guest[] = [
  {
    slug: 'ana',
    displayName: 'Ana',
    dedication: 'Gracias por acompañarnos en este nuevo comienzo.',
  },
  {
    slug: 'estefi-y-matias',
    displayName: 'Estefi y Matías',
    dedication: 'Hay viajes que no tendrían el mismo sentido sin ciertas personas.',
  },
  {
    slug: 'familia-gonzalez-benitez',
    displayName: 'Familia González Benítez',
    dedication:
      'Desde el primer encuentro supimos que esta familia sería parte esencial de la historia que hoy comenzamos a escribir juntos.',
  },
  {
    slug: 'maria-fernanda-y-juan-sebastian',
    displayName: 'María Fernanda y Juan Sebastián',
    dedication: 'Su presencia hará que este viaje tenga un sentido aún más especial para nosotros dos.',
  },
];

export function getGuestBySlug(slug: string): Guest | undefined {
  return guests.find((guest) => guest.slug === slug);
}

export type DedicationLength = 'short' | 'medium' | 'long';

export function getDedicationLength(dedication: string): DedicationLength {
  const length = dedication.length;
  if (length <= 70) return 'short';
  if (length <= 100) return 'medium';
  return 'long';
}
