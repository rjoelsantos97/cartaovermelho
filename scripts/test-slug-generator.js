/**
 * Test slug generator with challenging Portuguese characters
 */

const { generateSeoFriendlySlug } = require('../src/lib/seo/slug-generator.ts');

// Test com caracteres especiais difíceis
const testTitles = [
  'Cristiano Ronaldo: Decisão Final! Será que volta?',
  'Pepe: "Renovação" confirmada - Emoção total!',
  'João Félix vs. Barcelona: Negociações em curso!',
  'Vitória de Guimarães: Açucarado êxito!',
  'FC Porto: Transferência milionária confirmada!',
  'Benfica: Paixão & Glória nos Açores!',
  'Sporting: Coração português bate forte!'
];

console.log('🧪 Testando gerador corrigido:');
testTitles.forEach((title, i) => {
  const slug = generateSeoFriendlySlug(title);
  const regex = /^[a-z0-9-]+$/;
  const hasSpecialChars = !regex.test(slug);
  console.log(`${i+1}. ${title}`);
  console.log(`   → ${slug}`);
  console.log(`   ✅ Limpo: ${!hasSpecialChars ? 'SIM' : 'NÃO'}`);
  if (hasSpecialChars) {
    const specialChars = slug.match(/[^a-z0-9-]/g) || [];
    console.log(`   ⚠️  Caracteres especiais: [${specialChars.join(', ')}]`);
  }
  console.log('');
});