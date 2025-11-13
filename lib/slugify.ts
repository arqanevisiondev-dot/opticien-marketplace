/**
 * Convertit un texte en slug URL-friendly
 * Exemple: "Aviator Classic" -> "aviator-classic"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD') // Décompose les caractères accentués
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/[^a-z0-9\s-]/g, '') // Garde seulement lettres, chiffres, espaces et tirets
    .trim()
    .replace(/\s+/g, '-') // Remplace les espaces par des tirets
    .replace(/-+/g, '-'); // Remplace les tirets multiples par un seul
}

/**
 * Génère un slug unique en ajoutant un suffixe si nécessaire
 * Exemple: "aviator-classic" -> "aviator-classic-2"
 */
export function generateUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  let slug = baseSlug;
  let counter = 1;
  
  while (existingSlugs.includes(slug)) {
    counter++;
    slug = `${baseSlug}-${counter}`;
  }
  
  return slug;
}
