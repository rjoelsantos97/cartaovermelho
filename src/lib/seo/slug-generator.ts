/**
 * SEO Slug Generator for Cartão Vermelho News
 * Generates SEO-friendly URLs from article titles
 */

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    // Replace Portuguese special characters
    .replace(/[àáâãä]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[ñ]/g, 'n')
    .replace(/[ý]/g, 'y')
    // Remove other special characters and replace with spaces
    .replace(/[^\w\s-]/g, ' ')
    // Replace multiple spaces with single space
    .replace(/\s+/g, ' ')
    // Trim and replace spaces with hyphens
    .trim()
    .replace(/\s/g, '-')
    // Remove multiple consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-|-$/g, '')
    // Limit length to 100 characters for optimal SEO
    .substring(0, 100)
    // Remove trailing hyphen if substring cut in the middle
    .replace(/-$/, '');
}

export function generateSeoFriendlySlug(title: string): string {
  // Remove common dramatic words that don't add SEO value
  const cleanTitle = title
    .replace(/BOMBA TOTAL[:\s]*/gi, '')
    .replace(/ÚLTIMA HORA[:\s]*/gi, '')
    .replace(/CHOCA[:\s]*/gi, 'choca-')
    .replace(/DRAMÁTICA?[:\s]*/gi, 'dramatica-')
    .replace(/ÉPICA?[:\s]*/gi, 'epica-')
    .replace(/ABSOLUTAMENTE[:\s]*/gi, '')
    .replace(/TOTALMENTE[:\s]*/gi, '')
    .replace(/INCRÍVEL[:\s]*/gi, 'incrivel-')
    .replace(/MUNDO DO FUTEBOL/gi, 'mundo-futebol')
    .replace(/SELEÇÃO PORTUGUESA/gi, 'selecao-portuguesa')
    .replace(/BENFICA/gi, 'benfica')
    .replace(/PORTO/gi, 'porto')
    .replace(/SPORTING/gi, 'sporting')
    .replace(/CRISTIANO RONALDO/gi, 'cristiano-ronaldo')
    .replace(/PEPE/gi, 'pepe')
    .replace(/BRUNO FERNANDES/gi, 'bruno-fernandes')
    .replace(/JOÃO FÉLIX/gi, 'joao-felix')
    .replace(/RAFAEL LEÃO/gi, 'rafael-leao');

  return generateSlug(cleanTitle);
}

export function validateSlug(slug: string): boolean {
  // Check if slug is valid (not empty, reasonable length, valid characters)
  return slug.length > 0 && 
         slug.length <= 100 && 
         /^[a-z0-9-]+$/.test(slug) && 
         !slug.startsWith('-') && 
         !slug.endsWith('-');
}

export function ensureUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  let slug = baseSlug;
  let counter = 1;
  
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}